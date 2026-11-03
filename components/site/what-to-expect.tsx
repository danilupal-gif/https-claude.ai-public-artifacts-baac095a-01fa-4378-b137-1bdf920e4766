import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { consultation } from '@/lib/site'

export function WhatToExpect() {
  return (
    <section id="expect" aria-labelledby="expect-title" className="scroll-mt-16 border-t border-border bg-card py-24 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-5 md:px-8">
        <div className="flex max-w-3xl flex-col gap-5">
          <p className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
            <span className="h-px w-12 bg-primary" aria-hidden="true" />
            Your consultation
          </p>
          <h2 id="expect-title" className="font-serif text-5xl leading-[1.05] text-balance md:text-6xl">
            Exactly what to expect.
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">{consultation.intro}</p>
        </div>

        <ol className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {consultation.steps.map((s) => (
            <li key={s.title} className="flex flex-col gap-3 bg-background p-7">
              <span className="text-xs uppercase tracking-[0.24em] text-primary">{s.when}</span>
              <h3 className="font-serif text-2xl leading-snug">{s.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-foreground">You walk away with</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {consultation.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-3 leading-relaxed">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-3 bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book a Workflow Review
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
