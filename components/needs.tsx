import { needs, principles } from '@/lib/plan'
import { SectionHeading } from './section-heading'

export function Needs() {
  return (
    <section aria-labelledby="needs" className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-14">
      <div className="flex flex-col gap-8">
        <SectionHeading
          id="needs"
          eyebrow="What I need from you"
          title="Five things that keep the pilot on schedule."
          intro="Access comes first. Everything else can be done together on a short call."
        />
        <ol className="flex flex-col gap-3">
          {needs.map((n) => (
            <li
              key={n.item}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 md:items-center"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{n.item}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{n.detail}</span>
              </div>
              <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                By {n.due}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="font-serif text-2xl font-medium text-primary">How we’ll work together</h3>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          {principles.map((p) => (
            <li key={p.title} className="flex flex-col gap-1 border-t-2 border-accent pt-4">
              <span className="font-medium">{p.title}</span>
              <span className="leading-relaxed text-muted-foreground">{p.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
