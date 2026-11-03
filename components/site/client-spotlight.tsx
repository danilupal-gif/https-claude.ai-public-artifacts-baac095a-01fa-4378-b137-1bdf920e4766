import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import type { SpotlightPair } from '@/lib/spotlight'

type StepStatus = 'done' | 'now' | 'next'

const steps: { title: string; body: string; status: StepStatus; service?: string }[] = [
  {
    title: 'Website Creation',
    body: 'A brand-new website that gives guests one place to find the menu, weekly events, the gallery, reviews and careers.',
    status: 'done',
    service: 'Website Creation',
  },
  {
    title: 'Digital Menu Design & Management',
    body: 'A searchable digital menu for cocktails, hookah, cigars and food, with photos and prices that stay easy to update.',
    status: 'done',
    service: 'Digital Menu Design & Management',
  },
  {
    title: 'Workforce Scheduling & Automation',
    body: 'Automated shift scheduling and staff access, so the team is organized and ready from day one.',
    status: 'now',
    service: 'Workforce Scheduling & Automation',
  },
  {
    title: 'Food & Beverage Ordering Optimization',
    body: 'A streamlined ordering system that makes it faster to take, track and fill food and drink orders.',
    status: 'now',
    service: 'Food & Beverage Ordering Optimization',
  },
  {
    title: 'Full case study',
    body: 'After the grand opening, we’ll share the results of this digital work from start to finish.',
    status: 'next',
  },
]

const statusLabel: Record<StepStatus, string> = { done: 'Delivered', now: 'Working on now', next: 'Coming next' }

function serviceHref(service: string) {
  return `/?service=${encodeURIComponent(service)}#contact`
}

function StepMarker({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-4" aria-hidden="true" />
      </span>
    )
  }
  if (status === 'now') {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card">
        <span className="size-2.5 rounded-full bg-primary" />
      </span>
    )
  }
  return <span className="size-7 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/60 bg-card" />
}

export function ClientSpotlight({
  metrics,
  quote,
  quoteBy,
  beforeMenuSrc,
}: {
  metrics: SpotlightPair[]
  quote: string
  quoteBy: string
  beforeMenuSrc: string | null
}) {
  return (
    <section aria-labelledby="spotlight-title" className="flex flex-col gap-12 border border-border bg-card p-5 md:p-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Client spotlight · Hospitality</p>
        <h2 id="spotlight-title" className="font-serif text-4xl leading-tight text-balance md:text-5xl">
          Vibes Lounge
        </h2>
        <p className="text-sm text-muted-foreground">Devin Mooring, owner · Grand opening coming soon</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <figure className="flex flex-col gap-3 lg:sticky lg:top-28">
          <div className="relative pb-10 md:pb-14">
            <div className="relative aspect-[16/10] w-[82%] overflow-hidden border border-border">
              <Image
                src="/images/work/vibes-lounge-site.png"
                alt="The Vibes Lounge website homepage, with the lounge name in gold over a photo of the interior and a cocktail menu card."
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-top"
              />
            </div>
            <div className="absolute bottom-0 right-0 aspect-[390/844] w-[34%] overflow-hidden rounded-2xl border-4 border-background shadow-2xl">
              <Image
                src="/images/work/vibes-lounge-menu.png"
                alt="The Vibes Lounge digital menu on a phone, listing signature cocktails with prices and photos."
                fill
                sizes="(min-width: 1024px) 14vw, 34vw"
                className="object-cover object-top"
              />
            </div>
          </div>
          <figcaption className="text-xs text-muted-foreground">The new website and digital menu.</figcaption>
        </figure>

        <div className="flex flex-col gap-10">
          <p className="text-lg leading-relaxed text-pretty">
            Devin brought ÉLEVÉ in ahead of opening to give Vibes Lounge a strong online presence from the start. We began with
            digital optimization: a new website and a digital menu that make the lounge easy to find, easy to browse, and ready to
            grow its following before the doors open.
          </p>

          {metrics.length ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Early numbers</h3>
              <dl className="grid grid-cols-2 gap-px border border-border bg-border lining-nums">
                {metrics.map((m) => (
                  <div key={m.label} className="flex flex-col-reverse gap-1 bg-card p-4">
                    <dt className="text-sm leading-snug text-muted-foreground">{m.label}</dt>
                    <dd className="font-serif text-3xl">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Project progress</h3>
            <ol className="flex flex-col">
              {steps.map((step, i) => (
                <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < steps.length - 1 ? (
                    <span
                      className={`absolute left-3.5 top-7 bottom-0 w-px -translate-x-1/2 ${
                        step.status === 'done' ? 'bg-primary' : 'bg-border'
                      }`}
                      aria-hidden="true"
                    />
                  ) : null}
                  <StepMarker status={step.status} />
                  <div className="flex min-w-0 flex-col gap-1">
                    <span
                      className={`text-xs uppercase tracking-[0.22em] ${
                        step.status === 'next' ? 'text-muted-foreground' : 'text-primary'
                      }`}
                    >
                      {statusLabel[step.status]}
                    </span>
                    {step.service ? (
                      <Link
                        href={serviceHref(step.service)}
                        className="group w-fit font-serif text-xl underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                      >
                        {step.title.split(' ').slice(0, -1).join(' ')}{' '}
                        <span className="whitespace-nowrap">
                          {step.title.split(' ').at(-1)}
                          <ArrowRight
                            className="ml-2 inline size-4 align-[-0.1em] transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="sr-only">: ask about this service</span>
                      </Link>
                    ) : (
                      <span className="font-serif text-xl">{step.title}</span>
                    )}
                    <span className="leading-relaxed text-muted-foreground">{step.body}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <a
            href="https://vibesloungewil.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-fit items-center gap-2 border border-foreground/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-colors hover:border-primary hover:text-primary"
          >
            Visit vibesloungewil.com
            <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>

      {quote ? (
        <figure className="flex flex-col gap-5 border-t border-border pt-10">
          <span className="font-serif text-6xl leading-none text-primary" aria-hidden="true">
            &ldquo;
          </span>
          <blockquote className="-mt-6 max-w-3xl font-serif text-3xl leading-snug text-balance md:text-4xl">{quote}</blockquote>
          <figcaption className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-12 bg-primary" aria-hidden="true" />
            {quoteBy}
          </figcaption>
        </figure>
      ) : null}

      {beforeMenuSrc ? (
        <div className="flex flex-col gap-5 border-t border-border pt-10">
          <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-primary">The menu, before and after</h3>
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            <figure className="flex flex-col gap-2">
              <div className="relative aspect-[3/4] overflow-hidden border border-border bg-background">
                <Image
                  src={beforeMenuSrc}
                  alt="The Vibes Lounge menu before the digital menu."
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 40vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Before</figcaption>
            </figure>
            <figure className="flex flex-col gap-2">
              <div className="relative aspect-[3/4] overflow-hidden border border-border bg-background">
                <Image
                  src="/images/work/vibes-lounge-menu.png"
                  alt="The new Vibes Lounge digital menu."
                  fill
                  sizes="(min-width: 768px) 40vw, 50vw"
                  className="object-cover object-top"
                />
              </div>
              <figcaption className="text-xs uppercase tracking-[0.22em] text-primary">After</figcaption>
            </figure>
          </div>
        </div>
      ) : null}
    </section>
  )
}
