'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useInvoiceDrawer } from '@/contexts/invoice-drawer-context'
import { Invoice, CustomerSnapshot, LineItem } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { User, ShoppingCart, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { isOverdue, getStatusLabel, getStatusClass } from '@/lib/invoice-utils'

type InvoiceStatus = 'created' | 'sent' | 'reminded' | 'paid' | 'cancelled'

const AVAILABLE_STATUSES: InvoiceStatus[] = ['created', 'sent', 'reminded', 'paid', 'cancelled']

export default function InvoiceDrawer() {
  const { isOpen, invoiceId, closeDrawer } = useInvoiceDrawer()
  const router = useRouter()
  const supabase = createClient()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoice(invoiceId)
    }
  }, [isOpen, invoiceId])

  const loadInvoice = async (id: string) => {
    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !data) {
      setError(fetchError?.message || 'Fehler beim Laden der Rechnung')
      setIsLoading(false)
      return
    }

    setInvoice(data)

    // Load company name
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', data.company_id)
      .single()

    setCompanyName(company?.name || null)
    setIsLoading(false)
  }

  const customerSnapshot = invoice?.customer_snapshot as unknown as CustomerSnapshot | null
  const lineItems = (invoice?.line_items as unknown as LineItem[]) || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const calculateGrossAmount = (item: LineItem) => {
    return item.total * (1 + item.vat_rate / 100)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice || newStatus === invoice.status) return

    setIsUpdatingStatus(true)
    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoice.id)

    if (error) {
      toast.error('Fehler beim Aktualisieren des Status')
    } else {
      setInvoice({ ...invoice, status: newStatus as InvoiceStatus })
      toast.success(`Status auf "${getStatusLabel(newStatus)}" geändert`)
      router.refresh() // Aktualisiert die Tabelle
    }
    setIsUpdatingStatus(false)
  }

  const handleDownloadPdf = async () => {
    if (!invoice) return
    
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der PDF')
      }
      
      window.open(data.url, '_blank')
    } catch (err) {
      console.error('Error downloading PDF:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 bg-background flex flex-col"
        style={{ maxWidth: '28rem', backgroundColor: 'rgb(250, 250, 250)' }}
        onClose={closeDrawer}
      >
        <SheetTitle className="sr-only">Rechnungsdetails</SheetTitle>
        
        {isLoading ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-secondary">Lädt...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <div className="message-error">{error}</div>
          </div>
        ) : invoice ? (
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="p-6 pt-12">
              {/* Status Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className={getStatusClass(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </span>
                {isOverdue(invoice) && (
                  <span className="status-badge error">
                    Überfällig
                  </span>
                )}
              </div>

              {/* Recipient (Customer) */}
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {customerSnapshot?.name || 'Unbekannter Kunde'}
              </h2>
              
              {/* Invoice Number */}
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                {invoice.invoice_number || 'Keine Rechnungsnummer'}
              </p>
              
              {/* Amount and Date */}
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(invoice.total_amount)}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {invoice.invoice_date
                    ? format(new Date(invoice.invoice_date), 'd. MMM yyyy', { locale: de })
                    : '-'}
                </span>
              </div>
            </div>

            {/* Sender Section */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700">
                  <User className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {companyName || 'Unbekannter Absender'}
                </span>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="flex-1 px-6 py-4 border-t border-zinc-200 dark:border-zinc-700">
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">
                Positionen
              </h3>
              
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <ShoppingCart className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate">
                      {item.description || 'Ohne Beschreibung'}
                    </span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(calculateGrossAmount(item))}
                    </span>
                  </div>
                ))}
                
                {lineItems.length === 0 && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Keine Positionen vorhanden
                  </p>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 block">
                  Status ändern
                </label>
                <Select
                  value={invoice.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus || invoice.status === 'cancelled'}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {invoice.status === 'cancelled' && (
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    Stornierte Rechnungen können nicht mehr geändert werden.
                  </p>
                )}
              </div>

              {/* PDF Download Button */}
              {(invoice.pdf_url || invoice.invoice_file_reference) && (
                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Lädt...' : 'PDF herunterladen'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
