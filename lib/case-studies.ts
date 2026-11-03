import 'server-only'

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { META_SPACE, readMeta, writeMeta } from '@/lib/clients'
import { db } from '@/lib/db'
import { clientStore } from '@/lib/db/schema'

/**
 * draft → awaiting (sent to the client) → approved | changes | declined → published.
 * Editing after approval sends it back to draft, so nothing goes public without the client's yes on that exact text.
 */
export const caseStudyStatuses = ['draft', 'awaiting', 'approved', 'changes', 'declined', 'published'] as const
export type CaseStudyStatus = (typeof caseStudyStatuses)[number]

export const resultSchema = z.object({
  label: z.string().trim().min(1).max(120),
  before: z.string().trim().max(60),
  after: z.string().trim().max(60),
})

export const caseStudyContentSchema = z.object({
  headline: z.string().trim().min(4, 'Add a headline.').max(140),
  displayName: z.string().trim().min(2, 'Add how the business should be named.').max(80),
  industry: z.string().trim().max(60),
  summary: z.string().trim().min(10, 'Add a one-line summary.').max(280),
  challenge: z.string().trim().min(10, 'Describe the challenge.').max(1500),
  approach: z.string().trim().min(10, 'Describe what you did.').max(1500),
  outcome: z.string().trim().max(1500),
  quote: z.string().trim().max(500),
  quoteBy: z.string().trim().max(80),
  results: z.array(resultSchema).max(8),
})

export type CaseStudyContent = z.infer<typeof caseStudyContentSchema>

export type CaseStudy = CaseStudyContent & {
  clientSlug: string
  publicSlug: string
  status: CaseStudyStatus
  clientNote?: string
  decidedBy?: string
  decidedAt?: string
  publishedAt?: string
  updatedAt: string
}

const COLLECTION = 'case-study'
const DOC = 'main'

export function slugify(value: string) {
  return (
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'story'
  )
}

function parse(slug: string, data: unknown, updatedAt: Date): CaseStudy | null {
  const content = caseStudyContentSchema.safeParse(data)
  const d = data as Partial<CaseStudy>
  if (!content.success || !caseStudyStatuses.includes(d.status as CaseStudyStatus)) return null
  return {
    ...content.data,
    clientSlug: slug,
    publicSlug: typeof d.publicSlug === 'string' ? d.publicSlug : slugify(content.data.headline),
    status: d.status as CaseStudyStatus,
    clientNote: d.clientNote,
    decidedBy: d.decidedBy,
    decidedAt: d.decidedAt,
    publishedAt: d.publishedAt,
    updatedAt: updatedAt.toISOString(),
  }
}

export async function getCaseStudy(slug: string) {
  const row = await readMeta<unknown>(slug, COLLECTION, DOC)
  return row ? parse(slug, row.data, row.updatedAt) : null
}

export async function saveCaseStudy(slug: string, study: Omit<CaseStudy, 'clientSlug' | 'updatedAt'>, by: string) {
  await writeMeta(slug, COLLECTION, DOC, study, by)
}

export async function getPublishedCaseStudies() {
  const rows = await db
    .select({ slug: clientStore.clientSlug, data: clientStore.data, at: clientStore.updatedAt })
    .from(clientStore)
    .where(and(eq(clientStore.space, META_SPACE), eq(clientStore.collection, COLLECTION), eq(clientStore.docId, DOC)))
  return rows
    .map((r) => parse(r.slug, r.data, r.at))
    .filter((s): s is CaseStudy => s?.status === 'published')
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
}

export async function getPublishedCaseStudy(publicSlug: string) {
  return (await getPublishedCaseStudies()).find((s) => s.publicSlug === publicSlug) ?? null
}

export const statusLabel: Record<CaseStudyStatus, string> = {
  draft: 'Draft',
  awaiting: 'Waiting for client approval',
  approved: 'Approved, ready to publish',
  changes: 'Client asked for changes',
  declined: 'Client declined',
  published: 'Published',
}
