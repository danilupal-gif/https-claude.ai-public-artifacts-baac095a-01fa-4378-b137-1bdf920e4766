import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ClientSpotlight } from '@/components/site/client-spotlight'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { getPublishedCaseStudies } from '@/lib/case-studies'
import { beforeMenuSrc, getSpotlight } from '@/lib/spotlight'

export const metadata: Metadata = {
  title: 'Results',
  description:
    'Client work and measured results from business owners who simplified their operations, grew their online presence and automated the everyday work with ÉLEVÉ.',
}

export default async function ResultsPage() {
  const [studies, spotlight] = await Promise.all([getPublishedCaseStudies(), getSpotlight()])

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-svh max-w-7xl flex-col gap-14 px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <header className="flex max-w-3xl flex-col gap-5">
          <p className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
            <span className="h-px w-12 bg-primary" aria-hidden="true" />
            Results
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] text-balance md:text-7xl">Real businesses. Measured results.</h1>
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
            Every engagement starts with numbers recorded before anything changes, so the results here are measured, not guessed.
            Each story is shared with the owner&apos;s permission.
          </p>
        </header>

        <ClientSpotlight
          metrics={spotlight.metrics}
          quote={spotlight.quote}
          quoteBy={spotlight.quoteBy}
          beforeMenuSrc={beforeMenuSrc(spotlight)}
        />

        {studies.length ? (
          <section aria-labelledby="studies-title" className="flex flex-col gap-6">
            <h2 id="studies-title" className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
              Case studies
            </h2>
            <ul className={`grid gap-6 lining-nums ${studies.length > 1 ? 'md:grid-cols-2' : 'max-w-3xl'}`}>
              {studies.map((s) => (
                <li key={s.publicSlug} className="border border-border bg-background">
                  <Link href={`/case-studies/${s.publicSlug}`} className="group flex h-full flex-col gap-6 p-8 transition-colors hover:bg-card">
                    <span className="text-xs uppercase tracking-[0.3em] text-primary">
                      {s.displayName}
                      {s.industry ? ` · ${s.industry}` : ''}
                    </span>
                    <span className="font-serif text-3xl leading-tight text-balance">{s.headline}</span>
                    <span className="leading-relaxed text-muted-foreground text-pretty">{s.summary}</span>
                    {s.results[0] ? (
                      <span className="mt-auto flex flex-col gap-2 border-t border-border pt-5">
                        <span className="text-sm text-muted-foreground">{s.results[0].label}</span>
                        <span className="font-serif text-3xl">
                          <span className="text-muted-foreground line-through decoration-primary/60">{s.results[0].before}</span>{' '}
                          <span className="text-primary" aria-hidden="true">
                            →
                          </span>
                          <span className="sr-only">to</span> {s.results[0].after}
                        </span>
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
                      Read the story
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          aria-labelledby="results-cta-title"
          className="flex flex-col gap-6 border-t border-border pt-14 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 id="results-cta-title" className="font-serif text-4xl leading-tight text-balance md:text-5xl">
              Want results like these?
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
              Start with a Business Workflow Review. We&apos;ll find what&apos;s slowing your business down and record your
              starting numbers, so your results can be measured too.
            </p>
          </div>
          <Link
            href="/?service=Business%20Workflow%20Review#contact"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-3 bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90 md:w-fit"
          >
            Book a Workflow Review
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
