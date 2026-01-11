'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ProductDrawerContextType {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const ProductDrawerContext = createContext<ProductDrawerContextType | undefined>(undefined)

export function ProductDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = () => {
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
  }

  return (
    <ProductDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </ProductDrawerContext.Provider>
  )
}

export function useProductDrawer() {
  const context = useContext(ProductDrawerContext)
  if (context === undefined) {
    throw new Error('useProductDrawer must be used within a ProductDrawerProvider')
  }
  return context
}
