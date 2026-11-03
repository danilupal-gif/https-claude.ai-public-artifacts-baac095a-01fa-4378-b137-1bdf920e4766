'use client'

import { useOptimistic, useTransition } from 'react'
import { updateItemStatus } from '@/app/portal/actions'
import { milestones, milestoneStatuses, type MilestoneStatus } from '@/lib/plan'
import { PanelHeading } from './panel-heading'

const labels: Record<MilestoneStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
}

function StatusBadge({ status, late }: { status: MilestoneStatus; late: boolean }) {
  const style =
    status === 'done'
      ? 'bg-primary text-primary-foreground'
      : status === 'in_progress'
        ? 'border border-primary text-primary'
        : 'border border-input text-muted-foreground'
  return (
    <span className={`inline-flex px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] ${style}`}>
      {late ? 'Past due' : labels[status]}
    </span>
  )
}

export function MilestonesBoard({
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

  return (
    <section aria-labelledby="milestones-title" className="flex flex-col gap-6">
      <PanelHeading
        id="milestones-title"
        eyebrow="The six weeks"
        title="Milestones"
        intro="Each one ends with something you can see and use."
      />
      <ol className="flex flex-col">
        {milestones.map((m, i) => {
          const status = optimistic[m.key] ?? 'not_started'
          const late = status !== 'done' && m.dueDate < today
          return (
            <li key={m.key} className="grid gap-5 border-t border-border py-8 md:grid-cols-[4rem_1fr]">
              <span
                className={`font-serif text-5xl italic leading-none ${status === 'done' ? 'text-primary' : 'text-primary/40'}`}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {m.week} · Due {m.due}
                    </p>
                    <h3 className="font-serif text-3xl">{m.title}</h3>
                  </div>
                  {canEdit ? (
                    <label className="flex items-center gap-2">
                      <span className="sr-only">Status for {m.title}</span>
                      <select
                        value={status}
                        onChange={(e) => change(m.key, e.target.value as MilestoneStatus)}
                        className="border border-input bg-background px-3 py-2 text-xs uppercase tracking-[0.16em] text-foreground focus:border-primary focus:outline-none"
                      >
                        {milestoneStatuses.map((s) => (
                          <option key={s} value={s}>
                            {labels[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <StatusBadge status={status} late={late} />
                  )}
                </div>
                <p className="leading-relaxed text-muted-foreground text-pretty">{m.summary}</p>
                <ul className="flex flex-col gap-2">
                  {m.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-sm leading-relaxed">
                      <span className="mt-2.5 h-px w-4 shrink-0 bg-primary" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
