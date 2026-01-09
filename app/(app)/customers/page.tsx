import { createClient } from '@/lib/supabase/server'
import CustomersTable from '@/components/customers/customers-table'
import CustomersPageHeader from '@/components/customers/customers-page-header'
import CustomersEmptyState from '@/components/customers/customers-empty-state'

export default async function CustomersPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: companyUsers } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', user.id)

  const companyIds = companyUsers?.map((cu) => cu.company_id) || []

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .in('company_id', companyIds)
    .order('name')

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="message-error">
          Fehler beim Laden der Kunden: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <CustomersPageHeader />

      {customers && customers.length === 0 ? (
        <CustomersEmptyState />
      ) : (
        <CustomersTable customers={customers || []} />
      )}
    </div>
  )
}

