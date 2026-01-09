import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPresignedUrl } from '@/lib/s3'

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
    .select('id, company_id, pdf_url, invoice_file_reference')
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

  const fileUrl = invoice.pdf_url || invoice.invoice_file_reference

  if (!fileUrl) {
    return NextResponse.json({ error: 'No PDF available' }, { status: 404 })
  }

  try {
    const presignedUrl = await getPresignedUrl(fileUrl)
    return NextResponse.json({ url: presignedUrl })
  } catch (err) {
    console.error('Error generating presigned URL:', err)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}
