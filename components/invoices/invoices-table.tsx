'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Invoice } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface InvoicesTableProps {
  invoices: Invoice[]
}

export default function InvoicesTable({ invoices }: InvoicesTableProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'created':
        return 'status-badge info'
      case 'sent':
        return 'status-badge warning'
      case 'paid':
        return 'status-badge success'
      default:
        return 'status-badge info'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'created':
        return 'Erstellt'
      case 'sent':
        return 'Versendet'
      case 'paid':
        return 'Bezahlt'
      default:
        return status
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rechnungsnummer</TableHead>
          <TableHead>Kunde</TableHead>
          <TableHead className="text-right">Betrag</TableHead>
          <TableHead>Rechnungsdatum</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const customerSnapshot = invoice.customer_snapshot as any

          return (
            <TableRow
              key={invoice.id}
              className="cursor-pointer"
            >
              <TableCell>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="font-medium hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {invoice.invoice_number || 'Keine Nummer'}
                </Link>
              </TableCell>
              <TableCell style={{ color: 'var(--text-secondary)' }}>
                {customerSnapshot?.name || 'Unbekannter Kunde'}
              </TableCell>
              <TableCell className="text-right">
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(invoice.total_amount)}
                </div>
              </TableCell>
              <TableCell style={{ color: 'var(--text-secondary)' }}>
                {invoice.invoice_date
                  ? format(new Date(invoice.invoice_date), 'd. MMM yyyy', { locale: de })
                  : '-'}
              </TableCell>
              <TableCell>
                <span className={getStatusClass(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </span>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

