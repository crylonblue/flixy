import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey, unauthorized, badRequest, serverError, json } from '../_lib/auth'

/**
 * GET /api/v1/drafts
 * List all drafts for the company
 */
export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth) return unauthorized()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('company_id', auth.companyId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    return serverError(error.message)
  }

  return json({ data, count: data?.length ?? 0 })
}

/**
 * POST /api/v1/drafts
 * Create a new draft
 */
export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth) return unauthorized()

  let body: any
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const { customer_id, line_items, invoice_date, due_date } = body

  const supabase = await createClient()

  // If customer_id provided, fetch customer and create snapshot
  let customerSnapshot = null
  if (customer_id) {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customer_id)
      .eq('company_id', auth.companyId)
      .single()

    if (customerError || !customer) {
      return badRequest('Customer not found')
    }

    customerSnapshot = {
      id: customer.id,
      name: customer.name,
      address: customer.address,
      email: customer.email,
      vat_id: customer.vat_id,
    }
  }

  // Process line items - add IDs and calculate totals
  const processedLineItems = (line_items || []).map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    description: item.description || '',
    quantity: item.quantity || 1,
    unit_price: item.unit_price || 0,
    vat_rate: item.vat_rate ?? 19,
    total: (item.quantity || 1) * (item.unit_price || 0),
  }))

  // Calculate totals
  const subtotal = processedLineItems.reduce((sum: number, item: any) => sum + item.total, 0)
  const vatAmount = processedLineItems.reduce(
    (sum: number, item: any) => sum + (item.total * item.vat_rate) / 100,
    0
  )
  const totalAmount = subtotal + vatAmount

  // Set default dates if not provided
  const today = new Date()
  const defaultDueDate = new Date(today)
  defaultDueDate.setDate(defaultDueDate.getDate() + 30)

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      company_id: auth.companyId,
      status: 'draft',
      customer_snapshot: customerSnapshot,
      line_items: processedLineItems,
      invoice_date: invoice_date || formatDate(today),
      due_date: due_date || formatDate(defaultDueDate),
      subtotal,
      vat_amount: vatAmount,
      total_amount: totalAmount,
    })
    .select()
    .single()

  if (error) {
    return serverError(error.message)
  }

  return json({ data }, 201)
}
