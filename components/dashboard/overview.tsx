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
    return { label: `Starts in ${n} day${n === 1 ? '' : 's'}`, detail: 'Monday, November 9', progress: 0 }
  }
  if (today > plan.endDate) return { label: 'Pilot complete', detail: 'Review held December 18', progress: 100 }
  const day = daysBetween(plan.startDate, today) + 1
  return { label: `Day ${day} of ${total}`, detail: `Review ${plan.reviewDate}`, progress: Math.round((day / total) * 100) }
}

export function Overview({
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
  const openNeeds = needs.filter((n) => needStatus[n.key] !== 'done')

  const stats = [
    { label: 'Pilot', value: status.label, detail: status.detail },
    { label: 'Milestones', value: `${done} of ${milestones.length} done`, detail: next ? `Next: ${next.title}, due ${next.due}` : 'All delivered' },
    {
      label: 'Waiting on you',
      value: openNeeds.length === 0 ? 'Nothing' : `${openNeeds.length} item${openNeeds.length === 1 ? '' : 's'}`,
      detail: openNeeds[0] ? `${openNeeds[0].item}, by ${openNeeds[0].due}` : 'Thank you',
    },
  ]

  return (
    <section aria-labelledby="overview-title" className="relative overflow-hidden border border-border">
      <Image
        src="/images/herbal-reset.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="no-print object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" aria-hidden="true" />
      <div className="relative flex flex-col gap-10 p-6 md:p-10">
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
            <span className="h-px w-10 bg-primary" aria-hidden="true" />
            {plan.engagement}
          </p>
          <h1 id="overview-title" className="max-w-3xl font-serif text-4xl leading-tight text-balance md:text-6xl">
            {plan.business}
          </h1>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            Your operational plan for {plan.window}, prepared by {plan.consultant} at {plan.firm}. Everything here
            updates as we go.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div
            className="h-1 w-full bg-foreground/10"
            role="progressbar"
            aria-label="Pilot progress"
            aria-valuenow={status.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-primary" style={{ width: `${status.progress}%` }} />
          </div>
          <div className="flex justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Nov 9</span>
            <span>Dec 18 · Review</span>
          </div>
        </div>

        <dl className="grid gap-px bg-border md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 bg-card/90 p-5">
              <dt className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{s.label}</dt>
              <dd className="font-serif text-3xl">{s.value}</dd>
              <dd className="text-sm text-muted-foreground">{s.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
