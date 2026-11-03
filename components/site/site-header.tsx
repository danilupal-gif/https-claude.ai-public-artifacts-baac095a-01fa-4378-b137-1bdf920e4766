import Link from 'next/link'
import { brand, nav } from '@/lib/site'
import { Wordmark } from './wordmark'
import { MobileNav } from './mobile-nav'

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" aria-label={`${brand.fullName}, home`}>
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="hidden border border-primary/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:inline-flex"
          >
            Client Portal
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
