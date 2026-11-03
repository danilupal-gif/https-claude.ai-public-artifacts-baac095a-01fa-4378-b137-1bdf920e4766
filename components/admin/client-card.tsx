import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ClientSettingsForm } from '@/components/admin/client-settings-form'
import { UpdatePagesForm } from '@/components/admin/update-pages-form'
import { WeeklyPreviewButton } from '@/components/admin/weekly-preview-button'
import type { ClientSettings } from '@/lib/client-settings'
import { WelcomeNoteForm } from '@/components/admin/welcome-note-form'
import type { Client } from '@/lib/clients'
import { formatDue } from '@/lib/plan-items'
import type { ClientPlanStatus } from '@/lib/plan-status'

const when = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })

function Meter({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <span className="text-sm">
          <span className="font-serif text-2xl text-foreground">{pct}%</span>
          <span className="text-muted-foreground"> · {done} of {total}</span>
        </span>
      </div>
      <div className="h-1 bg-surface" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function ClientCard({
  client,
  status,
  toReview,
  welcomeNote,
  settings,
}: {
  client: Client
  status: ClientPlanStatus
  toReview: number
  welcomeNote: string
  settings: ClientSettings
}) {
  return (
    <article className="flex flex-col border border-border bg-card">
      <Link
        href={`/portal/${client.slug}`}
        className="group flex items-start justify-between gap-4 p-6 transition-colors hover:bg-surface"
      >
        <span className="flex flex-col gap-1">
          <span className="font-serif text-3xl leading-tight">{client.name}</span>
          <span className="text-sm text-muted-foreground">Contact: {client.contact}</span>
        </span>
        <ArrowRight className="mt-2 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>

      <div className="flex flex-col gap-5 border-t border-border p-6">
        {status.hasPlan ? (
          <>
            <Meter label={`${client.contact}'s milestones`} done={status.client.done} total={status.client.total} />
            <Meter label="Your playbook" done={status.internal.done} total={status.internal.total} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No plan pages uploaded yet.</p>
        )}

        {toReview > 0 ? (
          <Link
            href={`/portal/${client.slug}`}
            className="flex items-center justify-between gap-3 border border-primary/50 px-4 py-3 text-sm transition-colors hover:bg-surface"
          >
            <span>
              {client.contact} sent you {toReview === 1 ? 'something' : `${toReview} things`} to review
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-primary">Open inbox</span>
          </Link>
        ) : null}

        {status.overdue.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-destructive">{status.overdue.length} overdue for {client.contact}</p>
            <ul className="flex flex-col gap-1 text-sm">
              {status.overdue.slice(0, 3).map((i) => (
                <li key={i.id} className="flex items-baseline justify-between gap-3">
                  <span className="truncate">{i.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDue(i.due!)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : status.hasPlan ? (
          <p className="text-sm text-muted-foreground">Nothing overdue for {client.contact}.</p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {status.lastChange ? `Last change: ${status.lastChange.by}, ${when.format(status.lastChange.at)}` : 'No changes yet.'}
        </p>
      </div>

      <details className="group border-t border-border">
        <summary className="cursor-pointer list-none px-6 py-4 text-xs uppercase tracking-[0.2em] text-primary hover:text-foreground">
          Welcome note {welcomeNote ? '· set' : '· none'}
        </summary>
        <div className="px-6 pb-6">
          <WelcomeNoteForm slug={client.slug} contact={client.contact} note={welcomeNote} />
        </div>
      </details>
      <details className="border-t border-border">
        <summary className="cursor-pointer list-none px-6 py-4 text-xs uppercase tracking-[0.2em] text-primary hover:text-foreground">
          Check-ins &amp; weekly email · {settings.bookingUrl ? 'link set' : 'no link'} · {settings.weeklyEmail ? 'email on' : 'email off'}
        </summary>
        <div className="flex flex-col gap-4 px-6 pb-6">
          <ClientSettingsForm
            slug={client.slug}
            contact={client.contact}
            bookingUrl={settings.bookingUrl}
            weeklyEmail={settings.weeklyEmail}
          />
          <WeeklyPreviewButton slug={client.slug} />
        </div>
      </details>
      <details className="border-t border-border">
        <summary className="cursor-pointer list-none px-6 py-4 text-xs uppercase tracking-[0.2em] text-primary hover:text-foreground">
          Update plan pages
        </summary>
        <div className="px-6 pb-6">
          <UpdatePagesForm slug={client.slug} />
        </div>
      </details>
    </article>
  )
}
