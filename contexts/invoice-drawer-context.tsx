'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface InvoiceDrawerContextType {
  isOpen: boolean
  invoiceId: string | null
  openDrawer: (invoiceId: string) => void
  closeDrawer: () => void
}

const InvoiceDrawerContext = createContext<InvoiceDrawerContextType | undefined>(undefined)

export function InvoiceDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)

  const openDrawer = (id: string) => {
    setInvoiceId(id)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setInvoiceId(null)
  }

  return (
    <InvoiceDrawerContext.Provider value={{ isOpen, invoiceId, openDrawer, closeDrawer }}>
      {children}
    </InvoiceDrawerContext.Provider>
  )
}

export function useInvoiceDrawer() {
  const context = useContext(InvoiceDrawerContext)
  if (context === undefined) {
    throw new Error('useInvoiceDrawer must be used within an InvoiceDrawerProvider')
  }
  return context
}
