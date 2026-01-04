import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DraftEditor from '@/components/drafts/draft-editor'

export default async function NewDraftPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's first company (or create one if none exists)
  const { data: companyUsers } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)

  let companyId: string | null = null

  if (companyUsers && companyUsers.length > 0) {
    companyId = companyUsers[0].company_id
  } else {
    // Create a default company for the user
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Mein Unternehmen',
        address: {
          street: '',
          city: '',
          zip: '',
          country: 'DE',
        },
        country: 'DE',
      })
      .select()
      .single()

    if (companyError || !newCompany) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="message-error">
            Fehler beim Erstellen des Unternehmens: {companyError?.message}
          </div>
        </div>
      )
    }

    // Create company_user relationship
    const { error: cuError } = await supabase.from('company_users').insert({
      user_id: user.id,
      company_id: newCompany.id,
      role: 'owner',
    })

    if (cuError) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="message-error">
            Fehler beim Verknüpfen des Unternehmens: {cuError.message}
          </div>
        </div>
      )
    }

    companyId = newCompany.id
  }

  // Create new draft
  const { data: draft, error: draftError } = await supabase
    .from('invoices')
    .insert({
      company_id: companyId!,
      status: 'draft',
      line_items: [],
      subtotal: 0,
      vat_amount: 0,
      total_amount: 0,
    })
    .select()
    .single()

  if (draftError || !draft) {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="message-error">
            Fehler beim Erstellen des Entwurfs: {draftError?.message}
          </div>
        </div>
    )
  }

  redirect(`/drafts/${draft.id}`)
}

