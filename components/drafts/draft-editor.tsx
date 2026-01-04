'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Invoice, LineItem, CustomerSnapshot, Address, IssuerSnapshot, Company } from '@/types'
import { createClient } from '@/lib/supabase/client'
import CustomerSelector from './customer-selector'
import IssuerSelector from './issuer-selector'
import LineItemsEditor from './line-items-editor'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LoaderCircle, Trash2, Check } from 'lucide-react'
import { useDraftDrawer } from '@/contexts/draft-drawer-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface DraftEditorProps {
  draft: Invoice
}

export default function DraftEditor({ draft: initialDraft }: DraftEditorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { closeDrawer } = useDraftDrawer()
  const supabase = createClient()
  const [draft, setDraft] = useState(initialDraft)
  const [isSaving, setIsSaving] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [useDefaultIssuer, setUseDefaultIssuer] = useState(true)
  const [customIssuer, setCustomIssuer] = useState<IssuerSnapshot | null>(null)

  const customerSnapshot = (draft.customer_snapshot as unknown as CustomerSnapshot) || null
  const issuerSnapshot = ((draft as any).issuer_snapshot as IssuerSnapshot) || null
  const lineItems = (draft.line_items as unknown as LineItem[]) || []
  const [isSaved, setIsSaved] = useState(!!draft.id && draft.status === 'draft')

  // Load company data
  useEffect(() => {
    const loadCompany = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', draft.company_id)
        .single()

      if (!error && data) {
        setCompany(data)
        // If we have an issuer_snapshot, it means we're using custom issuer
        if (issuerSnapshot) {
          setUseDefaultIssuer(false)
          setCustomIssuer(issuerSnapshot)
        }
      }
    }

    loadCompany()
  }, [draft.company_id, issuerSnapshot])

  // Get current issuer snapshot (default from company or custom)
  const getCurrentIssuerSnapshot = (): IssuerSnapshot | null => {
    if (!company) return null

    if (useDefaultIssuer) {
      // Return null to indicate we use company data (not stored in snapshot)
      return null
    } else {
      // Return custom issuer snapshot
      return customIssuer
    }
  }

  const saveDraft = async () => {
    setIsSaving(true)
    setError(null)

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
    const vatAmount = lineItems.reduce((sum, item) => sum + (item.total * item.vat_rate) / 100, 0)
    const totalAmount = subtotal + vatAmount

    const issuerSnapshot = getCurrentIssuerSnapshot()

    let savedDraft: Invoice

    if (draft.id) {
      // Update existing draft
      const { data, error } = await supabase
        .from('invoices')
        .update({
          line_items: lineItems,
          customer_snapshot: customerSnapshot,
          issuer_snapshot: issuerSnapshot,
          invoice_date: draft.invoice_date,
          due_date: draft.due_date,
          subtotal: subtotal,
          vat_amount: vatAmount,
          total_amount: totalAmount,
        })
        .eq('id', draft.id)
        .select()
        .single()

      if (error) {
        setError(error.message)
        setIsSaving(false)
        return
      }

      savedDraft = data
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          company_id: draft.company_id,
          status: 'draft',
          line_items: lineItems,
          customer_snapshot: customerSnapshot,
          issuer_snapshot: issuerSnapshot,
          invoice_date: draft.invoice_date,
          due_date: draft.due_date,
          subtotal: subtotal,
          vat_amount: vatAmount,
          total_amount: totalAmount,
        })
        .select()
        .single()

      if (error) {
        setError(error.message)
        setIsSaving(false)
        return
      }

      savedDraft = data
    }

    setDraft(savedDraft)
    setIsSaved(true)
    setIsSaving(false)
    
    // Show success toast
    toast.success('Entwurf gespeichert', {
      description: 'Der Entwurf wurde erfolgreich gespeichert.',
    })
    
    // Close drawer and refresh if on drafts page
    closeDrawer()
    if (pathname === '/drafts') {
      router.refresh()
    }
  }

  const handleSaveDraft = async () => {
    await saveDraft()
  }

  const handleCustomerSelect = (customer: CustomerSnapshot) => {
    setDraft((prev) => ({
      ...prev,
      customer_snapshot: customer as any,
    }))
  }

  const handleLineItemsChange = (items: LineItem[]) => {
    setDraft((prev) => ({
      ...prev,
      line_items: items as any,
    }))
  }

  const handleDateChange = (field: 'invoice_date' | 'due_date', value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value || null,
    }))
  }

  const handleDelete = async () => {
    if (!draft.id) return

    setIsDeleting(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', draft.id)
      .eq('status', 'draft')

    setIsDeleting(false)
    setDeleteDialogOpen(false)

    if (deleteError) {
      setError('Fehler beim Löschen des Entwurfs')
      return
    }

    // Show success toast
    toast.success('Entwurf gelöscht', {
      description: 'Der Entwurf wurde erfolgreich gelöscht.',
    })

    // Close drawer and refresh
    closeDrawer()
    router.refresh()
  }

  const handleFinalize = async () => {
    // Validate
    if (!customerSnapshot) {
      setError('Bitte wählen Sie einen Kunden aus.')
      return
    }

    if (lineItems.length === 0) {
      setError('Bitte fügen Sie mindestens eine Position hinzu.')
      return
    }

    if (!draft.invoice_date) {
      setError('Bitte geben Sie ein Rechnungsdatum ein.')
      return
    }

    setIsFinalizing(true)
    setError(null)

    try {
      // Get company for invoice number format
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', draft.company_id)
        .single()

      // Get next invoice number
      const { data: lastInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('company_id', draft.company_id)
        .not('invoice_number', 'is', null)
        .order('invoice_number', { ascending: false })
        .limit(1)
        .single()

      let nextNumber = 1
      if (lastInvoice?.invoice_number) {
        const match = lastInvoice.invoice_number.match(/\d+/)
        if (match) {
          nextNumber = parseInt(match[0], 10) + 1
        }
      }

      const prefix = company?.invoice_number_prefix || 'INV'
      const invoiceNumber = `${prefix}-${nextNumber.toString().padStart(4, '0')}`

      // Calculate final totals
      const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
      const vatAmount = lineItems.reduce((sum, item) => sum + (item.total * item.vat_rate) / 100, 0)
      const totalAmount = subtotal + vatAmount

      // Get issuer snapshot - if using default, create snapshot from company data
      let finalIssuerSnapshot: IssuerSnapshot | null = null
      if (useDefaultIssuer && company) {
        const address = company.address as Address
        const bankDetails = (company.bank_details as any) || {}
        finalIssuerSnapshot = {
          name: company.name,
          address: address,
          vat_id: company.vat_id || undefined,
          tax_id: company.tax_id || undefined,
          bank_details: bankDetails.bank_name || bankDetails.iban || bankDetails.bic || bankDetails.account_holder
            ? {
                bank_name: bankDetails.bank_name || undefined,
                iban: bankDetails.iban || undefined,
                bic: bankDetails.bic || undefined,
                account_holder: bankDetails.account_holder || undefined,
              }
            : undefined,
        }
      } else if (!useDefaultIssuer && customIssuer) {
        finalIssuerSnapshot = customIssuer
      }

      let finalizedInvoice: Invoice

      if (draft.id) {
        // Update existing draft to finalized invoice
        const { data, error: updateError } = await supabase
          .from('invoices')
          .update({
            status: 'created',
            invoice_number: invoiceNumber,
            invoice_date: draft.invoice_date,
            due_date: draft.due_date,
            customer_snapshot: customerSnapshot,
            issuer_snapshot: finalIssuerSnapshot,
            line_items: lineItems,
            subtotal: subtotal,
            vat_amount: vatAmount,
            total_amount: totalAmount,
            finalized_at: new Date().toISOString(),
          })
          .eq('id', draft.id)
          .select()
          .single()

        if (updateError) {
          setError(updateError.message)
          setIsFinalizing(false)
          return
        }

        finalizedInvoice = data
      } else {
        // Create new invoice directly as finalized
        const { data, error: insertError } = await supabase
          .from('invoices')
          .insert({
            company_id: draft.company_id,
            status: 'created',
            invoice_number: invoiceNumber,
            invoice_date: draft.invoice_date,
            due_date: draft.due_date,
            customer_snapshot: customerSnapshot,
            issuer_snapshot: finalIssuerSnapshot,
            line_items: lineItems,
            subtotal: subtotal,
            vat_amount: vatAmount,
            total_amount: totalAmount,
            finalized_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) {
          setError(insertError.message)
          setIsFinalizing(false)
          return
        }

        finalizedInvoice = data
      }

      // Generate PDF and XML, upload to S3
      const response = await fetch('/api/invoices/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: finalizedInvoice.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Fehler beim Generieren der Rechnung')
        setIsFinalizing(false)
        return
      }

      setIsFinalizing(false)
      
      // Show success toast
      toast.success('Rechnung erstellt', {
        description: `Rechnung ${invoiceNumber} wurde erfolgreich erstellt.`,
      })
      
      // Close drawer and refresh after successful finalize
      closeDrawer()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Finalisieren')
      setIsFinalizing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div>
          <h1 className="text-headline">Rechnung erstellen</h1>
          <p className="mt-2 text-meta">
            {isSaved ? 'Entwurf • Gespeichert' : 'Noch nicht gespeichert'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="message-error">
            {error}
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6" style={{ paddingTop: error ? '0' : '1.5rem' }}>
        <div className="space-y-8 pb-6">
          <div>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Absender</h2>
            <IssuerSelector
              company={company}
              selectedIssuer={customIssuer}
              useDefault={useDefaultIssuer}
              onSelect={(issuer, useDefault) => {
                setUseDefaultIssuer(useDefault)
                setCustomIssuer(issuer)
              }}
            />

            <div className="pt-6 mt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Empfänger</h2>
              <CustomerSelector
                companyId={draft.company_id}
                selectedCustomer={customerSnapshot}
                onSelect={handleCustomerSelect}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Datum</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_date">
                  Rechnungsdatum
                </Label>
                <DatePicker
                  value={draft.invoice_date}
                  onChange={(date) => handleDateChange('invoice_date', date || '')}
                  placeholder="Rechnungsdatum auswählen"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="due_date">
                  Fälligkeitsdatum
                </Label>
                <DatePicker
                  value={draft.due_date}
                  onChange={(date) => handleDateChange('due_date', date || '')}
                  placeholder="Fälligkeitsdatum auswählen"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Positionen</h2>
            <LineItemsEditor lineItems={lineItems} onChange={handleLineItemsChange} />
            
            {lineItems.length > 0 && (() => {
              const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
              const vatAmount = lineItems.reduce((sum, item) => sum + (item.total * item.vat_rate) / 100, 0)
              const totalAmount = subtotal + vatAmount
              
              return (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Netto</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>MwSt.</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(vatAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Brutto</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center justify-between">
          {draft.id && isSaved ? (
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isSaving || isFinalizing || isDeleting}
              variant="destructive"
              className="text-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            {/* Always: "Rechnung fertigstellen" (white with checkmark) on left, "Als Entwurf speichern"/"Aktualisieren" (black) on right */}
            <Button
              onClick={handleFinalize}
              disabled={isFinalizing || isSaving || isDeleting}
              variant="outline"
              className="text-sm"
            >
              {isFinalizing ? (
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Rechnung fertigstellen
            </Button>
            <Button
              onClick={handleSaveDraft}
              disabled={isSaving || isFinalizing || isDeleting}
              className="text-sm"
            >
              {isSaving && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
              {isSaved ? 'Aktualisieren' : 'Als Entwurf speichern'}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entwurf löschen?</DialogTitle>
            <DialogDescription>
              Möchten Sie diesen Entwurf wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

