import { costColumns, measures, programs } from '@/lib/plan'
import { SectionHeading } from './section-heading'

export function PlanMeasures() {
  return (
    <section aria-labelledby="measures" className="border-y border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-14">
        <SectionHeading
          id="measures"
          eyebrow="How we’ll know it worked"
          title="We measure where you are in week 1, then compare."
          intro="These numbers are recorded before anything changes, so the pilot review on December 18 shows real results, not impressions."
        />

        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-xl font-medium text-primary">Baseline measures</h3>
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-background">
            {measures.map((m) => (
              <li key={m.measure} className="flex flex-col gap-1 p-4 md:flex-row md:items-center md:justify-between md:gap-6">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{m.measure}</span>
                  <span className="text-sm text-muted-foreground">{m.source}</span>
                </div>
                <span
                  className={`w-fit shrink-0 rounded-full px-3 py-1 text-sm ${
                    m.known ? 'bg-accent/25 font-medium' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {m.known ?? 'Recorded week 1'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-serif text-xl font-medium text-primary">What each program earns</h3>
            <p className="leading-relaxed text-muted-foreground">
              Revenue isn’t profit. Together we’ll fill in what each program costs to deliver, including your time.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {programs.map((p) => (
              <li key={p.name} className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex flex-col">
                    <h4 className="font-medium">{p.name}</h4>
                    <p className="text-sm text-muted-foreground">{p.note}</p>
                  </div>
                  <span className="shrink-0 font-serif text-2xl text-primary">{p.price}</span>
                </div>
                <dl className="grid grid-cols-2 gap-2 border-t border-border pt-4 text-sm">
                  {costColumns.map((c) => {
                    const known = 'known' in p ? p.known?.[c] : undefined
                    return (
                      <div key={c} className="flex flex-col">
                        <dt className="text-muted-foreground">{c}</dt>
                        <dd className={known ? 'font-medium' : 'text-muted-foreground/70'}>{known ?? 'To fill in'}</dd>
                      </div>
                    )
                  })}
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
