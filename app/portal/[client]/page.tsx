import type { Metadata } from 'next'
import { asc, eq } from 'drizzle-orm'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { MessagesPanel } from '@/components/dashboard/messages-panel'
import { MilestonesBoard } from '@/components/dashboard/milestones-board'
import { NeedsChecklist } from '@/components/dashboard/needs-checklist'
import { Overview } from '@/components/dashboard/overview'
import { PlanDetails } from '@/components/dashboard/plan-details'
import { db } from '@/lib/db'
import { clientItemStatus, clientMessages } from '@/lib/db/schema'
import { clients, requireClientViewer, isClientSlug } from '@/lib/portal'
import { milestones, needs, type MilestoneStatus, type NeedStatus } from '@/lib/plan'

export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params
  return { title: isClientSlug(client) ? clients[client].name : 'Client Portal' }
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
    <div className="min-h-svh">
      <DashboardHeader viewerName={viewer.name} isAdmin={isAdmin} />
      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-5 pb-24 pt-10 md:px-8">
        <Overview today={today} milestoneStatus={milestoneStatus} needStatus={needStatus} />
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-10 lg:col-span-8">
            <MilestonesBoard slug={slug} statuses={milestoneStatus} canEdit={isAdmin} today={today} />
          </div>
          <div className="flex flex-col gap-10 lg:col-span-4">
            <NeedsChecklist slug={slug} statuses={needStatus} today={today} />
            <MessagesPanel
              slug={slug}
              viewerRole={viewer.role}
              messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
            />
          </div>
        </div>
        <PlanDetails />
      </main>
    </div>
  )
}
