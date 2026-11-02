import { Check } from 'lucide-react'
import { discovery, outcomes } from '@/lib/plan'
import { SectionHeading } from './section-heading'

export function Priorities() {
  return (
    <section aria-labelledby="priorities" className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-14">
      <SectionHeading
        id="priorities"
        eyebrow={`What we heard · Discovery call, ${discovery.date}`}
        title="Three priorities, one goal: a business that runs smoothly without running you."
      />

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {discovery.priorities.map((p) => (
          <li key={p.title} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5">
            <h3 className="font-serif text-xl font-medium text-primary">{p.title}</h3>
            <p className="leading-relaxed text-muted-foreground">{p.body}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 rounded-lg bg-primary p-6 text-primary-foreground md:p-8">
        <h3 className="font-serif text-2xl font-medium text-balance">What success looks like, in order of importance</h3>
        <ol className="flex flex-col gap-3">
          {outcomes.map((o) => (
            <li key={o} className="flex items-start gap-3 leading-relaxed">
              <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{o}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
