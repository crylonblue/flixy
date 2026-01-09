'use client'

import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Customer } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCustomerEditDrawer } from '@/contexts/customer-edit-drawer-context'

interface CustomersTableProps {
  customers: Customer[]
}

export default function CustomersTable({ customers }: CustomersTableProps) {
  const { openDrawer } = useCustomerEditDrawer()

  const formatAddress = (address: any) => {
    if (!address) return '-'
    const parts = []
    if (address.street && address.streetnumber) {
      parts.push(`${address.street} ${address.streetnumber}`)
    } else if (address.street) {
      parts.push(address.street)
    }
    if (address.zip && address.city) {
      parts.push(`${address.zip} ${address.city}`)
    }
    if (address.country) {
      parts.push(address.country)
    }
    return parts.length > 0 ? parts.join(', ') : '-'
  }

  const handleCustomerClick = (customerId: string) => {
    openDrawer(customerId)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Adresse</TableHead>
          <TableHead>E-Mail</TableHead>
          <TableHead>USt-IdNr.</TableHead>
          <TableHead>Erstellt am</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => {
          const address = customer.address as any

          return (
            <TableRow
              key={customer.id}
              className="cursor-pointer"
              onClick={() => handleCustomerClick(customer.id)}
            >
              <TableCell>
                <span
                  className="font-medium hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {customer.name}
                </span>
              </TableCell>
              <TableCell style={{ color: 'var(--text-secondary)' }}>
                {formatAddress(address)}
              </TableCell>
              <TableCell style={{ color: 'var(--text-secondary)' }}>
                {customer.email || '-'}
              </TableCell>
              <TableCell style={{ color: 'var(--text-secondary)' }}>
                {customer.vat_id || '-'}
              </TableCell>
              <TableCell style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(customer.created_at), 'd. MMM yyyy', { locale: de })}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

