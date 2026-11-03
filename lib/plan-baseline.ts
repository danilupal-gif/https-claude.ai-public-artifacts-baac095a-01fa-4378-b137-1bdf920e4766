import 'server-only'

import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientDocuments, clientStore } from '@/lib/db/schema'

export type BaselineRow = { key: string; label: string; w1: string; end: string }

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()

/** The client's before-and-after measures: labels from their plan's table, numbers from what they entered. */
export async function getBaselineRows(slug: string): Promise<BaselineRow[]> {
  const [[doc], saved] = await Promise.all([
    db
      .select({ html: clientDocuments.html })
      .from(clientDocuments)
      .where(and(eq(clientDocuments.clientSlug, slug), eq(clientDocuments.kind, 'client')))
      .limit(1),
    db
      .select({ id: clientStore.docId, data: clientStore.data })
      .from(clientStore)
      .where(and(eq(clientStore.clientSlug, slug), eq(clientStore.space, 'client'), eq(clientStore.collection, 'baseline'))),
  ])
  if (!doc) return []

  const values = new Map(saved.map((r) => [r.id, r.data as Partial<Record<'w1' | 'end', unknown>>]))
  const rows: BaselineRow[] = []
  for (const m of doc.html.matchAll(/<tr>\s*<td>([^<]+)<\/td>\s*<td>\s*<input[^>]*data-m="([A-Za-z0-9_-]+)"/g)) {
    const v = values.get(m[2]) ?? {}
    rows.push({
      key: m[2],
      label: decode(m[1]),
      w1: typeof v.w1 === 'string' ? v.w1 : '',
      end: typeof v.end === 'string' ? v.end : '',
    })
  }
  return rows
}
