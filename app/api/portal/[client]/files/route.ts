import { randomUUID } from 'node:crypto'
import { del, get, put } from '@vercel/blob'
import { and, count, eq } from 'drizzle-orm'
import { NextResponse, after, type NextRequest } from 'next/server'
import { ALLOWED_FILE_TYPES, MAX_FILE_BYTES, MAX_FILES_PER_ITEM, fileHref, formatBytes } from '@/lib/client-files'
import { db } from '@/lib/db'
import { clientDocuments, clientFiles } from '@/lib/db/schema'
import { notifyClientReply } from '@/lib/notify'
import { requestItems } from '@/lib/plan-requests'
import { firstName } from '@/lib/plan-status'
import { getClientAccess } from '@/lib/portal'

const noStore = { 'Cache-Control': 'private, no-store' }
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore })

async function authorize(slug: string) {
  const { viewer, client } = await getClientAccess(slug)
  if (!viewer) return { error: fail('Sign in required', 401) }
  if (!client) return { error: fail('Not found', 404) }
  return { viewer }
}

async function findFile(slug: string, id: string | null) {
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return null
  const [row] = await db
    .select()
    .from(clientFiles)
    .where(and(eq(clientFiles.id, id), eq(clientFiles.clientSlug, slug)))
    .limit(1)
  return row ?? null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const auth = await authorize(slug)
  if ('error' in auth) return auth.error

  const file = await findFile(slug, request.nextUrl.searchParams.get('id'))
  if (!file) return fail('Not found', 404)

  const result = await get(file.pathname, { access: 'private', ifNoneMatch: request.headers.get('if-none-match') ?? undefined })
  if (!result) return fail('Not found', 404)
  if (result.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' } })
  }

  const inline = file.contentType.startsWith('image/') || file.contentType === 'application/pdf'
  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      ETag: result.blob.etag,
      'Cache-Control': 'private, no-cache',
    },
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const auth = await authorize(slug)
  if ('error' in auth) return auth.error

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  const itemId = form?.get('itemId')
  if (!(file instanceof File) || typeof itemId !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(itemId)) {
    return fail('Choose a file to attach.', 400)
  }
  if (file.size === 0) return fail('That file is empty.', 400)
  if (file.size > MAX_FILE_BYTES) return fail(`Files can be up to ${formatBytes(MAX_FILE_BYTES)}.`, 413)

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const contentType = ALLOWED_FILE_TYPES[ext]
  if (!contentType) return fail('Use a PDF, image, spreadsheet, Word, PowerPoint, CSV or text file.', 415)

  const [doc] = await db
    .select({ html: clientDocuments.html })
    .from(clientDocuments)
    .where(and(eq(clientDocuments.clientSlug, slug), eq(clientDocuments.kind, 'client')))
    .limit(1)
  if (!doc || !requestItems(doc.html).some((i) => i.id === itemId)) return fail('Not found', 404)

  const [{ n }] = await db
    .select({ n: count() })
    .from(clientFiles)
    .where(and(eq(clientFiles.clientSlug, slug), eq(clientFiles.itemId, itemId)))
  if (n >= MAX_FILES_PER_ITEM) return fail(`Up to ${MAX_FILES_PER_ITEM} files per item. Remove one first.`, 400)

  const id = randomUUID()
  const name = file.name.replace(/[\u0000-\u001f\\/]/g, '_').slice(-120) || `file.${ext}`
  const blob = await put(`clients/${slug}/${itemId}/${id}.${ext}`, file, { access: 'private', contentType, addRandomSuffix: false })

  const viewer = auth.viewer
  await db.insert(clientFiles).values({ id, clientSlug: slug, itemId, pathname: blob.pathname, name, size: file.size, contentType, uploadedBy: viewer.email })

  if (viewer.role === 'client') {
    const origin = request.nextUrl.origin
    after(() =>
      notifyClientReply({
        slug,
        itemId,
        text: `Attached a file: ${name} (${formatBytes(file.size)})`,
        fromName: firstName(viewer.name),
        fromEmail: viewer.email,
        origin,
      }).catch((error) => console.error('File notification failed', error)),
    )
  }

  return NextResponse.json({ id, name, size: formatBytes(file.size), href: fileHref(slug, id) }, { headers: noStore })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const auth = await authorize(slug)
  if ('error' in auth) return auth.error

  const file = await findFile(slug, request.nextUrl.searchParams.get('id'))
  if (!file) return fail('Not found', 404)
  if (auth.viewer.role !== 'admin' && file.uploadedBy.toLowerCase() !== auth.viewer.email.toLowerCase()) return fail('Not allowed', 403)

  await db.delete(clientFiles).where(eq(clientFiles.id, file.id))
  await del(file.pathname).catch((error) => console.error('Blob delete failed', error))
  return NextResponse.json({ ok: true }, { headers: noStore })
}
