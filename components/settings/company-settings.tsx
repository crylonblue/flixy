'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Company, Address } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COUNTRIES } from '@/lib/countries'

interface CompanySettingsProps {
  company: Company
}

export default function CompanySettings({ company: initialCompany }: CompanySettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const bankDetails = (initialCompany.bank_details as any) || {}
  const [company, setCompany] = useState({
    name: initialCompany.name,
    street: (initialCompany.address as Address)?.street || '',
    streetnumber: (initialCompany.address as Address)?.streetnumber || '',
    city: (initialCompany.address as Address)?.city || '',
    zip: (initialCompany.address as Address)?.zip || '',
    country: initialCompany.country,
    vat_id: initialCompany.vat_id || '',
    tax_id: initialCompany.tax_id || '',
    invoice_number_prefix: initialCompany.invoice_number_prefix,
    default_vat_rate: initialCompany.default_vat_rate.toString(),
    bank_name: bankDetails.bank_name || '',
    iban: bankDetails.iban || '',
    bic: bankDetails.bic || '',
    account_holder: bankDetails.account_holder || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearchQuery, setCountrySearchQuery] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('companies')
      .update({
        name: company.name,
        address: {
          street: company.street,
          streetnumber: company.streetnumber,
          city: company.city,
          zip: company.zip,
          country: company.country,
        },
        country: company.country,
        vat_id: company.vat_id || null,
        tax_id: company.tax_id || null,
        invoice_number_prefix: company.invoice_number_prefix,
        default_vat_rate: parseFloat(company.default_vat_rate) || 19.0,
        bank_details: {
          bank_name: company.bank_name || null,
          iban: company.iban || null,
          bic: company.bic || null,
          account_holder: company.account_holder || null,
        },
      })
      .eq('id', initialCompany.id)

    if (updateError) {
      setError(updateError.message)
      setIsSaving(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline">Einstellungen</h1>
        <p className="mt-2 text-meta">
          Firmendaten und Standardwerte verwalten
        </p>
      </div>

      {error && (
        <div className="message-error">
          {error}
        </div>
      )}

      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="space-y-8">
            {/* Firmendaten Section */}
            <div className="space-y-6">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  Firmendaten
                </CardTitle>
                <CardDescription className="text-sm">
                  Grundlegende Informationen zu Ihrem Unternehmen
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Firmenname *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="street">Straße</Label>
                    <Input
                      id="street"
                      type="text"
                      value={company.street}
                      onChange={(e) => setCompany({ ...company, street: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="streetnumber">Hausnummer</Label>
                    <Input
                      id="streetnumber"
                      type="text"
                      value={company.streetnumber}
                      onChange={(e) => setCompany({ ...company, streetnumber: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">PLZ</Label>
                    <Input
                      id="zip"
                      type="text"
                      value={company.zip}
                      onChange={(e) => setCompany({ ...company, zip: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Stadt</Label>
                    <Input
                      id="city"
                      type="text"
                      value={company.city}
                      onChange={(e) => setCompany({ ...company, city: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Land</Label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="country"
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryOpen}
                        className="mt-1.5 w-full justify-between"
                        style={{ height: 'auto', minHeight: '2.25rem' }}
                      >
                        {company.country
                          ? COUNTRIES.find((c) => c.code === company.country)?.name || company.country
                          : 'Land auswählen...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" style={{ borderColor: 'rgb(var(--input))' }}>
                      <Command className="flex flex-col">
                        <CommandInput
                          placeholder="Land suchen..."
                          value={countrySearchQuery}
                          onValueChange={setCountrySearchQuery}
                        />
                        <CommandList className="flex-1 max-h-[300px] overflow-y-auto">
                          <CommandEmpty>Kein Land gefunden.</CommandEmpty>
                          <CommandGroup>
                            {COUNTRIES.filter((c) =>
                              c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                              c.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
                            ).map((c) => {
                              const isSelected = company.country === c.code
                              return (
                                <CommandItem
                                  key={c.code}
                                  value={c.name}
                                  onSelect={() => {
                                    setCompany({ ...company, country: c.code })
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
                                    {c.name} ({c.code})
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
                  <Label htmlFor="vat_id">USt-IdNr.</Label>
                  <Input
                    id="vat_id"
                    type="text"
                    value={company.vat_id}
                    onChange={(e) => setCompany({ ...company, vat_id: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="tax_id">Steuernummer</Label>
                  <Input
                    id="tax_id"
                    type="text"
                    value={company.tax_id}
                    onChange={(e) => setCompany({ ...company, tax_id: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Bankdaten Section */}
            <div className="space-y-6 border-t pt-8" style={{ borderColor: 'var(--border-default)' }}>
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  Bankdaten
                </CardTitle>
                <CardDescription className="text-sm">
                  Bankverbindung für Rechnungen
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="account_holder">Kontoinhaber</Label>
                  <Input
                    id="account_holder"
                    type="text"
                    value={company.account_holder}
                    onChange={(e) => setCompany({ ...company, account_holder: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="bank_name">Bankname</Label>
                  <Input
                    id="bank_name"
                    type="text"
                    value={company.bank_name}
                    onChange={(e) => setCompany({ ...company, bank_name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    type="text"
                    value={company.iban}
                    onChange={(e) => setCompany({ ...company, iban: e.target.value.toUpperCase().replace(/\s/g, '') })}
                    className="mt-1.5"
                    placeholder="DE89 3704 0044 0532 0130 00"
                  />
                </div>

                <div>
                  <Label htmlFor="bic">BIC / SWIFT</Label>
                  <Input
                    id="bic"
                    type="text"
                    value={company.bic}
                    onChange={(e) => setCompany({ ...company, bic: e.target.value.toUpperCase().replace(/\s/g, '') })}
                    className="mt-1.5"
                    placeholder="COBADEFFXXX"
                  />
                </div>
              </div>
            </div>

            {/* Rechnungseinstellungen Section */}
            <div className="space-y-6 border-t pt-8" style={{ borderColor: 'var(--border-default)' }}>
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  Rechnungseinstellungen
                </CardTitle>
                <CardDescription className="text-sm">
                  Standardwerte für neue Rechnungen
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="invoice_number_prefix">Rechnungsnummer-Präfix</Label>
                  <Input
                    id="invoice_number_prefix"
                    type="text"
                    value={company.invoice_number_prefix}
                    onChange={(e) => setCompany({ ...company, invoice_number_prefix: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="mt-1.5 text-xs text-meta">
                    Beispiel: INV → Rechnungen werden als INV-0001, INV-0002, ... nummeriert
                  </p>
                </div>

                <div>
                  <Label htmlFor="default_vat_rate">Standard-MwSt.-Satz (%)</Label>
                  <Input
                    id="default_vat_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={company.default_vat_rate}
                    onChange={(e) => setCompany({ ...company, default_vat_rate: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t pt-6" style={{ borderColor: 'var(--border-default)' }}>
              <Button
                onClick={handleSave}
                disabled={isSaving || !company.name}
              >
                {isSaving && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                Speichern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
