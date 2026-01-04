'use client'

import Sidebar from './sidebar'
import { DraftDrawerProvider } from '@/contexts/draft-drawer-context'
import { CustomerDrawerProvider } from '@/contexts/customer-drawer-context'
import { IssuerDrawerProvider } from '@/contexts/issuer-drawer-context'
import DraftDrawer from '@/components/drafts/draft-drawer'
import { Toaster } from '@/components/ui/sonner'

interface AppLayoutProps {
  children: React.ReactNode
  companyName: string
  userEmail: string
  userName?: string | null
  companyId: string
}

export default function AppLayout({ children, companyName, userEmail, userName, companyId }: AppLayoutProps) {
  return (
    <DraftDrawerProvider>
      <CustomerDrawerProvider>
        <IssuerDrawerProvider>
          <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
            {/* Sidebar */}
            <Sidebar companyName={companyName} userEmail={userEmail} userName={userName} />

            {/* Main Content */}
            <main className="flex-1 pl-80">
              {children}
            </main>

            {/* Draft Drawer */}
            <DraftDrawer />
          </div>
          <Toaster />
        </IssuerDrawerProvider>
      </CustomerDrawerProvider>
    </DraftDrawerProvider>
  )
}

