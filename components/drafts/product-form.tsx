'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UNITS } from '@/lib/units'

interface ProductFormProps {
  companyId: string
  onSave: (product: Omit<Product, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

export default function ProductForm({ companyId, onSave, onCancel }: ProductFormProps) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    unit: 'piece',
    unit_price: 0,
    default_vat_rate: 19,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unitOpen, setUnitOpen] = useState(false)
  const [unitSearchQuery, setUnitSearchQuery] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    if (!newProduct.name) {
      setError('Bitte geben Sie einen Namen ein.')
      return
    }

    if (newProduct.unit_price < 0) {
      setError('Der Preis darf nicht negativ sein.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onSave({
        name: newProduct.name,
        description: newProduct.description || null,
        unit: newProduct.unit,
        unit_price: newProduct.unit_price,
        default_vat_rate: newProduct.default_vat_rate,
      })
    } catch (err) {
      setIsSaving(false)
      setError('Fehler beim Speichern des Artikels')
    }
  }

  const selectedUnit = UNITS.find(u => u.value === newProduct.unit)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div>
          <h1 className="text-headline">Neuen Artikel erstellen</h1>
          <p className="mt-2 text-meta">
            Erstellen Sie einen wiederverwendbaren Artikel
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
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="z.B. Beratung Senior Developer"
              className="mt-1"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Beschreibung
            </Label>
            <Input
              id="description"
              type="text"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Optionale Beschreibung für die Rechnung"
              className="mt-1"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_price" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Preis pro Einheit *
              </Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={newProduct.unit_price}
                onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="unit" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Einheit *
              </Label>
              <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="unit"
                    variant="outline"
                    role="combobox"
                    aria-expanded={unitOpen}
                    className="mt-1 w-full justify-between"
                    style={{ height: 'auto', minHeight: '2.25rem' }}
                  >
                    {selectedUnit?.label || 'Einheit auswählen...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-zinc-200 dark:border-zinc-700" align="start">
                  <Command className="flex flex-col">
                    <CommandInput
                      placeholder="Einheit suchen..."
                      value={unitSearchQuery}
                      onValueChange={setUnitSearchQuery}
                    />
                    <CommandList className="flex-1 max-h-[200px] overflow-y-auto">
                      <CommandEmpty>Keine Einheit gefunden.</CommandEmpty>
                      <CommandGroup>
                        {UNITS.filter((unit) =>
                          unit.label.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
                          unit.value.toLowerCase().includes(unitSearchQuery.toLowerCase())
                        ).map((unit) => {
                          const isSelected = newProduct.unit === unit.value
                          return (
                            <CommandItem
                              key={unit.value}
                              value={unit.label}
                              onSelect={() => {
                                setNewProduct({ ...newProduct, unit: unit.value })
                                setUnitOpen(false)
                                setUnitSearchQuery('')
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
                                {unit.label}
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
          </div>

          <div>
            <Label htmlFor="default_vat_rate" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Standard-MwSt. (%)
            </Label>
            <Input
              id="default_vat_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={newProduct.default_vat_rate}
              onChange={(e) => setNewProduct({ ...newProduct, default_vat_rate: parseFloat(e.target.value) || 0 })}
              className="mt-1"
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
            disabled={isSaving || !newProduct.name}
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
