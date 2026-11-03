import type { Metadata } from 'next'
import Link from 'next/link'
import { DeadlineStrip } from '@/components/portal/deadline-strip'
import { DownloadPdfButton } from '@/components/portal/download-pdf-button'
import { PlanFrame } from '@/components/portal/plan-frame'
import { SignOutButton } from '@/components/portal/sign-out-button'
import { WelcomeDialog } from '@/components/portal/welcome-dialog'
import { Wordmark } from '@/components/site/wordmark'
import { getClient, readMeta } from '@/lib/clients'
import { formatDue } from '@/lib/plan-items'
import { getClientDeadlines } from '@/lib/plan-status'
import { requireClientViewer } from '@/lib/portal'

export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params
  return { title: (await getClient(client))?.name ?? 'Client Portal' }
}

export default async function ClientPlan({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const { client: slug } = await params
  const { viewer, client } = await requireClientViewer(slug)
  const isAdmin = viewer.role === 'admin'
  const view = isAdmin && (await searchParams).view !== 'client' ? 'internal' : 'client'
  const title = view === 'internal' ? `${client.name} · Internal playbook` : `${client.name} · Operational plan`

  const [deadlines, welcome, seen] = await Promise.all([
    view === 'client' ? getClientDeadlines(slug) : null,
    isAdmin ? null : readMeta<{ text?: string; from?: string }>(slug, 'welcome', 'note'),
    isAdmin ? null : readMeta<{ at: string }>(slug, 'welcome-seen', viewer.userId),
  ])
  const showWelcome = Boolean(welcome?.data.text) && (!seen || seen.updatedAt < welcome!.updatedAt)
  const toDeadline = (i: { id: string; text: string; due: string | null }) => ({
    id: i.id,
    text: i.text,
    due: i.due!,
    label: formatDue(i.due!),
  })

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-4 md:px-6">
        <Link href="/" aria-label="ÉLEVÉ Business Partners website" className="shrink-0">
          <Wordmark subtitle="Client Portal" />
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          {isAdmin ? (
            <nav aria-label="Plan view" className="flex items-center border border-border text-xs uppercase tracking-[0.16em]">
              <Link
                href={`/portal/${slug}`}
                aria-current={view === 'internal' ? 'page' : undefined}
                className={`px-3 py-2 transition-colors ${view === 'internal' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                My playbook
              </Link>
              <Link
                href={`/portal/${slug}?view=client`}
                aria-current={view === 'client' ? 'page' : undefined}
                className={`px-3 py-2 transition-colors ${view === 'client' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {client.contact}&apos;s view
              </Link>
            </nav>
          ) : (
            <span className="hidden text-sm text-muted-foreground md:inline">Signed in as {viewer.name}</span>
          )}
          <DownloadPdfButton />
          {isAdmin ? (
            <Link
              href="/portal/admin"
              className="hidden text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-foreground sm:inline"
            >
              Admin
            </Link>
          ) : null}
          <SignOutButton compact />
        </div>
      </header>
      {deadlines ? (
        <DeadlineStrip overdue={deadlines.overdue.map(toDeadline)} dueSoon={deadlines.dueSoon.map(toDeadline)} />
      ) : null}
      <PlanFrame key={view} src={`/portal/${slug}/plan?view=${view}`} title={title} />
      {showWelcome ? <WelcomeDialog slug={slug} note={welcome!.data.text!} from={welcome!.data.from ?? 'Danielle'} /> : null}
    </div>
  )
}
