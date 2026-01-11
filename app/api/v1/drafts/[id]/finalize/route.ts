import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey, unauthorized, notFound, badRequest, serverError, json } from '../../../_lib/auth'
import { generateInvoicePDF } from '@/lib/pdf-generator'
import { generateXRechnungXML } from '@/lib/zugferd-generator'
import { uploadToS3 } from '@/lib/s3'
import { mapDBInvoiceToPDFInvoice } from '@/lib/invoice-mapper'
import { validateXRechnungInvoice } from '@/lib/schema'
import type { Invoice as DBInvoice, IssuerSnapshot, CustomerSnapshot } from '@/types'

/**
 * POST /api/v1/drafts/:id/finalize
 * Finalize a draft - generates PDF/XML, uploads to S3, sets status to 'created'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const supabase = await createClient()

  // Fetch the draft
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('company_id', auth.companyId)
    .eq('status', 'draft')
    .single()

  if (invoiceError || !invoice) {
    return notFound('Draft')
  }

  const dbInvoice = invoice as DBInvoice
  const customerSnapshot = (dbInvoice.customer_snapshot as unknown as CustomerSnapshot)

  if (!customerSnapshot) {
    return badRequest('Customer is required before finalizing')
  }

  // Get company for logo URL and invoice number generation
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', auth.companyId)
    .single()

  if (!company) {
    return serverError('Company not found')
  }

  // Build issuer snapshot from company data
  const issuerSnapshot: IssuerSnapshot | null = {
    name: company.name,
    address: company.address as any,
    vat_id: company.vat_id || undefined,
    tax_id: company.tax_id || undefined,
    bank_details: company.bank_details ? {
      bank_name: (company.bank_details as any).bank_name,
      iban: (company.bank_details as any).iban,
      bic: (company.bank_details as any).bic,
      account_holder: (company.bank_details as any).account_holder,
    } : undefined,
    // XRechnung BR-DE-2: Seller Contact
    contact: (company.contact_name || company.contact_phone || company.contact_email) ? {
      name: company.contact_name || undefined,
      phone: company.contact_phone || undefined,
      email: company.contact_email || undefined,
    } : undefined,
  }

  // Generate invoice number if not set
  let invoiceNumber = dbInvoice.invoice_number
  if (!invoiceNumber) {
    // Get the next invoice number
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('company_id', auth.companyId)
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const prefix = company.invoice_number_prefix || 'INV-'
    const format = company.invoice_number_format || '0000'
    
    let nextNumber = 1
    if (lastInvoice?.invoice_number) {
      const match = lastInvoice.invoice_number.match(/(\d+)$/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    invoiceNumber = `${prefix}${String(nextNumber).padStart(format.length, '0')}`

    // Update the invoice with the number
    await supabase
      .from('invoices')
      .update({ invoice_number: invoiceNumber })
      .eq('id', id)
    
    // Update local reference
    dbInvoice.invoice_number = invoiceNumber
  }

  // Map database invoice to PDF invoice format
  const pdfInvoice = mapDBInvoiceToPDFInvoice(
    dbInvoice,
    issuerSnapshot,
    customerSnapshot,
    company?.logo_url
  )

  // Validate invoice for XRechnung compliance before generating
  const validation = validateXRechnungInvoice(pdfInvoice)
  if (!validation.valid) {
    return badRequest(`XRechnung-Validierung fehlgeschlagen: ${validation.errors.join(', ')}`)
  }
  
  // Log warnings but don't block finalization
  if (validation.warnings.length > 0) {
    console.log('XRechnung validation warnings:', validation.warnings)
  }

  // Generate PDF with embedded ZUGFeRD
  let pdfBuffer: Uint8Array
  let xmlString: string
  try {
    pdfBuffer = await generateInvoicePDF(pdfInvoice)
    xmlString = await generateXRechnungXML(pdfInvoice)
  } catch (err) {
    console.error('Error generating PDF/XML:', err)
    return serverError('Failed to generate invoice documents')
  }

  // Upload to S3
  let pdfUrl: string
  let xmlUrl: string
  try {
    pdfUrl = await uploadToS3(
      auth.userId,
      id,
      `${invoiceNumber}.pdf`,
      Buffer.from(pdfBuffer),
      'application/pdf'
    )

    xmlUrl = await uploadToS3(
      auth.userId,
      id,
      `${invoiceNumber}.xml`,
      Buffer.from(xmlString, 'utf-8'),
      'application/xml'
    )
  } catch (s3Error) {
    console.error('S3 upload error:', s3Error)
    return serverError('Failed to upload files')
  }

  // Update invoice status and file URLs
  const { data: updatedInvoice, error: updateError } = await supabase
    .from('invoices')
    .update({
      status: 'created',
      pdf_url: pdfUrl,
      xml_url: xmlUrl,
      finalized_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return serverError('Failed to update invoice status')
  }

  return json({
    data: updatedInvoice,
    pdf_url: pdfUrl,
    xml_url: xmlUrl,
  })
}
