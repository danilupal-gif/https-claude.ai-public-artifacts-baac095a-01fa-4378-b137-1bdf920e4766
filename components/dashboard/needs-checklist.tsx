'use client'

import { useOptimistic, useTransition } from 'react'
import { Check } from 'lucide-react'
import { updateItemStatus } from '@/app/portal/actions'
import { needs, type NeedStatus } from '@/lib/plan'
import { PanelHeading } from './panel-heading'

export function NeedsChecklist({
  slug,
  statuses,
  today,
}: {
  slug: string
  statuses: Record<string, NeedStatus>
  today: string
}) {
  const [optimistic, setOptimistic] = useOptimistic(statuses, (state, update: { key: string; status: NeedStatus }) => ({
    ...state,
    [update.key]: update.status,
  }))
  const [, startTransition] = useTransition()

  function toggle(key: string, done: boolean) {
    const status: NeedStatus = done ? 'done' : 'open'
    startTransition(async () => {
      setOptimistic({ key, status })
      await updateItemStatus({ slug, key, status })
    })
  }

  return (
    <section aria-labelledby="needs-title" className="flex flex-col gap-6 border border-border bg-card p-6">
      <PanelHeading
        id="needs-title"
        eyebrow="Your part"
        title="What we need from you"
        intro="Tick each one off when it’s sent. Danielle sees it right away."
      />
      <ul className="flex flex-col">
        {needs.map((n) => {
          const done = optimistic[n.key] === 'done'
          const late = !done && n.dueDate < today
          return (
            <li key={n.key} className="border-t border-border">
              <label className="flex cursor-pointer items-start gap-4 py-4">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={(e) => toggle(n.key, e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${
                    done ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                  }`}
                  aria-hidden="true"
                >
                  {done ? <Check className="size-3.5" /> : null}
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`font-medium ${done ? 'text-muted-foreground line-through' : ''}`}>{n.item}</span>
                    <span
                      className={`shrink-0 text-xs uppercase tracking-[0.16em] ${late ? 'text-destructive' : 'text-muted-foreground'}`}
                    >
                      {done ? 'Sent' : late ? `Was due ${n.due}` : `By ${n.due}`}
                    </span>
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{n.detail}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
