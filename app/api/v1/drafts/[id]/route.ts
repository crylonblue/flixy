import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey, unauthorized, notFound, badRequest, serverError, json } from '../../_lib/auth'

/**
 * GET /api/v1/drafts/:id
 * Get a single draft
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('company_id', auth.companyId)
    .eq('status', 'draft')
    .single()

  if (error || !data) {
    return notFound('Draft')
  }

  return json({ data })
}

/**
 * PATCH /api/v1/drafts/:id
 * Update a draft
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(request)
  if (!auth) return unauthorized()

  const { id } = await params

  let body: any
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const supabase = await createClient()

  // First check if draft exists and belongs to company
  const { data: existing } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('company_id', auth.companyId)
    .eq('status', 'draft')
    .single()

  if (!existing) {
    return notFound('Draft')
  }

  const { customer_id, line_items, invoice_date, due_date } = body

  // Build update object
  const updates: Record<string, any> = {}

  // Handle customer update
  if (customer_id !== undefined) {
    if (customer_id === null) {
      updates.customer_snapshot = null
    } else {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customer_id)
        .eq('company_id', auth.companyId)
        .single()

      if (customerError || !customer) {
        return badRequest('Customer not found')
      }

      updates.customer_snapshot = {
        id: customer.id,
        name: customer.name,
        address: customer.address,
        email: customer.email,
        vat_id: customer.vat_id,
      }
    }
  }

  // Handle line items update
  if (line_items !== undefined) {
    const processedLineItems = (line_items || []).map((item: any) => ({
      id: item.id || crypto.randomUUID(),
      description: item.description || '',
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      vat_rate: item.vat_rate ?? 19,
      total: (item.quantity || 1) * (item.unit_price || 0),
    }))

    const subtotal = processedLineItems.reduce((sum: number, item: any) => sum + item.total, 0)
    const vatAmount = processedLineItems.reduce(
      (sum: number, item: any) => sum + (item.total * item.vat_rate) / 100,
      0
    )

    updates.line_items = processedLineItems
    updates.subtotal = subtotal
    updates.vat_amount = vatAmount
    updates.total_amount = subtotal + vatAmount
  }

  if (invoice_date !== undefined) updates.invoice_date = invoice_date
  if (due_date !== undefined) updates.due_date = due_date

  if (Object.keys(updates).length === 0) {
    return badRequest('No fields to update')
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return serverError(error.message)
  }

  return json({ data })
}

/**
 * DELETE /api/v1/drafts/:id
 * Delete a draft
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const supabase = await createClient()

  // First check if draft exists and belongs to company
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', id)
    .eq('company_id', auth.companyId)
    .eq('status', 'draft')
    .single()

  if (!existing) {
    return notFound('Draft')
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) {
    return serverError(error.message)
  }

  return json({ success: true })
}
