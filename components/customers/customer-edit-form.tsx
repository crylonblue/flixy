'use client'

import { useState, useEffect } from 'react'
import { Customer, Address } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, LoaderCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COUNTRIES } from '@/lib/countries'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface CustomerEditFormProps {
  customer: Customer | null
  onClose: () => void
}

export default function CustomerEditForm({ customer: initialCustomer, onClose }: CustomerEditFormProps) {
  const supabase = createClient()
  const isEditing = !!initialCustomer
  const address = (initialCustomer?.address as unknown as Address) || null

  const [customer, setCustomer] = useState({
    name: initialCustomer?.name || '',
    street: address?.street || '',
    streetnumber: address?.streetnumber || '',
    city: address?.city || '',
    zip: address?.zip || '',
    country: address?.country || 'DE',
    email: initialCustomer?.email || '',
    vat_id: initialCustomer?.vat_id || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearchQuery, setCountrySearchQuery] = useState('')
  const [shouldClose, setShouldClose] = useState(false)

  // Reset form when customer changes
  useEffect(() => {
    if (initialCustomer) {
      const addr = (initialCustomer.address as unknown as Address) || null
      setCustomer({
        name: initialCustomer.name || '',
        street: addr?.street || '',
        streetnumber: addr?.streetnumber || '',
        city: addr?.city || '',
        zip: addr?.zip || '',
        country: addr?.country || 'DE',
        email: initialCustomer.email || '',
        vat_id: initialCustomer.vat_id || '',
      })
    } else {
      setCustomer({
        name: '',
        street: '',
        streetnumber: '',
        city: '',
        zip: '',
        country: 'DE',
        email: '',
        vat_id: '',
      })
    }
    setError(null)
    setShouldClose(false)
  }, [initialCustomer])

  // Handle closing after save
  useEffect(() => {
    if (shouldClose && !isSaving) {
      onClose()
      setShouldClose(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldClose, isSaving])

  const handleSave = async () => {
    if (!customer.name || !customer.street || !customer.streetnumber || !customer.zip || !customer.city || !customer.country) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      if (isEditing && initialCustomer) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            name: customer.name,
            address: {
              street: customer.street,
              streetnumber: customer.streetnumber,
              city: customer.city,
              zip: customer.zip,
              country: customer.country,
            },
            email: customer.email || null,
            vat_id: customer.vat_id || null,
          })
          .eq('id', initialCustomer.id)

        if (updateError) {
          setError(updateError.message)
          setIsSaving(false)
          return
        }

        toast.success('Kunde aktualisiert', {
          description: `${customer.name} wurde erfolgreich aktualisiert.`,
        })
      } else {
        // Create new customer - we need company_id
        // Get user's company_id
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Benutzer nicht gefunden')
          setIsSaving(false)
          return
        }

        const { data: companyUsers } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .limit(1)
          .single()

        if (!companyUsers) {
          setError('Keine Firma gefunden')
          setIsSaving(false)
          return
        }

        const { data, error: insertError } = await supabase
          .from('customers')
          .insert({
            company_id: companyUsers.company_id,
            name: customer.name,
            address: {
              street: customer.street,
              streetnumber: customer.streetnumber,
              city: customer.city,
              zip: customer.zip,
              country: customer.country,
            },
            email: customer.email || null,
            vat_id: customer.vat_id || null,
          })
          .select()
          .single()

        if (insertError) {
          setError(insertError.message)
          setIsSaving(false)
          return
        }

        toast.success('Kunde erstellt', {
          description: `${customer.name} wurde erfolgreich erstellt.`,
        })
      }

      // Reset saving state and trigger close
      setIsSaving(false)
      setShouldClose(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialCustomer?.id) return

    setIsDeleting(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', initialCustomer.id)

    setIsDeleting(false)
    setDeleteDialogOpen(false)

    if (deleteError) {
      setError('Fehler beim Löschen des Kunden')
      return
    }

    toast.success('Kunde gelöscht', {
      description: 'Der Kunde wurde erfolgreich gelöscht.',
    })

    onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div>
          <h1 className="text-headline">{isEditing ? 'Kunde bearbeiten' : 'Neuen Kunden erstellen'}</h1>
          <p className="mt-2 text-meta">
            {isEditing ? 'Bearbeiten Sie die Kundendaten' : 'Erstellen Sie einen neuen Kunden'}
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
        <div className="space-y-4 pb-6">
          <div>
            <Label htmlFor="name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="mt-1"
              autoComplete="off"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="street" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Straße *
              </Label>
              <Input
                id="street"
                type="text"
                value={customer.street}
                onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                className="mt-1"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <Label htmlFor="streetnumber" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Hausnummer *
              </Label>
              <Input
                id="streetnumber"
                type="text"
                value={customer.streetnumber}
                onChange={(e) => setCustomer({ ...customer, streetnumber: e.target.value })}
                className="mt-1"
                autoComplete="off"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zip" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                PLZ *
              </Label>
              <Input
                id="zip"
                type="text"
                value={customer.zip}
                onChange={(e) => setCustomer({ ...customer, zip: e.target.value })}
                className="mt-1"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <Label htmlFor="city" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Stadt *
              </Label>
              <Input
                id="city"
                type="text"
                value={customer.city}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                className="mt-1"
                autoComplete="off"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="country" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Land *
            </Label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="country"
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="mt-1 w-full justify-between"
                  style={{ height: 'auto', minHeight: '2.25rem' }}
                >
                  {customer.country
                    ? COUNTRIES.find((country) => country.code === customer.country)?.name || customer.country
                    : 'Land auswählen...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-zinc-200 dark:border-zinc-700" align="start">
                <Command className="flex flex-col">
                  <CommandInput
                    placeholder="Land suchen..."
                    value={countrySearchQuery}
                    onValueChange={setCountrySearchQuery}
                  />
                  <CommandList className="flex-1 max-h-[300px] overflow-y-auto">
                    <CommandEmpty>Kein Land gefunden.</CommandEmpty>
                    <CommandGroup>
                      {COUNTRIES.filter((country) =>
                        country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                        country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
                      ).map((country) => {
                        const isSelected = customer.country === country.code
                        return (
                          <CommandItem
                            key={country.code}
                            value={country.name}
                            onSelect={() => {
                              setCustomer({ ...customer, country: country.code })
                              setCountryOpen(false)
                              setCountrySearchQuery('')
                            }}
                            style={{
                              backgroundColor: isSelected ? 'rgba(45, 45, 45, 0.08)' : 'transparent',
                              transition: 'background-color 0.2s ease, color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'rgba(45, 45, 45, 0.04)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                isSelected ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <span style={{ color: isSelected ? 'var(--text-primary)' : undefined }}>
                              {country.name} ({country.code})
                            </span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              E-Mail
            </Label>
            <Input
              id="email"
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className="mt-1"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="vat_id" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              USt-IdNr.
            </Label>
            <Input
              id="vat_id"
              type="text"
              value={customer.vat_id}
              onChange={(e) => setCustomer({ ...customer, vat_id: e.target.value })}
              className="mt-1"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center justify-between">
          {isEditing ? (
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isSaving || isDeleting}
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
            <Button
              onClick={onClose}
              disabled={isSaving || isDeleting}
              variant="outline"
              className="text-sm"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isDeleting || !customer.name || !customer.street || !customer.streetnumber || !customer.zip || !customer.city || !customer.country}
              className="text-sm"
            >
              {isSaving && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kunde löschen?</DialogTitle>
            <DialogDescription>
              Möchten Sie diesen Kunden wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
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
