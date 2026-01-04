'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useCustomerDrawer } from '@/contexts/customer-drawer-context'
import CustomerForm from './customer-form'
import { createClient } from '@/lib/supabase/client'
import { CustomerSnapshot } from '@/types'
import { useState } from 'react'
import { toast } from 'sonner'

interface CustomerDrawerProps {
  companyId: string
  onSelect: (customer: CustomerSnapshot) => void
}

export default function CustomerDrawer({ companyId, onSelect }: CustomerDrawerProps) {
  const { isOpen, closeDrawer } = useCustomerDrawer()
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (snapshot: CustomerSnapshot) => {
    setIsSaving(true)

    try {
      // Save customer to database
      const { data, error } = await supabase
        .from('customers')
        .insert({
          company_id: companyId,
          name: snapshot.name,
          address: {
            street: snapshot.address.street,
            streetnumber: snapshot.address.streetnumber,
            city: snapshot.address.city,
            zip: snapshot.address.zip,
            country: snapshot.address.country,
          },
          email: snapshot.email || null,
          vat_id: snapshot.vat_id || null,
        })
        .select()
        .single()

      if (error) {
        alert('Fehler beim Erstellen des Kunden: ' + error.message)
        setIsSaving(false)
        return
      }

      if (data) {
        // Create snapshot with ID
        const customerSnapshot: CustomerSnapshot = {
          id: data.id,
          name: data.name,
          address: data.address as any,
          email: data.email || undefined,
          vat_id: data.vat_id || undefined,
        }
        
        // Show success toast
        toast.success('Kunde erfolgreich erstellt', {
          description: `${data.name} wurde hinzugefügt.`,
        })
        
        // Only close drawer after successful save and selection
        onSelect(customerSnapshot)
        setIsSaving(false)
        closeDrawer()
      }
    } catch (err) {
      alert('Fehler beim Erstellen des Kunden: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent 
        side="right" 
        className="w-full overflow-hidden p-0 bg-background flex flex-col"
        style={{ maxWidth: '42rem', backgroundColor: 'rgb(245, 245, 245)' }}
        onClose={closeDrawer}
      >
        <CustomerForm 
          companyId={companyId} 
          onSave={handleSave}
          onCancel={closeDrawer}
        />
      </SheetContent>
    </Sheet>
  )
}

