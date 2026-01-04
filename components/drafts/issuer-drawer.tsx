'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useIssuerDrawer } from '@/contexts/issuer-drawer-context'
import IssuerForm from './issuer-form'
import { IssuerSnapshot } from '@/types'

interface IssuerDrawerProps {
  defaultIssuer?: IssuerSnapshot
  onSelect: (issuer: IssuerSnapshot) => void
}

export default function IssuerDrawer({ defaultIssuer, onSelect }: IssuerDrawerProps) {
  const { isOpen, closeDrawer } = useIssuerDrawer()

  const handleSave = (issuer: IssuerSnapshot) => {
    onSelect(issuer)
    closeDrawer()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent 
        side="right" 
        className="w-full overflow-hidden p-0 bg-background flex flex-col"
        style={{ maxWidth: '42rem', backgroundColor: 'rgb(245, 245, 245)' }}
        onClose={closeDrawer}
      >
        <IssuerForm 
          defaultIssuer={defaultIssuer}
          onSave={handleSave}
          onCancel={closeDrawer}
        />
      </SheetContent>
    </Sheet>
  )
}

