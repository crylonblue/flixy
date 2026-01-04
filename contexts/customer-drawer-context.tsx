'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CustomerDrawerContextType {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CustomerDrawerContext = createContext<CustomerDrawerContextType | undefined>(undefined)

export function CustomerDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = () => {
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
  }

  return (
    <CustomerDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </CustomerDrawerContext.Provider>
  )
}

export function useCustomerDrawer() {
  const context = useContext(CustomerDrawerContext)
  if (context === undefined) {
    throw new Error('useCustomerDrawer must be used within a CustomerDrawerProvider')
  }
  return context
}

