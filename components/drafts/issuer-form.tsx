'use client'

import { useState } from 'react'
import { IssuerSnapshot } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COUNTRIES } from '@/lib/countries'

interface IssuerFormProps {
  defaultIssuer?: IssuerSnapshot
  onSave: (issuer: IssuerSnapshot) => void
  onCancel: () => void
}

export default function IssuerForm({ defaultIssuer, onSave, onCancel }: IssuerFormProps) {
  const [issuer, setIssuer] = useState<IssuerSnapshot>(defaultIssuer || {
    name: '',
    address: {
      street: '',
      streetnumber: '',
      city: '',
      zip: '',
      country: 'DE',
    },
    vat_id: '',
    tax_id: '',
    bank_details: {},
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearchQuery, setCountrySearchQuery] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    if (!issuer.name || !issuer.address.street || !issuer.address.streetnumber || !issuer.address.zip || !issuer.address.city || !issuer.address.country) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.')
      return
    }

    setIsSaving(true)
    setError(null)

    await onSave(issuer)
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div>
          <h1 className="text-headline">Benutzerdefinierten Absender erstellen</h1>
          <p className="mt-2 text-meta">
            Erstellen Sie einen benutzerdefinierten Absender für diese Rechnung
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
            <Label htmlFor="issuer_name">Firmenname *</Label>
            <Input
              id="issuer_name"
              value={issuer.name}
              onChange={(e) => setIssuer({ ...issuer, name: e.target.value })}
              className="mt-1.5"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="issuer_street">Straße *</Label>
              <Input
                id="issuer_street"
                value={issuer.address.street}
                onChange={(e) =>
                  setIssuer({
                    ...issuer,
                    address: { ...issuer.address, street: e.target.value },
                  })
                }
                className="mt-1.5"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="issuer_streetnumber">Hausnummer *</Label>
              <Input
                id="issuer_streetnumber"
                value={issuer.address.streetnumber}
                onChange={(e) =>
                  setIssuer({
                    ...issuer,
                    address: { ...issuer.address, streetnumber: e.target.value },
                  })
                }
                className="mt-1.5"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issuer_zip">PLZ *</Label>
              <Input
                id="issuer_zip"
                value={issuer.address.zip}
                onChange={(e) =>
                  setIssuer({
                    ...issuer,
                    address: { ...issuer.address, zip: e.target.value },
                  })
                }
                className="mt-1.5"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="issuer_city">Stadt *</Label>
              <Input
                id="issuer_city"
                value={issuer.address.city}
                onChange={(e) =>
                  setIssuer({
                    ...issuer,
                    address: { ...issuer.address, city: e.target.value },
                  })
                }
                className="mt-1.5"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="issuer_country">Land *</Label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between mt-1.5",
                    !issuer.address.country && "text-muted-foreground"
                  )}
                  style={{ height: 'auto', minHeight: '2.25rem' }}
                >
                  {issuer.address.country
                    ? COUNTRIES.find((c) => c.code === issuer.address.country)?.name
                    : "Land auswählen"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-zinc-200 dark:border-zinc-700" align="start">
                <Command>
                  <CommandInput
                    placeholder="Land suchen..."
                    value={countrySearchQuery}
                    onValueChange={setCountrySearchQuery}
                  />
                  <CommandList style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <CommandEmpty>Kein Land gefunden.</CommandEmpty>
                    <CommandGroup>
                      {COUNTRIES.map((country) => {
                        const isSelected = issuer.address.country === country.code
                        return (
                          <CommandItem
                            key={country.code}
                            value={country.name}
                            onSelect={() => {
                              setIssuer({
                                ...issuer,
                                address: { ...issuer.address, country: country.code },
                              })
                              setCountryOpen(false)
                              setCountrySearchQuery('')
                            }}
                            className="data-[selected=true]:!bg-[rgba(45,45,45,0.04)] data-[selected=true]:!text-inherit"
                            style={{
                              backgroundColor: isSelected ? 'rgba(45, 45, 45, 0.08)' : 'transparent',
                              color: isSelected ? 'var(--text-primary)' : '',
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
                              } else {
                                e.currentTarget.style.backgroundColor = 'rgba(45, 45, 45, 0.08)'
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country.name}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issuer_vat_id">USt-IdNr.</Label>
              <Input
                id="issuer_vat_id"
                value={issuer.vat_id || ''}
                onChange={(e) =>
                  setIssuer({
                    ...issuer,
                    vat_id: e.target.value || undefined,
                  })
                }
                className="mt-1.5"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="issuer_tax_id">Steuernummer</Label>
              <Input
                id="issuer_tax_id"
                value={issuer.tax_id || ''}
                onChange={(e) =>
                  setIssuer({
                    ...issuer,
                    tax_id: e.target.value || undefined,
                  })
                }
                className="mt-1.5"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <h3 className="text-xs font-medium mb-4 uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Bankdaten</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="issuer_account_holder">Kontoinhaber</Label>
                <Input
                  id="issuer_account_holder"
                  value={issuer.bank_details?.account_holder || ''}
                  onChange={(e) =>
                    setIssuer({
                      ...issuer,
                      bank_details: {
                        ...issuer.bank_details,
                        account_holder: e.target.value || undefined,
                      },
                    })
                  }
                  className="mt-1.5"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="issuer_bank_name">Bankname</Label>
                <Input
                  id="issuer_bank_name"
                  value={issuer.bank_details?.bank_name || ''}
                  onChange={(e) =>
                    setIssuer({
                      ...issuer,
                      bank_details: {
                        ...issuer.bank_details,
                        bank_name: e.target.value || undefined,
                      },
                    })
                  }
                  className="mt-1.5"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="issuer_iban">IBAN</Label>
                <Input
                  id="issuer_iban"
                  value={issuer.bank_details?.iban || ''}
                  onChange={(e) =>
                    setIssuer({
                      ...issuer,
                      bank_details: {
                        ...issuer.bank_details,
                        iban: e.target.value || undefined,
                      },
                    })
                  }
                  className="mt-1.5"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="issuer_bic">BIC/SWIFT</Label>
                <Input
                  id="issuer_bic"
                  value={issuer.bank_details?.bic || ''}
                  onChange={(e) =>
                    setIssuer({
                      ...issuer,
                      bank_details: {
                        ...issuer.bank_details,
                        bic: e.target.value || undefined,
                      },
                    })
                  }
                  className="mt-1.5"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Actions Footer */}
      <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="text-sm"
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving || !issuer.name || !issuer.address.street || !issuer.address.streetnumber || !issuer.address.zip || !issuer.address.city || !issuer.address.country}
            className="text-sm"
          >
            {isSaving && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
            Auswählen
          </Button>
        </div>
      </div>
    </div>
  )
}

