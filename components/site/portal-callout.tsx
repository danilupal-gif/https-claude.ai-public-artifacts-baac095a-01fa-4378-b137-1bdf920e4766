import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'

export function PortalCallout() {
  return (
    <section aria-labelledby="portal-title" className="border-t border-border py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 md:flex-row md:items-center md:px-8">
        <div className="flex items-start gap-5">
          <span className="flex size-12 shrink-0 items-center justify-center border border-primary/50 text-primary">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 id="portal-title" className="font-serif text-3xl md:text-4xl">
              Already a client?
            </h2>
            <p className="max-w-xl leading-relaxed text-muted-foreground">
              Your private portal holds your plan, milestones, what we need from you, and a direct line to Danielle.
            </p>
          </div>
        </div>
        <Link
          href="/portal"
          className="inline-flex items-center gap-3 border border-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Open client portal
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
