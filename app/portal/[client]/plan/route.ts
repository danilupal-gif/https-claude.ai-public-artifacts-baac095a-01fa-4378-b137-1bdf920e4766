import { and, eq } from 'drizzle-orm'
import { type NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { clientDocuments } from '@/lib/db/schema'
import { canUseSpace, isPlanSpace } from '@/lib/plan-docs'
import { planShim } from '@/lib/plan-shim'
import { canViewClient, getViewer, isClientSlug } from '@/lib/portal'

const CLAUDE_CLIENT_PLAN = 'https://claude.ai/artifact/H1fo7zJzKfLmLFYt8hD5Fn'

function notFound() {
  return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const viewer = await getViewer()
  if (!viewer) return Response.redirect(new URL('/portal/sign-in', request.url), 303)

  const view = request.nextUrl.searchParams.get('view') ?? 'client'
  if (!isClientSlug(slug) || !canViewClient(viewer, slug) || !isPlanSpace(view) || !canUseSpace(viewer, view)) {
    return notFound()
  }

  const [doc] = await db
    .select({ html: clientDocuments.html })
    .from(clientDocuments)
    .where(and(eq(clientDocuments.clientSlug, slug), eq(clientDocuments.kind, view)))
    .limit(1)
  if (!doc) return notFound()

  const body = doc.html
    .replaceAll(CLAUDE_CLIENT_PLAN, `/portal/${slug}?view=client`)
    .replaceAll(CLAUDE_CLIENT_PLAN.replace('https://', ''), 'open it in the client portal')
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><style>body{margin:0}</style>${planShim({ slug, space: view })}${body}`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
    },
  })
}
