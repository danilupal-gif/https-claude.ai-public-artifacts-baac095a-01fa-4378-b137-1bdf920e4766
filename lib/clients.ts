import 'server-only'

import { and, eq } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/lib/db'
import { clientStore } from '@/lib/db/schema'
import { plan } from '@/lib/plan'

export type Client = { slug: string; name: string; contact: string }

/**
 * Portal-only records (client profiles, welcome notes, read markers) live in client_store under
 * this space. The plan pages' store endpoint only accepts 'client' and 'internal', so pages can't reach it.
 */
export const META_SPACE = 'meta'

const builtIn: Client[] = [{ slug: plan.slug, name: plan.business, contact: plan.client }]

export const getClients = cache(async (): Promise<Client[]> => {
  const rows = await db
    .select({ slug: clientStore.clientSlug, data: clientStore.data })
    .from(clientStore)
    .where(and(eq(clientStore.space, META_SPACE), eq(clientStore.collection, 'profile')))

  const bySlug = new Map(builtIn.map((c) => [c.slug, c]))
  for (const row of rows) {
    const data = row.data as Partial<Client>
    if (typeof data.name === 'string' && typeof data.contact === 'string') {
      bySlug.set(row.slug, { slug: row.slug, name: data.name, contact: data.contact })
    }
  }
  return [...bySlug.values()]
})

export async function getClient(slug: string) {
  return (await getClients()).find((c) => c.slug === slug) ?? null
}

export async function readMeta<T>(slug: string, collection: string, docId: string) {
  const [row] = await db
    .select({ data: clientStore.data, updatedAt: clientStore.updatedAt })
    .from(clientStore)
    .where(
      and(
        eq(clientStore.clientSlug, slug),
        eq(clientStore.space, META_SPACE),
        eq(clientStore.collection, collection),
        eq(clientStore.docId, docId),
      ),
    )
    .limit(1)
  return row ? { data: row.data as T, updatedAt: row.updatedAt } : null
}

export async function writeMeta(slug: string, collection: string, docId: string, data: object, by: string) {
  await db
    .insert(clientStore)
    .values({ clientSlug: slug, space: META_SPACE, collection, docId, data, updatedBy: by })
    .onConflictDoUpdate({
      target: [clientStore.clientSlug, clientStore.space, clientStore.collection, clientStore.docId],
      set: { data, updatedBy: by, updatedAt: new Date() },
    })
}
