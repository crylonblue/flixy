'use client'

import { Invoice, Company, CustomerSnapshot, LineItem } from '@/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface InvoiceViewProps {
  invoice: Invoice
  company: Company | null
}

export default function InvoiceView({ invoice, company }: InvoiceViewProps) {
  const customerSnapshot = invoice.customer_snapshot as CustomerSnapshot
  const lineItems = invoice.line_items as LineItem[]
  const companyAddress = company?.address as any

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Von</h3>
          <p className="mt-2 font-semibold text-black dark:text-zinc-50">{company?.name}</p>
          {companyAddress && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {companyAddress.street}
              <br />
              {companyAddress.zip} {companyAddress.city}
              <br />
              {companyAddress.country}
            </p>
          )}
          {company?.vat_id && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
              USt-IdNr.: {company.vat_id}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">An</h3>
          {customerSnapshot ? (
            <>
              <p className="mt-2 font-semibold text-black dark:text-zinc-50">
                {customerSnapshot.name}
              </p>
              {customerSnapshot.address && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {customerSnapshot.address.street} {customerSnapshot.address.streetnumber || ''}
                  <br />
                  {customerSnapshot.address.zip} {customerSnapshot.address.city}
                  <br />
                  {customerSnapshot.address.country}
                </p>
              )}
              {customerSnapshot.vat_id && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                  USt-IdNr.: {customerSnapshot.vat_id}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Kein Kunde angegeben</p>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-8 border-t border-zinc-200 pt-8 dark:border-zinc-700">
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rechnungsnummer</h3>
          <p className="mt-1 text-sm font-medium text-black dark:text-zinc-50">
            {invoice.invoice_number || '-'}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rechnungsdatum</h3>
          <p className="mt-1 text-sm font-medium text-black dark:text-zinc-50">
            {invoice.invoice_date
              ? format(new Date(invoice.invoice_date), 'd. MMMM yyyy', { locale: de })
              : '-'}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Fälligkeitsdatum</h3>
          <p className="mt-1 text-sm font-medium text-black dark:text-zinc-50">
            {invoice.due_date
              ? format(new Date(invoice.due_date), 'd. MMMM yyyy', { locale: de })
              : '-'}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">Positionen</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Beschreibung
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Menge
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Einzelpreis
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  MwSt.
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Gesamt
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 text-sm text-black dark:text-zinc-50">
                    {item.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-600 dark:text-zinc-400">
                    {item.vat_rate}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-black dark:text-zinc-50">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-8 dark:border-zinc-700">
        <div className="ml-auto w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Zwischensumme</span>
            <span className="text-black dark:text-zinc-50">
              {new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
              }).format(invoice.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">MwSt.</span>
            <span className="text-black dark:text-zinc-50">
              {new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
              }).format(invoice.vat_amount)}
            </span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-lg font-semibold dark:border-zinc-700">
            <span className="text-black dark:text-zinc-50">Gesamt</span>
            <span className="text-black dark:text-zinc-50">
              {new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
              }).format(invoice.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {invoice.invoice_file_reference && (
        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-700">
          <a
            href={invoice.invoice_file_reference}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            PDF herunterladen
          </a>
        </div>
      )}
    </div>
  )
}

