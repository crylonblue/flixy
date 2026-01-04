import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DraftEditor from '@/components/drafts/draft-editor'

export default async function DraftPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: draft, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !draft) {
    redirect('/drafts')
  }

  // Check if user has access to this draft's company
  const { data: companyUsers } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', user.id)
    .eq('company_id', draft.company_id)
    .single()

  if (!companyUsers) {
    redirect('/drafts')
  }

  // Only allow editing if status is draft
  if (draft.status !== 'draft') {
    redirect(`/invoices/${draft.id}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <DraftEditor draft={draft} />
    </div>
  )
}

