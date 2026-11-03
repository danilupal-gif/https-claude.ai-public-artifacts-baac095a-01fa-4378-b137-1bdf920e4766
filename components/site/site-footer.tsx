import Link from 'next/link'
import { brand, nav } from '@/lib/site'
import { Wordmark } from './wordmark'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 py-16 md:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="flex flex-col gap-5">
            <Wordmark />
            <p className="max-w-sm font-serif text-xl italic text-muted-foreground">{brand.story}</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {[...nav, { label: 'Client Portal', href: '/portal' }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="border-t border-border pt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brand.fullName} · {brand.tagline}
        </p>
      </div>
    </footer>
  )
}
