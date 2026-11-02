import Image from 'next/image'
import { plan } from '@/lib/plan'

const facts = [
  { label: 'Pilot window', value: plan.window },
  { label: 'Scope', value: 'Customer Operations Setup' },
  { label: 'Pilot review', value: plan.reviewDate },
]

export function Hero() {
  return (
    <section aria-labelledby="plan-title" className="mx-auto flex max-w-5xl flex-col gap-8 px-5 pt-10 pb-12 md:pt-16">
      <div className="flex flex-col gap-5">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-foreground">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          Draft for your review
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Prepared for {plan.client} · {plan.business}
          </p>
          <h1 id="plan-title" className="font-serif text-4xl font-medium leading-tight text-balance text-primary md:text-6xl">
            The Deep Reset Operational Plan
          </h1>
        </div>
        <p className="max-w-2xl text-lg leading-relaxed text-pretty">
          Six weeks to make sure every interested person hears back, every payment becomes a smooth start, and you
          know what each program earns, all before the January rush.
        </p>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden rounded-lg md:aspect-[21/9]">
        <Image
          src="/images/herbal-reset.png"
          alt="Bowls of dried chamomile, nettle, mint and lemongrass beside a glass of herbal tea"
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
        />
      </div>

      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-1 bg-card p-4">
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">{fact.label}</dt>
            <dd className="font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
