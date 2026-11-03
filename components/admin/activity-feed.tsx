import Link from 'next/link'
import { markActivityRead } from '@/app/portal/actions'
import type { ActivityEntry } from '@/lib/plan-status'

const when = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })

export function ActivityFeed({
  entries,
  seenAt,
  clientNames,
}: {
  entries: ActivityEntry[]
  seenAt: Date | null
  clientNames: Record<string, string>
}) {
  const unread = entries.filter((e) => !seenAt || e.at > seenAt).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" role="status">
          {unread ? `${unread} new since you last checked` : 'You’re all caught up.'}
        </p>
        {unread ? (
          <form action={markActivityRead}>
            <button type="submit" className="text-xs uppercase tracking-[0.2em] text-primary underline-offset-4 hover:underline">
              Mark all as read
            </button>
          </form>
        ) : null}
      </div>
      {entries.length === 0 ? (
        <p className="border-t border-border pt-5 text-muted-foreground">
          Nothing yet. When a client ticks an item, confirms the recap or adds their numbers, it shows up here.
        </p>
      ) : (
        <ul className="flex flex-col">
          {entries.map((e) => {
            const isNew = !seenAt || e.at > seenAt
            return (
              <li key={e.key} className="grid gap-1 border-t border-border py-4 md:grid-cols-12 md:gap-6">
                <div className="flex items-center gap-3 md:col-span-3">
                  {isNew ? (
                    <span className="bg-primary px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground">
                      New
                    </span>
                  ) : null}
                  <Link href={`/portal/${e.clientSlug}?view=client`} className="text-sm hover:text-primary">
                    {e.who} <span className="text-muted-foreground">· {clientNames[e.clientSlug] ?? e.clientSlug}</span>
                  </Link>
                </div>
                <div className="flex flex-col gap-1 md:col-span-7">
                  <span className="text-sm">{e.summary}</span>
                  {e.detail ? <span className="text-sm leading-relaxed text-muted-foreground text-pretty">{e.detail}</span> : null}
                </div>
                <span className="text-xs text-muted-foreground md:col-span-2 md:text-right">{when.format(e.at)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
