import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const features = [
  'Your full plan, with the decisions we made together',
  'A shared checklist with reminders before things are due',
  'One place to send me what I ask for',
  'A PDF copy whenever you need one',
]

export function PortalCallout() {
  return (
    <section aria-labelledby="portal-title" className="border-t border-border">
      <div className="mx-auto grid max-w-7xl md:grid-cols-12">
        <div className="relative aspect-[4/3] md:col-span-5 md:aspect-auto md:min-h-[32rem]">
          <Image
            src="/images/portal-folio.png"
            alt="A leather client folio, brass key and a planner with ticked checklist items on a walnut desk"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-8 px-5 py-16 md:col-span-7 md:px-14 md:py-20">
          <div className="flex flex-col gap-4">
            <p className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
              <span className="h-px w-10 bg-primary" aria-hidden="true" />
              Client portal
            </p>
            <h2 id="portal-title" className="font-serif text-4xl leading-tight text-balance md:text-5xl">
              Already a client? Everything we&apos;re working on lives here.
            </h2>
          </div>
          <ul className="flex flex-col">
            {features.map((f) => (
              <li key={f} className="flex items-baseline gap-4 border-t border-border py-3 leading-relaxed text-muted-foreground">
                <span className="size-1.5 shrink-0 translate-y-[-2px] bg-primary" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/portal"
            className="inline-flex items-center gap-3 self-start border border-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Open client portal
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
