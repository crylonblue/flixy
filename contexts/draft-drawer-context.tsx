'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DraftDrawerContextType {
  isOpen: boolean
  draftId: string | null
  openDrawer: (draftId: string | null) => void
  closeDrawer: () => void
}

const DraftDrawerContext = createContext<DraftDrawerContextType | undefined>(undefined)

export function DraftDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)

  const openDrawer = (id: string | null) => {
    setDraftId(id)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setDraftId(null)
  }

  return (
    <DraftDrawerContext.Provider value={{ isOpen, draftId, openDrawer, closeDrawer }}>
      {children}
    </DraftDrawerContext.Provider>
  )
}

export function useDraftDrawer() {
  const context = useContext(DraftDrawerContext)
  if (context === undefined) {
    throw new Error('useDraftDrawer must be used within a DraftDrawerProvider')
  }
  return context
}

