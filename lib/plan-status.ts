import 'server-only'

import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientDocuments, clientStore, portalAccess, user } from '@/lib/db/schema'
import { addDays, readPlanItems, todayISO, type PlanItem } from '@/lib/plan-items'

export type ChecklistStatus = { done: number; total: number }

export type ClientPlanStatus = {
  hasPlan: boolean
  client: ChecklistStatus
  internal: ChecklistStatus
  overdue: PlanItem[]
  dueSoon: PlanItem[]
  lastChange: { by: string; at: Date } | null
}

async function documentItems(slug: string) {
  const docs = await db
    .select({ kind: clientDocuments.kind, html: clientDocuments.html })
    .from(clientDocuments)
    .where(eq(clientDocuments.clientSlug, slug))
  const byKind = new Map(docs.map((d) => [d.kind, readPlanItems(d.html)]))
  return { client: byKind.get('client') ?? null, internal: byKind.get('internal') ?? [] }
}

async function doneIds(slug: string, space: 'client' | 'internal') {
  const rows = await db
    .select({ id: clientStore.docId, data: clientStore.data })
    .from(clientStore)
    .where(and(eq(clientStore.clientSlug, slug), eq(clientStore.space, space), eq(clientStore.collection, 'progress')))
  return new Set(rows.filter((r) => (r.data as { done?: boolean }).done).map((r) => r.id))
}

/** Items the client owns (or shares) that are overdue or due within `soonDays`. */
export function clientDeadlines(items: PlanItem[], done: Set<string>, soonDays = 2) {
  const today = todayISO()
  const soon = addDays(today, soonDays)
  const open = items.filter((i) => i.owner !== 'd' && i.due && !done.has(i.id))
  return {
    overdue: open.filter((i) => i.due! < today).sort((a, b) => a.due!.localeCompare(b.due!)),
    dueSoon: open.filter((i) => i.due! >= today && i.due! <= soon).sort((a, b) => a.due!.localeCompare(b.due!)),
  }
}

export async function getClientDeadlines(slug: string) {
  const [{ client }, done] = await Promise.all([documentItems(slug), doneIds(slug, 'client')])
  return clientDeadlines(client ?? [], done)
}

export async function getPlanStatus(slug: string): Promise<ClientPlanStatus> {
  const [items, clientDone, internalDone, [last]] = await Promise.all([
    documentItems(slug),
    doneIds(slug, 'client'),
    doneIds(slug, 'internal'),
    db
      .select({ by: user.name, email: clientStore.updatedBy, at: clientStore.updatedAt })
      .from(clientStore)
      .leftJoin(user, sql`lower(${user.email}) = lower(${clientStore.updatedBy})`)
      .where(and(eq(clientStore.clientSlug, slug), inArray(clientStore.space, ['client', 'internal'])))
      .orderBy(desc(clientStore.updatedAt))
      .limit(1),
  ])

  const clientItems = items.client ?? []
  const count = (list: PlanItem[], done: Set<string>) => ({
    done: list.filter((i) => done.has(i.id)).length,
    total: list.length,
  })

  return {
    hasPlan: items.client !== null,
    client: count(clientItems, clientDone),
    internal: count(items.internal, internalDone),
    ...clientDeadlines(clientItems, clientDone),
    lastChange: last ? { by: firstName(last.by ?? last.email), at: last.at } : null,
  }
}

export type ActivityEntry = {
  key: string
  clientSlug: string
  who: string
  summary: string
  detail?: string
  at: Date
}

/** Latest changes made by clients in their plan pages, newest first. */
export async function getClientActivity(limit = 25): Promise<ActivityEntry[]> {
  const admins = db.select({ email: sql<string>`lower(${portalAccess.email})` }).from(portalAccess).where(eq(portalAccess.role, 'admin'))
  const rows = await db
    .select({
      clientSlug: clientStore.clientSlug,
      collection: clientStore.collection,
      docId: clientStore.docId,
      data: clientStore.data,
      at: clientStore.updatedAt,
      by: user.name,
      email: clientStore.updatedBy,
    })
    .from(clientStore)
    .leftJoin(user, sql`lower(${user.email}) = lower(${clientStore.updatedBy})`)
    .where(and(eq(clientStore.space, 'client'), sql`lower(${clientStore.updatedBy}) not in (${admins})`))
    .orderBy(desc(clientStore.updatedAt))
    .limit(limit)

  const itemText = new Map<string, Map<string, string>>()
  for (const slug of new Set(rows.map((r) => r.clientSlug))) {
    const { client } = await documentItems(slug)
    itemText.set(slug, new Map((client ?? []).map((i) => [i.id, i.text])))
  }

  return rows.map((r) => {
    const who = firstName(r.by ?? r.email)
    const data = r.data as Record<string, unknown>
    const key = `${r.clientSlug}:${r.collection}:${r.docId}`
    if (r.collection === 'progress') {
      const text = itemText.get(r.clientSlug)?.get(r.docId) ?? r.docId
      return { key, clientSlug: r.clientSlug, who, at: r.at, summary: data.done ? 'Ticked off' : 'Unticked', detail: text }
    }
    if (r.collection === 'discovery') {
      const status = data.status === 'yes' ? 'Confirmed the discovery recap' : data.status === 'changes' ? 'Asked for changes to the recap' : 'Left a note on the recap'
      const notes = typeof data.notes === 'string' && data.notes.trim() ? data.notes.trim() : undefined
      return { key, clientSlug: r.clientSlug, who, at: r.at, summary: status, detail: notes }
    }
    if (r.collection === 'responses') {
      const task = itemText.get(r.clientSlug)?.get(r.docId) ?? r.docId
      const text = typeof data.text === 'string' ? data.text.trim() : ''
      return { key, clientSlug: r.clientSlug, who, at: r.at, summary: `Sent you information: ${task}`, detail: text.length > 280 ? `${text.slice(0, 280)}…` : text }
    }
    if (r.collection === 'baseline') {
      const values = Object.entries(data).filter(([, v]) => typeof v === 'string' && v.trim())
      return {
        key,
        clientSlug: r.clientSlug,
        who,
        at: r.at,
        summary: 'Updated starting numbers',
        detail: values.length ? `${r.docId}: ${values.map(([k, v]) => `${k} ${v}`).join(', ')}` : r.docId,
      }
    }
    return { key, clientSlug: r.clientSlug, who, at: r.at, summary: `Updated ${r.collection}` }
  })
}

export function firstName(name: string) {
  const clean = name.includes('@') ? name.split('@')[0] : name
  return clean.split(/\s+/)[0] || clean
}
