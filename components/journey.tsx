import { ArrowRight } from 'lucide-react'
import { journey } from '@/lib/plan'
import { SectionHeading } from './section-heading'

export function Journey() {
  return (
    <section aria-labelledby="journey" className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-14">
      <SectionHeading
        id="journey"
        eyebrow="Your customer journey"
        title="One view of every person, from first hello to finished reset."
        intro="Everyone who finds you will sit in one of these stages. That makes it easy to see who needs a reply, who has paid but not started, and who has gone quiet."
      />
      <ol className="flex flex-wrap items-center gap-2">
        {journey.map((stage, i) => (
          <li key={stage} className="flex items-center gap-2">
            <span
              className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${
                stage === 'Paid'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : stage === 'Paused'
                    ? 'border-dashed border-border bg-muted text-muted-foreground'
                    : 'border-border bg-card'
              }`}
            >
              {stage}
            </span>
            {i < journey.length - 1 ? (
              <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Paid is the turning point: from there, the waiver, intake and shipping begin automatically.
      </p>
    </section>
  )
}
