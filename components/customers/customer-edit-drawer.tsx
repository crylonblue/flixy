'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useCustomerEditDrawer } from '@/contexts/customer-edit-drawer-context'
import CustomerEditForm from './customer-edit-form'
import { Customer } from '@/types'
import { createClient } from '@/lib/supabase/client'

export default function CustomerEditDrawer() {
  const { isOpen, customerId, closeDrawer } = useCustomerEditDrawer()
  const router = useRouter()
  const supabase = createClient()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load customer when drawer opens
  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomer(customerId)
    } else if (isOpen && !customerId) {
      // For creating new customer, set customer to null
      setCustomer(null)
      setError(null)
    }
  }, [isOpen, customerId])

  const loadCustomer = async (id: string) => {
    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !data) {
      setError(fetchError?.message || 'Fehler beim Laden des Kunden')
      setIsLoading(false)
      return
    }

    setCustomer(data)
    setIsLoading(false)
  }

  const handleClose = () => {
    closeDrawer()
    setCustomer(null)
    setError(null)
    // Delay refresh to ensure state updates are processed
    setTimeout(() => {
      router.refresh()
    }, 100)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent 
        side="right" 
        className="w-full overflow-hidden p-0 bg-background flex flex-col"
        style={{ maxWidth: '42rem', backgroundColor: 'rgb(245, 245, 245)' }}
        onClose={handleClose}
      >
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-secondary">Lädt...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1">
            <div className="message-error">{error}</div>
          </div>
        ) : (
          <CustomerEditForm customer={customer} onClose={handleClose} />
        )}
      </SheetContent>
    </Sheet>
  )
}
