import Link from 'next/link'
import { Wordmark } from '@/components/site/wordmark'
import { SignOutButton } from '@/components/portal/sign-out-button'
import { PrintButton } from './print-button'

export function DashboardHeader({ viewerName, isAdmin }: { viewerName: string; isAdmin: boolean }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" aria-label="ÉLEVÉ Business Partners website">
          <Wordmark subtitle="Client Portal" />
        </Link>
        <div className="flex items-center gap-5 md:gap-8">
          <span className="hidden text-sm text-muted-foreground md:inline">Signed in as {viewerName}</span>
          {isAdmin ? (
            <Link
              href="/portal/admin"
              className="text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          ) : null}
          <PrintButton />
          <SignOutButton compact />
        </div>
      </div>
    </header>
  )
}
