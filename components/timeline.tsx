import { milestones } from '@/lib/plan'
import { SectionHeading } from './section-heading'

const weeks = [
  { label: 'Wk 1', dates: 'Nov 9' },
  { label: 'Wk 2', dates: 'Nov 16' },
  { label: 'Wk 3', dates: 'Nov 23' },
  { label: 'Wk 4', dates: 'Nov 30' },
  { label: 'Wk 5', dates: 'Dec 7' },
  { label: 'Wk 6', dates: 'Dec 14' },
]

const milestoneWeeks = [0, 2, 4, 5]

export function Timeline() {
  return (
    <section aria-labelledby="timeline" className="border-y border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-14">
        <SectionHeading
          id="timeline"
          eyebrow="The six weeks"
          title="Four milestones, each one a working piece of your business."
          intro="Each milestone ends with something you can see and use. We’ll check in weekly so nothing drifts."
        />

        <div className="hidden md:block" aria-hidden="true">
          <div className="grid grid-cols-6">
            {weeks.map((w, i) => {
              const isMilestone = milestoneWeeks.includes(i)
              return (
                <div key={w.label} className="flex flex-col gap-3">
                  <div className="flex items-center">
                    <span
                      className={`size-4 shrink-0 rounded-full border-2 ${
                        isMilestone ? 'border-primary bg-accent' : 'border-border bg-card'
                      }`}
                    />
                    {i < weeks.length - 1 ? <span className="h-0.5 flex-1 bg-primary/30" /> : null}
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{w.label}</span>
                    <span className="text-muted-foreground">{w.dates}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <ol className="relative flex flex-col gap-6 md:grid md:grid-cols-2">
          {milestones.map((m, i) => (
            <li key={m.title} className="flex gap-4 rounded-lg border border-border bg-background p-5">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-lg text-primary-foreground"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">
                    {m.week} · <span className="font-semibold text-foreground">Due {m.due}</span>
                  </p>
                  <h3 className="font-serif text-xl font-medium text-primary">{m.title}</h3>
                  <p className="leading-relaxed text-pretty">{m.summary}</p>
                </div>
                <ul className="flex flex-col gap-2 border-t border-border pt-3">
                  {m.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
