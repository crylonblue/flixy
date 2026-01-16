import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { validateApiKey, unauthorized, notFound, badRequest, serverError, json } from '../../../_lib/auth'
import { getPresignedUrl } from '@/lib/s3'

/**
 * GET /api/v1/invoices/:id/pdf
 * Get a presigned URL for downloading the invoice PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, pdf_url, xml_url, invoice_number')
    .eq('id', id)
    .eq('company_id', auth.companyId)
    .neq('status', 'draft')
    .single()

  if (error || !invoice) {
    return notFound('Invoice')
  }

  if (!invoice.pdf_url) {
    return badRequest('PDF not available for this invoice')
  }

  try {
    const pdfPresignedUrl = await getPresignedUrl(invoice.pdf_url)
    
    // Also generate XML presigned URL if available
    let xmlPresignedUrl = null
    if (invoice.xml_url) {
      xmlPresignedUrl = await getPresignedUrl(invoice.xml_url)
    }

    return json({
      pdf_url: pdfPresignedUrl,
      xml_url: xmlPresignedUrl,
      expires_in: 3600, // 1 hour
    })
  } catch (err) {
    console.error('Error generating presigned URL:', err)
    return serverError('Failed to generate download URL')
  }
}
