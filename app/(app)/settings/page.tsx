import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompanySettings from '@/components/settings/company-settings'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's first company (for MVP, we assume one company per user)
  const { data: companyUsers } = await supabase
    .from('company_users')
    .select('company_id, role')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .limit(1)
    .single()

  if (!companyUsers) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="message-info">
          Sie haben keine Berechtigung, die Einstellungen zu ändern.
        </div>
      </div>
    )
  }

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyUsers.company_id)
    .single()

  if (error || !company) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="message-error">
          Fehler beim Laden der Firmendaten: {error?.message}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <CompanySettings company={company} />
    </div>
  )
}

