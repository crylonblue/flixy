import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey, unauthorized, notFound, badRequest, serverError, json } from '../../_lib/auth'

/**
 * GET /api/v1/customers/:id
 * Get a single customer
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
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('company_id', auth.companyId)
    .single()

  if (error || !data) {
    return notFound('Customer')
  }

  return json({ data })
}

/**
 * PATCH /api/v1/customers/:id
 * Update a customer
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

  const { name, address, email, vat_id } = body

  // Build update object with only provided fields
  const updates: Record<string, any> = {}
  if (name !== undefined) updates.name = name
  if (address !== undefined) updates.address = address
  if (email !== undefined) updates.email = email
  if (vat_id !== undefined) updates.vat_id = vat_id

  if (Object.keys(updates).length === 0) {
    return badRequest('No fields to update')
  }

  const supabase = await createClient()

  // First check if customer exists and belongs to company
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('id', id)
    .eq('company_id', auth.companyId)
    .single()

  if (!existing) {
    return notFound('Customer')
  }

  const { data, error } = await supabase
    .from('customers')
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
 * DELETE /api/v1/customers/:id
 * Delete a customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(request)
  if (!auth) return unauthorized()

  const { id } = await params
  const supabase = await createClient()

  // First check if customer exists and belongs to company
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('id', id)
    .eq('company_id', auth.companyId)
    .single()

  if (!existing) {
    return notFound('Customer')
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    return serverError(error.message)
  }

  return json({ success: true })
}
