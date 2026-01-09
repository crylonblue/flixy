'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCustomerEditDrawer } from '@/contexts/customer-edit-drawer-context'

export default function CustomersPageHeader() {
  const { openDrawer } = useCustomerEditDrawer()

  return (
    <div className="mb-12 flex items-center justify-between">
      <div>
        <h1 className="text-headline">Kunden</h1>
        <p className="mt-2 text-meta">
          Verwaltung Ihrer Kunden
        </p>
      </div>
      <Button
        onClick={() => openDrawer(null)}
        className="text-sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Neuer Kunde
      </Button>
    </div>
  )
}
