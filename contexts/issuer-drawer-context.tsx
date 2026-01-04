'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface IssuerDrawerContextType {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const IssuerDrawerContext = createContext<IssuerDrawerContextType | undefined>(undefined)

export function IssuerDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = () => {
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
  }

  return (
    <IssuerDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </IssuerDrawerContext.Provider>
  )
}

export function useIssuerDrawer() {
  const context = useContext(IssuerDrawerContext)
  if (context === undefined) {
    throw new Error('useIssuerDrawer must be used within an IssuerDrawerProvider')
  }
  return context
}

