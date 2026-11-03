import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { DeadlineStrip } from '@/components/portal/deadline-strip'
import { DownloadPdfButton } from '@/components/portal/download-pdf-button'
import { PlanFrame } from '@/components/portal/plan-frame'
import { SignOutButton } from '@/components/portal/sign-out-button'
import { WelcomeDialog } from '@/components/portal/welcome-dialog'
import { Wordmark } from '@/components/site/wordmark'
import { getCaseStudy } from '@/lib/case-studies'
import { getClientSettings } from '@/lib/client-settings'
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

  const [settings, study, deadlines, welcome, seen] = await Promise.all([
    getClientSettings(slug),
    isAdmin ? null : getCaseStudy(slug),
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
          {view === 'client' && settings.bookingUrl ? (
            <a
              href={settings.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-primary px-3 py-2 text-xs uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <CalendarClock className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Book a check-in</span>
              <span className="sr-only sm:hidden">Book a check-in</span>
            </a>
          ) : null}
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
      {study?.status === 'awaiting' && !isAdmin ? (
        <Link
          href={`/portal/${slug}/case-study`}
          className="flex shrink-0 items-center justify-between gap-4 border-b border-primary/40 bg-surface px-4 py-3 text-sm transition-colors hover:bg-card md:px-6"
        >
          <span className="text-pretty">{welcome?.data.from ?? 'Danielle'} would like to share the story of your pilot. Nothing goes public without your yes.</span>
          <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-primary">Review it</span>
        </Link>
      ) : null}
      {deadlines ? (
        <DeadlineStrip overdue={deadlines.overdue.map(toDeadline)} dueSoon={deadlines.dueSoon.map(toDeadline)} />
      ) : null}
      <PlanFrame key={view} src={`/portal/${slug}/plan?view=${view}`} title={title} />
      {showWelcome ? <WelcomeDialog slug={slug} note={welcome!.data.text!} from={welcome!.data.from ?? 'Danielle'} /> : null}
    </div>
  )
}
