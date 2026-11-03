import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Wordmark } from '@/components/site/wordmark'

export function AuthShell({
  title,
  intro,
  children,
  footer,
}: {
  title: string
  intro: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-5 py-6 md:px-10">
        <Link href="/" aria-label="ÉLEVÉ Business Partners, home">
          <Wordmark subtitle="Client Portal" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Website
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
              <span className="h-px w-10 bg-primary" aria-hidden="true" />
              Private
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-balance">{title}</h1>
            <p className="leading-relaxed text-muted-foreground">{intro}</p>
          </div>
          <div className="border border-border bg-card p-6 md:p-8">{children}</div>
          {footer ? <div className="text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  )
}

export const fieldInput =
  'w-full border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none'

export const fieldLabel = 'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'

export const primaryButton =
  'inline-flex w-full items-center justify-center gap-3 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60'
