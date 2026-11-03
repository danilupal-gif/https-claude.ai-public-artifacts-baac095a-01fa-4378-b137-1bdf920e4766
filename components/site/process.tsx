import { principles, process } from '@/lib/site'
import { SectionHeading } from './section-heading'

export function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="border-t border-border py-24 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-5 md:px-8">
        <SectionHeading id="process-title" eyebrow="The ÉLEVÉ experience" title="How we work together." />
        <ol className="grid gap-12 md:grid-cols-4 md:gap-8">
          {process.map((p, i) => (
            <li key={p.step} className="flex flex-col gap-4 border-t border-primary/50 pt-6">
              <span className="font-serif text-6xl italic leading-none text-primary/80" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em]">{p.step}</h3>
              <p className="leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-px bg-border md:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title} className="flex flex-col gap-2 bg-background p-8">
              <h3 className="font-serif text-2xl">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
