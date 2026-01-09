'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCustomerEditDrawer } from '@/contexts/customer-edit-drawer-context'

export default function CustomersEmptyState() {
  const { openDrawer } = useCustomerEditDrawer()

  return (
    <div className="card card-subtle p-12 text-center">
      <p className="text-secondary">Noch keine Kunden vorhanden.</p>
      <p className="mt-2 text-sm text-meta">
        Kunden können auch beim Erstellen einer Rechnung angelegt werden.
      </p>
      <div className="mt-6">
        <Button
          onClick={() => openDrawer(null)}
          className="text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ersten Kunden erstellen
        </Button>
      </div>
    </div>
  )
}
