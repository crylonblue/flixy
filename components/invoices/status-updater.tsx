'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Invoice } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStatusLabel, getStatusClass } from '@/lib/invoice-utils'

interface StatusUpdaterProps {
  invoice: Invoice
}

type InvoiceStatus = 'sent' | 'reminded' | 'paid' | 'cancelled'

export default function StatusUpdater({ invoice }: StatusUpdaterProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
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

  // Cancelled is final - no actions available
  if (invoice.status === 'cancelled') {
    return (
      <span className={getStatusClass(invoice.status)}>
        {getStatusLabel(invoice.status)}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Zurück zu Versendet - von paid */}
      {invoice.status === 'paid' && (
        <Button
          onClick={() => handleStatusChange('sent')}
          disabled={isUpdating}
          variant="outline"
        >
          {isUpdating && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
          Zurück zu Versendet
        </Button>
      )}

      {/* Versenden - nur von created */}
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

      {/* Mahnen - nur von sent */}
      {invoice.status === 'sent' && (
        <Button
          onClick={() => handleStatusChange('reminded')}
          disabled={isUpdating}
          variant="outline"
        >
          {isUpdating && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
          Als gemahnt markieren
        </Button>
      )}

      {/* Bezahlt - von created, sent oder reminded */}
      {['created', 'sent', 'reminded'].includes(invoice.status) && (
        <Button
          onClick={() => handleStatusChange('paid')}
          disabled={isUpdating}
        >
          {isUpdating && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
          Als bezahlt markieren
        </Button>
      )}

      {/* Stornieren - von created, sent, reminded oder paid */}
      {['created', 'sent', 'reminded', 'paid'].includes(invoice.status) && (
        <Button
          onClick={() => handleStatusChange('cancelled')}
          disabled={isUpdating}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          {isUpdating && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
          Stornieren
        </Button>
      )}
    </div>
  )
}

