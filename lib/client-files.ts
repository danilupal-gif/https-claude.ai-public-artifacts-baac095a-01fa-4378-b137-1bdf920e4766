import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientFiles } from '@/lib/db/schema'

export const MAX_FILE_BYTES = 4 * 1024 * 1024
export const MAX_FILES_PER_ITEM = 10

/** Extension → content type. Only these are accepted, and the stored type comes from here, not the browser. */
export const ALLOWED_FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  heic: 'image/heic',
  gif: 'image/gif',
  csv: 'text/csv',
  txt: 'text/plain',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

export const FILE_ACCEPT = Object.keys(ALLOWED_FILE_TYPES)
  .map((ext) => `.${ext}`)
  .join(',')

export type ClientFile = typeof clientFiles.$inferSelect

export function fileHref(slug: string, id: string) {
  return `/api/portal/${encodeURIComponent(slug)}/files?id=${encodeURIComponent(id)}`
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function listClientFiles(slug: string) {
  const rows = await db.select().from(clientFiles).where(eq(clientFiles.clientSlug, slug)).orderBy(asc(clientFiles.createdAt))
  const byItem = new Map<string, ClientFile[]>()
  for (const row of rows) {
    const list = byItem.get(row.itemId) ?? []
    list.push(row)
    byItem.set(row.itemId, list)
  }
  return byItem
}
