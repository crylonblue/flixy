import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyDomain } from '@/lib/postmark'
import { EmailSettings } from '@/types'

/**
 * POST /api/domains/verify - Verify DNS records for custom domain
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the user's company
  const { data: companyUser } = await supabase
    .from('company_users')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!companyUser) {
    return NextResponse.json({ error: 'No company found' }, { status: 404 })
  }

  // Get current email settings
  const { data: company } = await supabase
    .from('companies')
    .select('email_settings')
    .eq('id', companyUser.company_id)
    .single()

  const currentSettings = (company?.email_settings as EmailSettings) || { mode: 'default' }

  if (!currentSettings.postmark_domain_id) {
    return NextResponse.json(
      { error: 'No custom domain configured' },
      { status: 400 }
    )
  }

  try {
    // Verify the domain in Postmark
    const result = await verifyDomain(currentSettings.postmark_domain_id)

    // Update email settings with verification status
    const newSettings: EmailSettings = {
      ...currentSettings,
      domain_verified: result.verified,
      domain_verified_at: result.verified ? new Date().toISOString() : undefined,
      dns_records: result.dns_records,
    }

    const { error: updateError } = await supabase
      .from('companies')
      .update({ email_settings: newSettings })
      .eq('id', companyUser.company_id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      verified: result.verified,
      dkim_verified: result.dkim_verified,
      return_path_verified: result.return_path_verified,
      dns_records: result.dns_records,
    })
  } catch (err) {
    console.error('Error verifying domain:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to verify domain' },
      { status: 500 }
    )
  }
}
