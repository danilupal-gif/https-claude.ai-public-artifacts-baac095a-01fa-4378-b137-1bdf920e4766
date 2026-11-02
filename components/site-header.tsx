import { plan } from '@/lib/plan'
import { PrintButton } from './print-button'

const links = [
  { href: '#priorities', label: 'Priorities' },
  { href: '#timeline', label: 'Timeline' },
  { href: '#journey', label: 'Journey' },
  { href: '#measures', label: 'Measures' },
  { href: '#needs', label: 'From you' },
  { href: '#review', label: 'Review' },
]

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
        <div className="flex flex-col">
          <span className="font-serif text-base font-semibold tracking-wide text-primary">{plan.firm}</span>
          <span className="text-xs text-muted-foreground">{plan.tagline}</span>
        </div>
        <PrintButton />
      </div>
      <nav aria-label="Plan sections" className="mx-auto max-w-5xl overflow-x-auto px-3">
        <ul className="flex gap-1 pb-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
