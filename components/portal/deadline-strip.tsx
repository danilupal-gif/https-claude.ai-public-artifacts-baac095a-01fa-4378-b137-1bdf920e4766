'use client'

import { BellRing } from 'lucide-react'
import { planFrameWindow } from '@/components/portal/plan-frame'

type Deadline = { id: string; text: string; due: string; label: string }

export function DeadlineStrip({ overdue, dueSoon }: { overdue: Deadline[]; dueSoon: Deadline[] }) {
  if (overdue.length === 0 && dueSoon.length === 0) return null

  function showTimeline() {
    const win = planFrameWindow()
    win?.document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const items = [
    ...overdue.map((d) => ({ ...d, late: true })),
    ...dueSoon.map((d) => ({ ...d, late: false })),
  ].slice(0, 3)
  const more = overdue.length + dueSoon.length - items.length

  return (
    <aside
      aria-label="Reminders"
      className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-b border-border bg-card px-4 py-2 text-sm md:px-6"
    >
      <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
        <BellRing className="size-4" aria-hidden="true" />
        {overdue.length ? `${overdue.length} overdue` : 'Coming up'}
      </span>
      <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1">
        {items.map((d) => (
          <li key={d.id} className="flex min-w-0 items-baseline gap-2">
            <span className="truncate">{d.text}</span>
            <span className={`shrink-0 text-xs ${d.late ? 'text-destructive' : 'text-muted-foreground'}`}>
              {d.late ? `was due ${d.label}` : `due ${d.label}`}
            </span>
          </li>
        ))}
        {more > 0 ? <li className="text-xs text-muted-foreground">+{more} more</li> : null}
      </ul>
      <button
        type="button"
        onClick={showTimeline}
        className="text-xs uppercase tracking-[0.2em] text-primary underline-offset-4 hover:underline"
      >
        See checklist
      </button>
    </aside>
  )
}
