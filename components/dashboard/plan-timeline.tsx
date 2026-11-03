'use client'

import { useOptimistic, useTransition } from 'react'
import { Check } from 'lucide-react'
import { updateItemStatus } from '@/app/portal/actions'
import { milestones, milestoneStatuses, type MilestoneStatus } from '@/lib/plan'
import { SectionHeading } from './section-heading'

const weeks = [
  { label: 'Wk 1', start: '2026-11-09', dates: 'Nov 9' },
  { label: 'Wk 2', start: '2026-11-16', dates: 'Nov 16' },
  { label: 'Wk 3', start: '2026-11-23', dates: 'Nov 23' },
  { label: 'Wk 4', start: '2026-11-30', dates: 'Nov 30' },
  { label: 'Wk 5', start: '2026-12-07', dates: 'Dec 7' },
  { label: 'Wk 6', start: '2026-12-14', dates: 'Dec 14' },
]

const milestoneWeeks = [0, 2, 4, 5]

const labels: Record<MilestoneStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
}

function badgeStyle(status: MilestoneStatus, late: boolean) {
  if (late) return 'bg-destructive/10 text-destructive'
  if (status === 'done') return 'bg-primary text-primary-foreground'
  if (status === 'in_progress') return 'bg-accent/25 text-foreground'
  return 'bg-muted text-muted-foreground'
}

export function PlanTimeline({
  slug,
  statuses,
  canEdit,
  today,
}: {
  slug: string
  statuses: Record<string, MilestoneStatus>
  canEdit: boolean
  today: string
}) {
  const [optimistic, setOptimistic] = useOptimistic(statuses, (state, update: { key: string; status: MilestoneStatus }) => ({
    ...state,
    [update.key]: update.status,
  }))
  const [, startTransition] = useTransition()

  function change(key: string, status: MilestoneStatus) {
    startTransition(async () => {
      setOptimistic({ key, status })
      await updateItemStatus({ slug, key, status })
    })
  }

  const currentWeek = weeks.findLastIndex((w) => w.start <= today && today <= '2026-12-18')

  return (
    <section aria-labelledby="timeline" className="border-y border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-14">
        <SectionHeading
          id="timeline"
          eyebrow="The six weeks"
          title="Four milestones, each one a working piece of your business."
          intro="Each milestone ends with something you can see and use. We’ll check in weekly so nothing drifts, and the status here updates as we go."
        />

        <div className="hidden md:block" aria-hidden="true">
          <div className="grid grid-cols-6">
            {weeks.map((w, i) => {
              const mIndex = milestoneWeeks.indexOf(i)
              const mStatus = mIndex >= 0 ? (optimistic[milestones[mIndex].key] ?? 'not_started') : null
              const dot =
                mStatus === 'done'
                  ? 'border-primary bg-primary'
                  : mStatus === 'in_progress'
                    ? 'border-primary bg-accent'
                    : mStatus
                      ? 'border-primary bg-card'
                      : 'border-border bg-card'
              return (
                <div key={w.label} className="flex flex-col gap-3">
                  <div className="flex items-center">
                    <span className={`size-4 shrink-0 rounded-full border-2 ${dot}`} />
                    {i < weeks.length - 1 ? <span className="h-0.5 flex-1 bg-primary/30" /> : null}
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className={i === currentWeek ? 'font-semibold text-primary' : 'font-medium'}>
                      {w.label}
                      {i === currentWeek ? ' · This week' : ''}
                    </span>
                    <span className="text-muted-foreground">{w.dates}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <ol className="flex flex-col gap-6 md:grid md:grid-cols-2">
          {milestones.map((m, i) => {
            const status = optimistic[m.key] ?? 'not_started'
            const late = status !== 'done' && m.dueDate < today
            return (
              <li key={m.key} className="flex gap-4 rounded-lg border border-border bg-background p-5">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full font-serif text-lg ${
                    status === 'done' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
                  }`}
                  aria-hidden="true"
                >
                  {status === 'done' ? <Check className="size-5" /> : i + 1}
                </span>
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground">
                        {m.week} · <span className="font-semibold text-foreground">Due {m.due}</span>
                      </p>
                      {canEdit ? (
                        <label>
                          <span className="sr-only">Status for {m.title}</span>
                          <select
                            value={status}
                            onChange={(e) => change(m.key, e.target.value as MilestoneStatus)}
                            className="rounded-full border border-input bg-card px-3 py-1 text-xs font-medium focus:border-primary focus:outline-none"
                          >
                            {milestoneStatuses.map((s) => (
                              <option key={s} value={s}>
                                {labels[s]}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeStyle(status, late)}`}>
                          {late ? 'Past due' : labels[status]}
                        </span>
                      )}
                    </div>
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
            )
          })}
        </ol>
      </div>
    </section>
  )
}
