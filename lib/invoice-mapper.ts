import type { Invoice as PDFInvoice } from './schema'
import type { Invoice as DBInvoice, IssuerSnapshot, CustomerSnapshot, LineItem } from '@/types'

/**
 * Maps database invoice format to PDF invoice schema format
 */
export function mapDBInvoiceToPDFInvoice(
  dbInvoice: DBInvoice,
  issuerSnapshot: IssuerSnapshot | null,
  customerSnapshot: CustomerSnapshot,
  companyLogoUrl?: string | null
): PDFInvoice {
  const lineItems = (dbInvoice.line_items as unknown as LineItem[]) || []
  
  // Calculate tax rate from line items (assuming all items have same rate)
  const taxRate = lineItems.length > 0 && lineItems[0].vat_rate ? lineItems[0].vat_rate : 19

  // Map line items
  const items = lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit: 'stück', // Default unit (lowercase for ZUGFeRD mapping), could be stored in line_items if needed
    unitPrice: item.unit_price,
  }))

  // Map issuer/seller
  const seller = issuerSnapshot
    ? {
        name: issuerSnapshot.name,
        subHeadline: undefined,
        address: {
          street: issuerSnapshot.address.street,
          streetNumber: issuerSnapshot.address.streetnumber,
          postalCode: issuerSnapshot.address.zip,
          city: issuerSnapshot.address.city,
          country: issuerSnapshot.address.country,
        },
        phoneNumber: undefined,
        taxNumber: issuerSnapshot.tax_id,
        vatId: issuerSnapshot.vat_id,
      }
    : {
        name: '',
        subHeadline: undefined,
        address: {
          street: '',
          streetNumber: '',
          postalCode: '',
          city: '',
          country: 'DE',
        },
        phoneNumber: undefined,
        taxNumber: undefined,
        vatId: undefined,
      }

  // Map customer
  const customer = {
    name: customerSnapshot.name,
    address: {
      street: customerSnapshot.address.street,
      streetNumber: customerSnapshot.address.streetnumber,
      postalCode: customerSnapshot.address.zip,
      city: customerSnapshot.address.city,
      country: customerSnapshot.address.country,
    },
    phoneNumber: undefined,
    additionalInfo: customerSnapshot.email ? [customerSnapshot.email] : undefined,
  }

  // Map bank details
  const bankDetails = issuerSnapshot?.bank_details?.iban
    ? {
        iban: issuerSnapshot.bank_details.iban,
        bankName: issuerSnapshot.bank_details.bank_name || '',
      }
    : undefined

  return {
    invoiceNumber: dbInvoice.invoice_number || '',
    invoiceDate: dbInvoice.invoice_date || new Date().toISOString().split('T')[0],
    serviceDate: dbInvoice.invoice_date || new Date().toISOString().split('T')[0], // Use invoice_date as service_date
    seller,
    customer,
    items,
    taxRate,
    currency: 'EUR',
    note: undefined,
    logoUrl: companyLogoUrl || undefined,
    bankDetails,
  }
}

