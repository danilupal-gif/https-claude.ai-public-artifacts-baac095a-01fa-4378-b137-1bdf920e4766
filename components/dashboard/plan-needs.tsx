'use client'

import { useOptimistic, useTransition } from 'react'
import { Check } from 'lucide-react'
import { updateItemStatus } from '@/app/portal/actions'
import { needs, principles, type NeedStatus } from '@/lib/plan'
import { SectionHeading } from './section-heading'

export function PlanNeeds({
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
    <section aria-labelledby="needs" className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-14">
      <div className="flex flex-col gap-8">
        <SectionHeading
          id="needs"
          eyebrow="What I need from you"
          title="Five things that keep the pilot on schedule."
          intro="Access comes first. Everything else can be done together on a short call. Tick each one off when it’s sent, and I’ll see it right away."
        />
        <ol className="flex flex-col gap-3">
          {needs.map((n) => {
            const done = optimistic[n.key] === 'done'
            const late = !done && n.dueDate < today
            return (
              <li key={n.key}>
                <label
                  className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors md:items-center ${
                    done ? 'border-border bg-muted/50' : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) => toggle(n.key, e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 md:mt-0 ${
                      done ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card'
                    }`}
                    aria-hidden="true"
                  >
                    {done ? <Check className="size-4" /> : null}
                  </span>
                  <span className="flex flex-1 flex-col gap-1">
                    <span className={`font-medium ${done ? 'text-muted-foreground line-through' : ''}`}>{n.item}</span>
                    <span className="text-sm leading-relaxed text-muted-foreground">{n.detail}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                      done
                        ? 'bg-accent/25 text-foreground'
                        : late
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {done ? 'Sent' : late ? `Was due ${n.due}` : `By ${n.due}`}
                  </span>
                </label>
              </li>
            )
          })}
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
