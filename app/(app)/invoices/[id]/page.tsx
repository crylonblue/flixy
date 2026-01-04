import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvoiceView from '@/components/invoices/invoice-view'
import StatusUpdater from '@/components/invoices/status-updater'

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !invoice) {
    redirect('/invoices')
  }

  // Check if user has access
  const { data: companyUsers } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', user.id)
    .eq('company_id', invoice.company_id)
    .single()

  if (!companyUsers) {
    redirect('/invoices')
  }

  // Get company data
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', invoice.company_id)
    .single()

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-headline">
            {invoice.invoice_number || 'Rechnung'}
          </h1>
          <p className="mt-2 text-meta">
            Status: {invoice.status}
          </p>
        </div>
        <StatusUpdater invoice={invoice} />
      </div>

      <InvoiceView invoice={invoice} company={company} />
    </div>
  )
}

