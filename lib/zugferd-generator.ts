import { zugferd } from "node-zugferd";
import { EN16931 } from "node-zugferd/profile/en16931";
import type { Invoice } from "./schema";

/**
 * Maps invoice data to ZUGFeRD/XRechnung format
 * This function is shared between PDF embedding and XML-only generation
 */
function mapInvoiceToZugferdData(invoice: Invoice) {
  // Calculate totals exactly as in PDF generator, then round for ZUGFeRD (max 2 decimal places)
  const netTotalUnrounded = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmountUnrounded = netTotalUnrounded * (invoice.taxRate / 100);
  const grossTotalUnrounded = netTotalUnrounded + taxAmountUnrounded;
  
  // Round to 2 decimal places for ZUGFeRD compliance
  const netTotal = parseFloat((Math.round(netTotalUnrounded * 100) / 100).toFixed(2));
  const taxAmount = parseFloat((Math.round(taxAmountUnrounded * 100) / 100).toFixed(2));
  const grossTotal = parseFloat((Math.round(grossTotalUnrounded * 100) / 100).toFixed(2));

  // Ensure VAT ID has country prefix (required by ZUGFeRD)
  const sellerVatId = invoice.seller.vatId
    ? invoice.seller.vatId.startsWith(invoice.seller.address.country)
      ? invoice.seller.vatId
      : `${invoice.seller.address.country}${invoice.seller.vatId}`
    : undefined;

  // Map invoice data to ZUGFeRD EN16931 format (XRechnung standard)
  return {
    netTotal,
    taxAmount,
    grossTotal,
    zugferdData: {
      number: invoice.invoiceNumber,
      issueDate: invoice.invoiceDate,
      typeCode: "380", // Commercial invoice (ZUGFeRD type code)
      currency: invoice.currency,
      transaction: {
        tradeAgreement: {
          seller: {
            name: invoice.seller.name,
            postalAddress: {
              countryCode: invoice.seller.address.country as any,
              postcode: invoice.seller.address.postalCode,
              lineOne: `${invoice.seller.address.street} ${invoice.seller.address.streetNumber}`,
              city: invoice.seller.address.city,
            },
            taxRegistration:
              sellerVatId || invoice.seller.taxNumber
                ? {
                    vatIdentifier: sellerVatId,
                    localIdentifier: invoice.seller.taxNumber
                      ? invoice.seller.taxNumber
                      : undefined,
                  }
                : undefined,
          },
          buyer: {
            name: invoice.customer.name,
            postalAddress: {
              countryCode: invoice.customer.address.country as any,
              postcode: invoice.customer.address.postalCode,
              lineOne: `${invoice.customer.address.street} ${invoice.customer.address.streetNumber}`,
              city: invoice.customer.address.city,
            },
          },
        },
        tradeDelivery: {}, // Required but can be empty for EN16931 profile
        tradeSettlement: {
          currencyCode: invoice.currency as any,
          vatBreakdown: [
            {
              calculatedAmount: taxAmount,
              typeCode: "VAT" as const,
              basisAmount: netTotal,
              categoryCode: "S" as const,
              rateApplicablePercent: invoice.taxRate,
            },
          ],
          paymentMeans: invoice.bankDetails
            ? {
                iban: invoice.bankDetails.iban.replace(/\s/g, ""),
              }
            : undefined,
          paymentTerms: grossTotal > 0
            ? {
                dueDate: (() => {
                  const invoiceDate = new Date(invoice.invoiceDate);
                  invoiceDate.setDate(invoiceDate.getDate() + 14);
                  return invoiceDate.toISOString().split("T")[0];
                })(),
              }
            : undefined,
          monetarySummation: {
            lineTotalAmount: netTotal,
            taxBasisTotalAmount: netTotal,
            taxTotal: {
              amount: taxAmount,
              currencyCode: invoice.currency as any,
            },
            grandTotalAmount: grossTotal,
            duePayableAmount: grossTotal,
          },
        },
        line: invoice.items.map((item, index) => {
          const itemTotalUnrounded = item.quantity * item.unitPrice;
          const itemTotal = parseFloat((Math.round(itemTotalUnrounded * 100) / 100).toFixed(2));

          return {
            identifier: `LINE-${index + 1}`,
            tradeProduct: {
              name: item.description,
            },
            tradeAgreement: {
              netTradePrice: {
                chargeAmount: itemTotal,
                basisQuantity: {
                  amount: item.quantity,
                  unitMeasureCode: mapUnitToZugferdUnit(item.unit),
                },
              },
            },
            tradeDelivery: {
              billedQuantity: {
                amount: item.quantity,
                unitMeasureCode: mapUnitToZugferdUnit(item.unit),
              },
            },
            tradeSettlement: {
              tradeTax: {
                typeCode: "VAT" as const,
                categoryCode: "S" as const,
                rateApplicablePercent: invoice.taxRate,
              },
              monetarySummation: {
                lineTotalAmount: itemTotal,
              },
            },
          };
        }),
      },
      note: invoice.note ? [{ content: invoice.note }] : undefined,
    },
  };
}

/**
 * Generates ZUGFeRD XML from invoice data and embeds it into a PDF
 * @param invoice - The invoice data
 * @param pdfBuffer - The PDF buffer generated by pdf-lib
 * @returns PDF buffer with embedded ZUGFeRD XML (PDF/A-3b compliant)
 */
