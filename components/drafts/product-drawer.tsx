'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useProductDrawer } from '@/contexts/product-drawer-context'
import ProductForm from './product-form'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProductDrawerProps {
  companyId: string
  onSelect: (product: Product) => void
}

export default function ProductDrawer({ companyId, onSelect }: ProductDrawerProps) {
  const { isOpen, closeDrawer } = useProductDrawer()
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (productData: Omit<Product, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    setIsSaving(true)

    try {
      // Save product to database
      const { data, error } = await supabase
        .from('products')
        .insert({
          company_id: companyId,
          name: productData.name,
          description: productData.description,
          unit: productData.unit,
          unit_price: productData.unit_price,
          default_vat_rate: productData.default_vat_rate,
        })
        .select()
        .single()

      if (error) {
        alert('Fehler beim Erstellen des Artikels: ' + error.message)
        setIsSaving(false)
        return
      }

      if (data) {
        // Show success toast
        toast.success('Artikel erfolgreich erstellt', {
          description: `${data.name} wurde hinzugefügt.`,
        })
        
        // Only close drawer after successful save and selection
        onSelect(data)
        setIsSaving(false)
        closeDrawer()
      }
    } catch (err) {
      alert('Fehler beim Erstellen des Artikels: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
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
        <ProductForm 
          companyId={companyId} 
          onSave={handleSave}
          onCancel={closeDrawer}
        />
      </SheetContent>
    </Sheet>
  )
}
