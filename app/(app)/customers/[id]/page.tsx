import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomerEditor from '@/components/customers/customer-editor'

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !customer) {
    redirect('/customers')
  }

  // Check if user has access
  const { data: companyUsers } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', user.id)
    .eq('company_id', customer.company_id)
    .single()

  if (!companyUsers) {
    redirect('/customers')
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <CustomerEditor customer={customer} />
    </div>
  )
}

