import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/invoices/:id/pdf
 * Get the public URLs for downloading the invoice PDF and XML
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the invoice
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, company_id, pdf_url, xml_url, invoice_file_reference')
    .eq('id', id)
    .single()

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  // Check if user has access to this invoice's company
  const { data: companyUser } = await supabase
    .from('company_users')
    .select('id')
    .eq('user_id', user.id)
    .eq('company_id', invoice.company_id)
    .single()

  if (!companyUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const pdfUrl = invoice.pdf_url || invoice.invoice_file_reference

  if (!pdfUrl) {
    return NextResponse.json({ error: 'No PDF available' }, { status: 404 })
  }

  return NextResponse.json({ 
    url: pdfUrl,
    pdf_url: pdfUrl,
    xml_url: invoice.xml_url || null,
  })
}
