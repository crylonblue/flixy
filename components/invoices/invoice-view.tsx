'use client'

import { useState } from 'react'
import { Invoice, Company, CustomerSnapshot, LineItem } from '@/types'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { FileText, FileCode } from 'lucide-react'

interface InvoiceViewProps {
  invoice: Invoice
  company: Company | null
}

export default function InvoiceView({ invoice, company }: InvoiceViewProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isDownloadingXml, setIsDownloadingXml] = useState(false)
  
  const customerSnapshot = invoice.customer_snapshot as unknown as CustomerSnapshot
  const lineItems = invoice.line_items as unknown as LineItem[]
  const companyAddress = company?.address as any

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der PDF')
      }
      
      window.open(data.pdf_url || data.url, '_blank')
    } catch (err) {
      console.error('Error downloading PDF:', err)
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const handleDownloadXml = async () => {
    setIsDownloadingXml(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der XML')
      }
      
      if (data.xml_url) {
        window.open(data.xml_url, '_blank')
      }
    } catch (err) {
      console.error('Error downloading XML:', err)
    } finally {
      setIsDownloadingXml(false)
    }
  }

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

      {(invoice.pdf_url || invoice.invoice_file_reference || invoice.xml_url) && (
        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-700">
          <div className="flex gap-3">
            {(invoice.pdf_url || invoice.invoice_file_reference) && (
              <Button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
              >
                <FileText className="h-4 w-4 mr-2" />
                {isDownloadingPdf ? 'Lädt...' : 'PDF herunterladen'}
              </Button>
            )}
            {invoice.xml_url && (
              <Button
                variant="outline"
                onClick={handleDownloadXml}
                disabled={isDownloadingXml}
              >
                <FileCode className="h-4 w-4 mr-2" />
                {isDownloadingXml ? 'Lädt...' : 'XML herunterladen (XRechnung/ZUGFeRD)'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

