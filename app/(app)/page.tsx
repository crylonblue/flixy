import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user's companies
  const { data: companyUsers } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', user.id)

  const companyIds = companyUsers?.map((cu) => cu.company_id) || []

  // Get stats
  const [draftsResult, invoicesResult, recentInvoicesResult] = await Promise.all([
    supabase
      .from('invoices')
      .select('id', { count: 'exact' })
      .in('company_id', companyIds)
      .eq('status', 'draft'),
    supabase
      .from('invoices')
      .select('id', { count: 'exact' })
      .in('company_id', companyIds)
      .neq('status', 'draft'),
    supabase
      .from('invoices')
      .select('*')
      .in('company_id', companyIds)
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const draftsCount = draftsResult.count || 0
  const invoicesCount = invoicesResult.count || 0
  const recentInvoices = recentInvoicesResult.data || []

  // Calculate totals
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('total_amount')
    .in('company_id', companyIds)
    .neq('status', 'draft')

  const totalRevenue = allInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12">
        <h1 className="text-headline">Übersicht</h1>
        <p className="mt-2 text-meta">
          Willkommen zurück
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <Link
          href="/drafts"
          className="card block transition-colors hover:border-[var(--border-strong)]"
          style={{ textDecoration: 'none' }}
        >
          <div>
            <p className="text-meta mb-1">Entwürfe</p>
            <p className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {draftsCount}
            </p>
          </div>
        </Link>

        <Link
          href="/invoices"
          className="card block transition-colors hover:border-[var(--border-strong)]"
          style={{ textDecoration: 'none' }}
        >
          <div>
            <p className="text-meta mb-1">Rechnungen</p>
            <p className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {invoicesCount}
            </p>
          </div>
        </Link>

        <div className="card">
          <div>
            <p className="text-meta mb-1">Gesamtumsatz</p>
            <p className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Letzte Rechnungen
            </h2>
            <Link
              href="/invoices"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              Alle anzeigen →
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="card card-subtle p-8 text-center">
              <p className="text-secondary">Noch keine Rechnungen vorhanden.</p>
              <Link
                href="/drafts/new"
                className="mt-4 inline-block text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                Erste Rechnung erstellen →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => {
                const customerSnapshot = invoice.customer_snapshot as any
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="card block transition-colors hover:border-[var(--border-strong)]"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {invoice.invoice_number || 'Keine Nummer'}
                        </p>
                        <p className="mt-1 text-sm text-secondary">
                          {customerSnapshot?.name || 'Unbekannter Kunde'}
                        </p>
                        <p className="mt-1 text-xs text-meta">
                          {invoice.invoice_date &&
                            format(new Date(invoice.invoice_date), 'd. MMMM yyyy', { locale: de })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(invoice.total_amount)}
                        </p>
                        <span className="status-badge info mt-2 inline-block">
                          {invoice.status === 'created' ? 'Erstellt' : invoice.status === 'sent' ? 'Versendet' : 'Bezahlt'}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Schnellzugriff
            </h2>
          </div>

          <div className="space-y-3">
            <Link
              href="/drafts/new"
              className="card block transition-colors hover:border-[var(--border-strong)]"
              style={{ textDecoration: 'none' }}
            >
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Neuer Entwurf
                </p>
                <p className="mt-1 text-sm text-meta">
                  Rechnung erstellen
                </p>
              </div>
            </Link>

            <Link
              href="/customers"
              className="card block transition-colors hover:border-[var(--border-strong)]"
              style={{ textDecoration: 'none' }}
            >
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Kunden verwalten
                </p>
                <p className="mt-1 text-sm text-meta">
                  Kundenliste anzeigen
                </p>
              </div>
            </Link>

            <Link
              href="/settings"
              className="card block transition-colors hover:border-[var(--border-strong)]"
              style={{ textDecoration: 'none' }}
            >
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Einstellungen
                </p>
                <p className="mt-1 text-sm text-meta">
                  Firmendaten verwalten
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