/**
 * Generates XRechnung/ZUGFeRD XML from invoice data (without PDF)
 * @param invoice - The invoice data
 * @returns XRechnung XML string (EN16931 compliant)
 */
export async function generateXRechnungXML(invoice: Invoice): Promise<string> {
  // Initialize ZUGFeRD invoicer with EN16931 profile (XRechnung standard)
  const invoicer = zugferd({
    profile: EN16931,
    strict: false, // Disable XSD schema validation to avoid Java dependency
  });

  // Map invoice data to ZUGFeRD format
  const { zugferdData } = mapInvoiceToZugferdData(invoice);

  // Create ZUGFeRD invoice
  const zugferdInvoice = invoicer.create(zugferdData as any);

  // Generate XML string
  const xmlString = await zugferdInvoice.toXML();

  return xmlString;
}

/**
 * Generates ZUGFeRD XML from invoice data and embeds it into a PDF
 * @param invoice - The invoice data
 * @param pdfBuffer - The PDF buffer generated by pdf-lib
 * @returns PDF buffer with embedded ZUGFeRD XML (PDF/A-3b compliant)
 */
export async function embedZugferdIntoPDF(
  invoice: Invoice,
  pdfBuffer: Uint8Array
): Promise<Uint8Array> {
  // Initialize ZUGFeRD invoicer with EN16931 profile (EU standard, more comprehensive)
  // Set strict: false to skip XSD validation (requires Java/xsd-schema-validator)
  // The XML structure is still validated by the library's schema validation
  const invoicer = zugferd({
    profile: EN16931,
    strict: false, // Disable XSD schema validation to avoid Java dependency
  });

  // Map invoice data to ZUGFeRD format (reuse shared function)
  const { zugferdData } = mapInvoiceToZugferdData(invoice);

  // Create ZUGFeRD invoice
  // Using 'as any' to work around strict typing in beta library
  const zugferdInvoice = invoicer.create(zugferdData as any);
  
  // Debug: Try to extract XML to verify values
  try {
    const xmlString = await zugferdInvoice.toXML();
    // Extract all monetary values from XML for verification
    const grandTotalMatch = xmlString.match(/<ram:GrandTotalAmount[^>]*>([^<]+)<\/ram:GrandTotalAmount>/);
    const taxTotalMatch = xmlString.match(/<ram:TaxTotalAmount[^>]*>([^<]+)<\/ram:TaxTotalAmount>/);
    const lineTotalMatch = xmlString.match(/<ram:LineTotalAmount[^>]*>([^<]+)<\/ram:LineTotalAmount>/);
    const taxBasisMatch = xmlString.match(/<ram:TaxBasisTotalAmount[^>]*>([^<]+)<\/ram:TaxBasisTotalAmount>/);
    
    console.log("ZUGFeRD XML extracted values:", {
      grandTotalAmount: grandTotalMatch ? grandTotalMatch[1] : "NOT FOUND",
      taxTotalAmount: taxTotalMatch ? taxTotalMatch[1] : "NOT FOUND",
      lineTotalAmount: lineTotalMatch ? lineTotalMatch[1] : "NOT FOUND",
      taxBasisTotalAmount: taxBasisMatch ? taxBasisMatch[1] : "NOT FOUND",
    });
    
    // Also check for any amount that might be 56.29
    const allAmounts = xmlString.match(/<ram:[^>]*Amount[^>]*>([^<]+)<\/ram:[^>]*>/g);
    if (allAmounts) {
      console.log("All amounts in XML:", allAmounts.slice(0, 10)); // First 10 amounts
    }
  } catch (e) {
    // Ignore if XML extraction fails
    console.log("Could not extract XML for debugging:", e);
  }

  // Embed ZUGFeRD XML into PDF and convert to PDF/A-3b using node-zugferd
  // Note: node-zugferd's embedInPdf handles PDF/A-3b conversion internally
  // However, there are known issues with XMP metadata encoding in the beta version
  // The PDF will contain ZUGFeRD XML and attempt PDF/A-3b compliance
  const pdfA = await zugferdInvoice.embedInPdf(pdfBuffer, {
    metadata: {
      title: `Rechnung ${invoice.invoiceNumber}`,
      author: invoice.seller.name,
      subject: `Invoice ${invoice.invoiceNumber}`,
      creator: invoice.seller.name,
      producer: "Invoice API",
      keywords: ["Invoice", "Rechnung", invoice.invoiceNumber, "ZUGFeRD", "EN16931"],
      createDate: new Date(invoice.invoiceDate),
      modifyDate: new Date(),
    },
  });

  return pdfA;
}

/**
 * Maps common unit strings to ZUGFeRD unit codes (UN/ECE Recommendation 20)
 */
function mapUnitToZugferdUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    hours: "HUR",
    hour: "HUR",
    h: "HUR",
    stunden: "HUR",
    stunde: "HUR",
    km: "KMT",
    kilometer: "KMT",
    m: "MTR",
    meter: "MTR",
    pcs: "C62",
    pieces: "C62",
    stück: "C62",
    stk: "C62",
    day: "DAY",
    days: "DAY",
    tag: "DAY",
    tage: "DAY",
    kg: "KGM",
    kilogram: "KGM",
    g: "GRM",
    gram: "GRM",
  };

  const normalizedUnit = unit.toLowerCase().trim();
  return unitMap[normalizedUnit] || "C62"; // Default to "pieces" if unknown
}

