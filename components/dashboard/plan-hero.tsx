import Image from 'next/image'
import { milestones, needs, plan, type MilestoneStatus, type NeedStatus } from '@/lib/plan'

const DAY = 24 * 60 * 60 * 1000

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY)
}

function pilotStatus(today: string) {
  const total = daysBetween(plan.startDate, plan.endDate) + 1
  if (today < plan.startDate) {
    const n = daysBetween(today, plan.startDate)
    return { label: `Starts in ${n} day${n === 1 ? '' : 's'}`, progress: 0 }
  }
  if (today > plan.endDate) return { label: 'Pilot complete', progress: 100 }
  const day = daysBetween(plan.startDate, today) + 1
  return { label: `Day ${day} of ${total}`, progress: Math.round((day / total) * 100) }
}

const facts = [
  { label: 'Pilot window', value: plan.window },
  { label: 'Scope', value: 'Customer Operations Setup' },
  { label: 'Pilot review', value: plan.reviewDate },
]

export function PlanHero({
  today,
  milestoneStatus,
  needStatus,
}: {
  today: string
  milestoneStatus: Record<string, MilestoneStatus>
  needStatus: Record<string, NeedStatus>
}) {
  const status = pilotStatus(today)
  const done = milestones.filter((m) => milestoneStatus[m.key] === 'done').length
  const next = milestones.find((m) => milestoneStatus[m.key] !== 'done')
  const openNeeds = needs.filter((n) => needStatus[n.key] !== 'done').length

  return (
    <section aria-labelledby="plan-title" className="mx-auto flex max-w-5xl flex-col gap-8 px-5 pt-10 pb-12 md:pt-16">
      <div className="flex flex-col gap-5">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          {status.label}
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

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium">
            {done} of {milestones.length} milestones done
            {next ? <span className="text-muted-foreground"> · Next: {next.title}, due {next.due}</span> : null}
          </span>
          <a href="#needs" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {openNeeds === 0 ? 'Nothing waiting on you' : `${openNeeds} item${openNeeds === 1 ? '' : 's'} waiting on you`}
          </a>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Pilot progress"
          aria-valuenow={status.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${status.progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Nov 9 · Start</span>
          <span>Dec 18 · Review</span>
        </div>
      </div>
    </section>
  )
}
