'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Invoice } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatusUpdaterProps {
  invoice: Invoice
}

export default function StatusUpdater({ invoice }: StatusUpdaterProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: 'sent' | 'paid') => {
    setIsUpdating(true)
    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoice.id)

    if (error) {
      alert('Fehler beim Aktualisieren des Status: ' + error.message)
    } else {
      router.refresh()
    }
    setIsUpdating(false)
  }

  if (invoice.status === 'paid') {
    return (
      <span className="status-badge success">
        Bezahlt
      </span>
    )
  }

  return (
    <div className="flex gap-2">
      {invoice.status === 'created' && (
        <Button
          onClick={() => handleStatusChange('sent')}
          disabled={isUpdating}
          variant="outline"
        >
          {isUpdating && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
          Als versendet markieren
        </Button>
      )}
      {(invoice.status === 'created' || invoice.status === 'sent') && (
        <Button
          onClick={() => handleStatusChange('paid')}
          disabled={isUpdating}
        >
          {isUpdating && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
          Als bezahlt markieren
        </Button>
      )}
    </div>
  )
}

