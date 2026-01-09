'use client'

import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Invoice } from '@/types'
import { useInvoiceDrawer } from '@/contexts/invoice-drawer-context'
import { isOverdue, getStatusLabel, getStatusClass } from '@/lib/invoice-utils'
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
  const { openDrawer } = useInvoiceDrawer()

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
              className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              onClick={() => openDrawer(invoice.id)}
            >
              <TableCell>
                <span
                  className="font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {invoice.invoice_number || 'Keine Nummer'}
                </span>
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
                <div className="flex items-center gap-2">
                  <span className={getStatusClass(invoice.status)}>
                    {getStatusLabel(invoice.status)}
                  </span>
                  {isOverdue(invoice) && (
                    <span className="status-badge error">
                      Überfällig
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

