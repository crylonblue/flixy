'use client'

import { LineItem } from '@/types'
import { Input } from '@/components/ui/input'

interface LineItemsEditorProps {
  lineItems: LineItem[]
  onChange: (items: LineItem[]) => void
}

export default function LineItemsEditor({ lineItems, onChange }: LineItemsEditorProps) {
  const addLineItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unit_price: 0,
      vat_rate: 19,
      total: 0,
    }
    onChange([...lineItems, newItem])
  }

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    const updated = lineItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates }
        // Recalculate total
        updatedItem.total = updatedItem.quantity * updatedItem.unit_price
        return updatedItem
      }
      return item
    })
    onChange(updated)
  }

  const removeLineItem = (id: string) => {
    onChange(lineItems.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-4">
      {lineItems.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Noch keine Positionen hinzugefügt.
        </p>
      ) : (
        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Position {index + 1}
                </span>
                <button
                  onClick={() => removeLineItem(item.id)}
                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Entfernen
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Beschreibung
                  </label>
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                    placeholder="z.B. Beratungsleistung"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Menge
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Einzelpreis
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateLineItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      MwSt. %
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.vat_rate}
                      onChange={(e) =>
                        updateLineItem(item.id, { vat_rate: parseFloat(e.target.value) || 0 })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-black dark:text-zinc-50">
                    Gesamt:{' '}
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(item.total)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addLineItem}
        className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        + Position hinzufügen
      </button>
    </div>
  )
}

