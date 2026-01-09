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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import ApiKeysSection from './api-keys-section'

interface CompanySettingsProps {
  company: Company
}

export default function CompanySettings({ company: initialCompany }: CompanySettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const bankDetails = (initialCompany.bank_details as any) || {}
  const smtpSettings = (initialCompany.smtp_settings as any) || {}
  const initialAddress = initialCompany.address as unknown as Address
  const [company, setCompany] = useState({
    name: initialCompany.name,
    street: initialAddress?.street || '',
    streetnumber: initialAddress?.streetnumber || '',
    city: initialAddress?.city || '',
    zip: initialAddress?.zip || '',
    country: initialCompany.country,
    vat_id: initialCompany.vat_id || '',
    tax_id: initialCompany.tax_id || '',
    invoice_number_prefix: initialCompany.invoice_number_prefix,
    default_vat_rate: initialCompany.default_vat_rate.toString(),
    bank_name: bankDetails.bank_name || '',
    iban: bankDetails.iban || '',
    bic: bankDetails.bic || '',
    account_holder: bankDetails.account_holder || '',
    accounting_email: initialCompany.accounting_email || '',
    smtp_host: smtpSettings.host || '',
    smtp_port: smtpSettings.port?.toString() || '587',
    smtp_secure: smtpSettings.secure || false,
    smtp_user: smtpSettings.auth?.user || '',
    smtp_pass: smtpSettings.auth?.pass || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearchQuery, setCountrySearchQuery] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
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
          accounting_email: company.accounting_email || null,
          smtp_settings: {
            host: company.smtp_host || null,
            port: company.smtp_port ? parseInt(company.smtp_port) : null,
            secure: company.smtp_secure || false,
            auth: {
              user: company.smtp_user || null,
              pass: company.smtp_pass || null,
            },
          },
        })
        .eq('id', initialCompany.id)

      if (updateError) {
        setError(updateError.message)
        setIsSaving(false)
        return
      }

      // Show success toast
      toast.success('Einstellungen gespeichert', {
        description: 'Die Einstellungen wurden erfolgreich aktualisiert.',
      })

      // Reset saving state before refresh
      setIsSaving(false)
      
      // Refresh page after a short delay to ensure state update is processed
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
      setIsSaving(false)
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

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-8 bg-transparent border-b border-zinc-200 rounded-none h-auto p-0 gap-8 w-full justify-start">
          <TabsTrigger 
            value="company"
            className="bg-transparent border-0 border-b-2 border-transparent rounded-none px-0 pb-3.5 text-sm font-medium transition-colors duration-150 hover:text-zinc-900 hover:border-zinc-300 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:font-semibold data-[state=active]:shadow-none"
            style={{ 
              color: 'var(--text-secondary)',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none'
            }}
          >
            Firmendaten
          </TabsTrigger>
          <TabsTrigger 
            value="invoices"
            className="bg-transparent border-0 border-b-2 border-transparent rounded-none px-0 pb-3.5 text-sm font-medium transition-colors duration-150 hover:text-zinc-900 hover:border-zinc-300 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:font-semibold data-[state=active]:shadow-none"
            style={{ 
              color: 'var(--text-secondary)',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none'
            }}
          >
            Rechnungen
          </TabsTrigger>
          <TabsTrigger 
            value="email"
            className="bg-transparent border-0 border-b-2 border-transparent rounded-none px-0 pb-3.5 text-sm font-medium transition-colors duration-150 hover:text-zinc-900 hover:border-zinc-300 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:font-semibold data-[state=active]:shadow-none"
            style={{ 
              color: 'var(--text-secondary)',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none'
            }}
          >
            E-Mail
          </TabsTrigger>
          <TabsTrigger 
            value="api"
            className="bg-transparent border-0 border-b-2 border-transparent rounded-none px-0 pb-3.5 text-sm font-medium transition-colors duration-150 hover:text-zinc-900 hover:border-zinc-300 data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:font-semibold data-[state=active]:shadow-none"
            style={{ 
              color: 'var(--text-secondary)',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none'
            }}
          >
            API
          </TabsTrigger>
        </TabsList>

        <Card className="bg-white mt-6">
          <CardContent className="pt-6">
            {/* Firmendaten Tab */}
            <TabsContent value="company" className="space-y-6 mt-0">
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

                <div className="pt-6 mt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
                  <h2 className="mb-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>Bankdaten</h2>
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
              </div>
            </TabsContent>

            {/* Rechnungseinstellungen Tab */}
            <TabsContent value="invoices" className="space-y-6 mt-0">
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

                <div>
                  <Label htmlFor="accounting_email">Buchhaltungs-E-Mailadresse</Label>
                  <Input
                    id="accounting_email"
                    type="email"
                    value={company.accounting_email}
                    onChange={(e) => setCompany({ ...company, accounting_email: e.target.value })}
                    className="mt-1.5"
                    placeholder="datev@beispiel.de oder buchhaltung@beispiel.de"
                  />
                  <p className="mt-1.5 text-xs text-meta">
                    An diese Adresse werden fertige Rechnungen automatisch versendet (z.B. für Datev oder andere Buchhaltungssysteme)
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* E-Mail-Einstellungen Tab */}
            <TabsContent value="email" className="space-y-6 mt-0">
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  E-Mail-Einstellungen (SMTP)
                </CardTitle>
                <CardDescription className="text-sm">
                  Konfiguration für den Versand von E-Mails im Auftrag Ihres Unternehmens
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_host">SMTP-Server</Label>
                    <Input
                      id="smtp_host"
                      type="text"
                      value={company.smtp_host}
                      onChange={(e) => setCompany({ ...company, smtp_host: e.target.value })}
                      className="mt-1.5"
                      placeholder="smtp.beispiel.de"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_port">Port</Label>
                    <Input
                      id="smtp_port"
                      type="number"
                      value={company.smtp_port}
                      onChange={(e) => setCompany({ ...company, smtp_port: e.target.value })}
                      className="mt-1.5"
                      placeholder="587"
                    />
                    <p className="mt-1.5 text-xs text-meta">
                      Typisch: 587 (TLS) oder 465 (SSL)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smtp_secure"
                    checked={company.smtp_secure}
                    onCheckedChange={(checked) => setCompany({ ...company, smtp_secure: checked })}
                  />
                  <Label htmlFor="smtp_secure" className="cursor-pointer">
                    SSL/TLS verwenden
                  </Label>
                </div>

                <div>
                  <Label htmlFor="smtp_user">Benutzername / E-Mailadresse</Label>
                  <Input
                    id="smtp_user"
                    type="text"
                    value={company.smtp_user}
                    onChange={(e) => setCompany({ ...company, smtp_user: e.target.value })}
                    className="mt-1.5"
                    placeholder="benutzer@beispiel.de"
                  />
                </div>

                <div>
                  <Label htmlFor="smtp_pass">Passwort</Label>
                  <Input
                    id="smtp_pass"
                    type="password"
                    value={company.smtp_pass}
                    onChange={(e) => setCompany({ ...company, smtp_pass: e.target.value })}
                    className="mt-1.5"
                    placeholder="••••••••"
                  />
                  <p className="mt-1.5 text-xs text-meta">
                    Das Passwort wird verschlüsselt gespeichert
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* API Tab */}
            <TabsContent value="api" className="mt-0">
              <ApiKeysSection companyId={initialCompany.id} />
            </TabsContent>

            <div className="flex justify-end border-t pt-6 mt-8" style={{ borderColor: 'var(--border-default)' }}>
              <Button
                onClick={handleSave}
                disabled={isSaving || !company.name}
              >
                {isSaving && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                Speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
