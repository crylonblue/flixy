'use client'

import { CustomerSnapshot, LineItem, IssuerSnapshot } from '@/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface InvoicePreviewProps {
  customer: CustomerSnapshot | null
  issuer: IssuerSnapshot | null
  lineItems: LineItem[]
  invoiceDate: string | null
  dueDate: string | null
}

export default function InvoicePreview({
  customer,
  issuer,
  lineItems,
  invoiceDate,
  dueDate,
}: InvoicePreviewProps) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const vatAmount = lineItems.reduce((sum, item) => sum + (item.total * item.vat_rate) / 100, 0)
  const totalAmount = subtotal + vatAmount

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-6 text-lg font-semibold text-black dark:text-zinc-50">Vorschau</h2>

      <div className="space-y-6">
        {issuer && (
          <div>
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Absender</h3>
            <p className="mt-1 font-medium text-black dark:text-zinc-50">{issuer.name}</p>
            {issuer.address && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {issuer.address.street} {issuer.address.streetnumber || ''}
                <br />
                {issuer.address.zip} {issuer.address.city}
                <br />
                {issuer.address.country}
              </p>
            )}
            {issuer.vat_id && (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                USt-IdNr.: {issuer.vat_id}
              </p>
            )}
            {issuer.tax_id && (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Steuernummer: {issuer.tax_id}
              </p>
            )}
          </div>
        )}

        {customer ? (
          <div>
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rechnungsempfänger</h3>
            <p className="mt-1 font-medium text-black dark:text-zinc-50">{customer.name}</p>
            {customer.address && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {customer.address.street} {customer.address.streetnumber || ''}
                <br />
                {customer.address.zip} {customer.address.city}
                <br />
                {customer.address.country}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-zinc-100 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Bitte wählen Sie einen Kunden aus.
          </div>
        )}

        {invoiceDate && (
          <div>
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rechnungsdatum</h3>
            <p className="mt-1 text-sm text-black dark:text-zinc-50">
              {format(new Date(invoiceDate), 'd. MMMM yyyy', { locale: de })}
            </p>
          </div>
        )}

        {dueDate && (
          <div>
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Fälligkeitsdatum</h3>
            <p className="mt-1 text-sm text-black dark:text-zinc-50">
              {format(new Date(dueDate), 'd. MMMM yyyy', { locale: de })}
            </p>
          </div>
        )}

        {lineItems.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Positionen</h3>
            <div className="space-y-2">
              {lineItems.map((item) => (
                <div key={item.id} className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black dark:text-zinc-50">
                      {item.description || 'Keine Beschreibung'}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {item.quantity} ×{' '}
                      {new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(item.unit_price)}{' '}
                      ({item.vat_rate}% MwSt.)
                    </p>
                  </div>
                  <p className="text-sm font-medium text-black dark:text-zinc-50">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(item.total)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Zwischensumme</span>
                <span className="text-black dark:text-zinc-50">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">MwSt.</span>
                <span className="text-black dark:text-zinc-50">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(vatAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
                <span className="font-semibold text-black dark:text-zinc-50">Gesamt</span>
                <span className="font-semibold text-black dark:text-zinc-50">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

