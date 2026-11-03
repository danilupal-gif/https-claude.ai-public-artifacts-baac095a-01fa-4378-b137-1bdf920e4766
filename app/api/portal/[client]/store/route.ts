import { and, eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { clientStore } from '@/lib/db/schema'
import { allowedCollections, canUseSpace, isPlanSpace } from '@/lib/plan-docs'
import { canViewClient, getViewer, isClientSlug } from '@/lib/portal'

const noStore = { 'Cache-Control': 'private, no-store' }

async function authorize(slug: string, space: unknown) {
  const viewer = await getViewer()
  if (!viewer) return { error: NextResponse.json({ error: 'Sign in required' }, { status: 401, headers: noStore }) }
  if (!isClientSlug(slug) || !canViewClient(viewer, slug) || !isPlanSpace(space) || !canUseSpace(viewer, space)) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStore }) }
  }
  return { viewer, space }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const result = await authorize(slug, request.nextUrl.searchParams.get('space'))
  if ('error' in result) return result.error

  const rows = await db
    .select({ collection: clientStore.collection, id: clientStore.docId, data: clientStore.data })
    .from(clientStore)
    .where(and(eq(clientStore.clientSlug, slug), eq(clientStore.space, result.space)))

  const collections: Record<string, { id: string; data: unknown }[]> = {}
  for (const row of rows) (collections[row.collection] ??= []).push({ id: row.id, data: row.data })
  return NextResponse.json({ collections }, { headers: noStore })
}

const writeSchema = z.object({
  space: z.string(),
  collection: z.string(),
  id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/),
  data: z.record(z.string(), z.union([z.string().max(2000), z.number(), z.boolean(), z.null()])),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const parsed = writeSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStore })

  const { space, collection, id, data } = parsed.data
  const result = await authorize(slug, space)
  if ('error' in result) return result.error
  if (!allowedCollections[result.space].includes(collection) || Object.keys(data).length > 20) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: noStore })
  }

  await db
    .insert(clientStore)
    .values({ clientSlug: slug, space: result.space, collection, docId: id, data, updatedBy: result.viewer.email })
    .onConflictDoUpdate({
      target: [clientStore.clientSlug, clientStore.space, clientStore.collection, clientStore.docId],
      set: { data, updatedBy: result.viewer.email, updatedAt: sql`now()` },
    })

  return NextResponse.json({ ok: true }, { headers: noStore })
}
