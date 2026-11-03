import { and, eq } from 'drizzle-orm'
import { type NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { clientDocuments } from '@/lib/db/schema'
import { canUseSpace, isPlanSpace } from '@/lib/plan-docs'
import { firstName } from '@/lib/plan-status'
import { planShim } from '@/lib/plan-shim'
import { planFontsLink, planThemeStyle } from '@/lib/plan-theme'
import { getClientAccess } from '@/lib/portal'

/** Plans drafted as Claude artifacts link to each other by artifact URL; point those at the portal. */
const ARTIFACT_URL = /https:\/\/claude\.ai\/(?:public\/)?artifacts?\/[A-Za-z0-9_-]+/g
const ARTIFACT_TEXT = /(?<![/\w])claude\.ai\/(?:public\/)?artifacts?\/[A-Za-z0-9_-]+/g
const ORIGINAL_FONTS =
  /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">/

function notFound() {
  return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const { viewer, client } = await getClientAccess(slug)
  if (!viewer) return Response.redirect(new URL('/portal/sign-in', request.url), 303)

  const view = request.nextUrl.searchParams.get('view') ?? 'client'
  if (!client || !isPlanSpace(view) || !canUseSpace(viewer, view)) return notFound()

  const [doc] = await db
    .select({ html: clientDocuments.html })
    .from(clientDocuments)
    .where(and(eq(clientDocuments.clientSlug, slug), eq(clientDocuments.kind, view)))
    .limit(1)
  if (!doc) return notFound()

  const clientLink = `/portal/${slug}?view=client`
  const body = doc.html
    .replace(ARTIFACT_URL, clientLink)
    .replace(ARTIFACT_TEXT, 'open it in the client portal')
    .replace(ORIGINAL_FONTS, '')
    .replace('</style>', `</style>${planThemeStyle}`)
  const shim = planShim({ slug, space: view, viewerName: firstName(viewer.name) })
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">${planFontsLink}<style>body{margin:0}</style>${shim}${body}`

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
