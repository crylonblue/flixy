'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CustomerEditDrawerContextType {
  isOpen: boolean
  customerId: string | null
  openDrawer: (customerId: string | null) => void
  closeDrawer: () => void
}

const CustomerEditDrawerContext = createContext<CustomerEditDrawerContextType | undefined>(undefined)

export function CustomerEditDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)

  const openDrawer = (id: string | null) => {
    setCustomerId(id)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setCustomerId(null)
  }

  return (
    <CustomerEditDrawerContext.Provider value={{ isOpen, customerId, openDrawer, closeDrawer }}>
      {children}
    </CustomerEditDrawerContext.Provider>
  )
}

export function useCustomerEditDrawer() {
  const context = useContext(CustomerEditDrawerContext)
  if (context === undefined) {
    throw new Error('useCustomerEditDrawer must be used within a CustomerEditDrawerProvider')
  }
  return context
}
