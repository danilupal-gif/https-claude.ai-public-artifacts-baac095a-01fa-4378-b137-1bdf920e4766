import type { Metadata } from 'next'
import { asc, eq } from 'drizzle-orm'
import { MessagesPanel } from '@/components/dashboard/messages-panel'
import { PlanHeader } from '@/components/dashboard/plan-header'
import { PlanHero } from '@/components/dashboard/plan-hero'
import { PlanJourney } from '@/components/dashboard/plan-journey'
import { PlanMeasures } from '@/components/dashboard/plan-measures'
import { PlanNeeds } from '@/components/dashboard/plan-needs'
import { PlanPriorities } from '@/components/dashboard/plan-priorities'
import { PlanReview } from '@/components/dashboard/plan-review'
import { PlanTimeline } from '@/components/dashboard/plan-timeline'
import { db } from '@/lib/db'
import { clientItemStatus, clientMessages } from '@/lib/db/schema'
import { clients, requireClientViewer, isClientSlug } from '@/lib/portal'
import { milestones, needs, plan, type MilestoneStatus, type NeedStatus } from '@/lib/plan'

export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params
  return { title: isClientSlug(client) ? `${clients[client].name} · Operational Plan` : 'Client Portal' }
}

export default async function ClientDashboard({ params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const viewer = await requireClientViewer(slug)

  const [statusRows, messages] = await Promise.all([
    db.select().from(clientItemStatus).where(eq(clientItemStatus.clientSlug, slug)),
    db
      .select({
        id: clientMessages.id,
        authorName: clientMessages.authorName,
        authorRole: clientMessages.authorRole,
        body: clientMessages.body,
        createdAt: clientMessages.createdAt,
      })
      .from(clientMessages)
      .where(eq(clientMessages.clientSlug, slug))
      .orderBy(asc(clientMessages.createdAt))
      .limit(200),
  ])

  const statusByKey = new Map(statusRows.map((r) => [r.itemKey, r]))
  const milestoneStatus = Object.fromEntries(
    milestones.map((m) => [m.key, (statusByKey.get(m.key)?.status ?? 'not_started') as MilestoneStatus]),
  )
  const needStatus = Object.fromEntries(
    needs.map((n) => [n.key, (statusByKey.get(n.key)?.status ?? 'open') as NeedStatus]),
  )
  const today = new Date().toISOString().slice(0, 10)
  const isAdmin = viewer.role === 'admin'

  return (
    <div className="plan-theme min-h-svh bg-background font-sans text-foreground">
      <PlanHeader viewerName={viewer.name} isAdmin={isAdmin} />
      <main>
        <PlanHero today={today} milestoneStatus={milestoneStatus} needStatus={needStatus} />
        <PlanPriorities />
        <PlanTimeline slug={slug} statuses={milestoneStatus} canEdit={isAdmin} today={today} />
        <PlanJourney />
        <PlanMeasures />
        <PlanNeeds slug={slug} statuses={needStatus} today={today} />
        <PlanReview>
          <MessagesPanel
            slug={slug}
            viewerRole={viewer.role}
            messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
          />
        </PlanReview>
      </main>
      <footer className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-8 text-sm text-muted-foreground md:flex-row md:justify-between">
        <span>
          Prepared by {plan.firm} for {plan.business}
        </span>
        <span>{plan.preparedOn} · Confidential</span>
      </footer>
    </div>
  )
}
