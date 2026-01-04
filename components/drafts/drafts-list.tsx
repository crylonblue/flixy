'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useDraftDrawer } from '@/contexts/draft-drawer-context'
import { Invoice } from '@/types'

interface DraftsListProps {
  drafts: Invoice[]
  showEmptyLink?: boolean
}

export default function DraftsList({ drafts, showEmptyLink }: DraftsListProps) {
  const { openDrawer } = useDraftDrawer()

  const handleNewDraft = () => {
    openDrawer(null)
  }

  if (showEmptyLink) {
    return (
      <button
        onClick={handleNewDraft}
        className="mt-4 inline-block text-sm font-medium hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        Ersten Entwurf erstellen →
      </button>
    )
  }

  return (
    <Button onClick={handleNewDraft}>
      Neuer Entwurf
    </Button>
  )
}
