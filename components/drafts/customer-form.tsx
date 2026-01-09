'use client'

import { useState } from 'react'
import { CustomerSnapshot } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COUNTRIES } from '@/lib/countries'

interface CustomerFormProps {
  companyId: string
  onSave: (customer: CustomerSnapshot) => void
  onCancel: () => void
}

export default function CustomerForm({ companyId, onSave, onCancel }: CustomerFormProps) {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    street: '',
    streetnumber: '',
    city: '',
    zip: '',
    country: 'DE',
    email: '',
    vat_id: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearchQuery, setCountrySearchQuery] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    if (!newCustomer.name || !newCustomer.street || !newCustomer.streetnumber || !newCustomer.zip || !newCustomer.city || !newCustomer.country) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.')
      return
    }

    setIsSaving(true)
    setError(null)

    const snapshot: CustomerSnapshot = {
      name: newCustomer.name,
      address: {
        street: newCustomer.street,
        streetnumber: newCustomer.streetnumber,
        city: newCustomer.city,
        zip: newCustomer.zip,
        country: newCustomer.country,
      },
      email: newCustomer.email || undefined,
      vat_id: newCustomer.vat_id || undefined,
    }

    try {
      await onSave(snapshot)
      // Don't reset isSaving here - let the drawer handle closing
      // The drawer will close after successful save, which will unmount this component
    } catch (err) {
      setIsSaving(false)
      setError('Fehler beim Speichern des Kunden')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div>
          <h1 className="text-headline">Neuen Kunden hinzufügen</h1>
          <p className="mt-2 text-meta">
            Erstellen Sie einen neuen Kunden für diese Rechnung
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
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6" style={{ paddingTop: error ? '0' : '1.5rem' }}>
        <div className="space-y-4 pb-6">
          <div>
            <Label htmlFor="name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
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
                value={newCustomer.street}
                onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
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
                value={newCustomer.streetnumber}
                onChange={(e) => setNewCustomer({ ...newCustomer, streetnumber: e.target.value })}
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
                value={newCustomer.zip}
                onChange={(e) => setNewCustomer({ ...newCustomer, zip: e.target.value })}
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
                value={newCustomer.city}
                onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
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
                  {newCustomer.country
                    ? COUNTRIES.find((country) => country.code === newCustomer.country)?.name || newCustomer.country
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
                        const isSelected = newCustomer.country === country.code
                        return (
                          <CommandItem
                            key={country.code}
                            value={country.name}
                            onSelect={() => {
                              setNewCustomer({ ...newCustomer, country: country.code })
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
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
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
              value={newCustomer.vat_id}
              onChange={(e) => setNewCustomer({ ...newCustomer, vat_id: e.target.value })}
              className="mt-1"
              autoComplete="off"
            />
          </div>
        </div>
      </form>

      {/* Actions Footer */}
      <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="text-sm"
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving || !newCustomer.name || !newCustomer.street || !newCustomer.streetnumber || !newCustomer.zip || !newCustomer.city || !newCustomer.country}
            className="text-sm"
          >
            {isSaving && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
            Speichern & Auswählen
          </Button>
        </div>
      </div>
    </div>
  )
}

