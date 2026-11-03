import { costColumns, discovery, journey, measures, outcomes, plan, principles, programs } from '@/lib/plan'
import { PanelHeading } from './panel-heading'

export function PlanDetails() {
  return (
    <div className="flex flex-col gap-16">
      <section aria-labelledby="priorities-title" className="grid gap-10 border-t border-border pt-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <PanelHeading
            id="priorities-title"
            eyebrow={`From our call · ${discovery.date}`}
            title="What you told us matters"
          />
        </div>
        <div className="flex flex-col gap-10 lg:col-span-8">
          <ul className="grid gap-px bg-border md:grid-cols-3">
            {discovery.priorities.map((p) => (
              <li key={p.title} className="flex flex-col gap-2 bg-background p-6">
                <h3 className="font-serif text-2xl text-primary">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              By December 18, in priority order
            </h3>
            <ol className="flex flex-col">
              {outcomes.map((o, i) => (
                <li key={o} className="flex gap-5 border-t border-border py-4">
                  <span className="w-6 shrink-0 font-serif text-xl italic text-primary">{i + 1}</span>
                  <span className="leading-relaxed">{o}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="journey-title" className="flex flex-col gap-8 border-t border-border pt-12">
        <PanelHeading
          id="journey-title"
          eyebrow="Your customer journey"
          title="Every person, at every stage"
          intro="These are the stages we’ll track, so you always know who needs what."
        />
        <ol className="flex flex-wrap gap-2">
          {journey.map((stage, i) => (
            <li key={stage} className="flex items-center gap-2">
              <span className="border border-input bg-card px-4 py-2 text-sm">{stage}</span>
              {i < journey.length - 1 ? (
                <span className="h-px w-4 bg-primary/60" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="measures-title" className="grid gap-10 border-t border-border pt-12 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <PanelHeading
            id="measures-title"
            eyebrow="Week 1 baseline"
            title="Where we start from"
            intro="Recorded before anything changes, so the December review compares real numbers."
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <th scope="col" className="py-3 pr-4 font-medium">Measure</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Baseline</th>
                </tr>
              </thead>
              <tbody>
                {measures.map((m) => (
                  <tr key={m.measure} className="border-b border-border align-top">
                    <td className="py-4 pr-4">
                      <span className="block">{m.measure}</span>
                      <span className="text-xs text-muted-foreground">{m.source}</span>
                    </td>
                    <td className="py-4 pr-4 font-serif text-lg text-primary">{m.known ?? 'Week 1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <PanelHeading
            id="programs-title"
            eyebrow="Monetization"
            title="What each program earns"
            intro="We’ll fill in delivery costs together in week 1."
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm" aria-labelledby="programs-title">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <th scope="col" className="py-3 pr-4 font-medium">Program</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Price</th>
                  {costColumns.map((c) => (
                    <th key={c} scope="col" className="py-3 pr-4 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.name} className="border-b border-border align-top">
                    <td className="py-4 pr-4">
                      <span className="block">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.note}</span>
                    </td>
                    <td className="py-4 pr-4 font-serif text-lg text-primary">{p.price}</td>
                    {costColumns.map((c) => (
                      <td key={c} className="py-4 pr-4 text-muted-foreground">
                        {'—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="flex flex-col gap-8 border-t border-border pt-12">
        <PanelHeading id="principles-title" eyebrow="How we work together" title="Our agreements" />
        <ul className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <li key={p.title} className="flex flex-col gap-2 bg-background p-6">
              <h3 className="font-serif text-2xl">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
        <p className="font-serif text-xl italic text-muted-foreground">
          Prepared by {plan.consultant}, {plan.firm} · {plan.preparedOn} · Confidential
        </p>
      </section>
    </div>
  )
}
