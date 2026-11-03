import { get } from '@vercel/blob'
import { NextResponse, type NextRequest } from 'next/server'
import { getSpotlight } from '@/lib/spotlight'

export async function GET(request: NextRequest) {
  const { beforeMenu } = await getSpotlight()
  if (!beforeMenu) return new NextResponse('Not found', { status: 404 })

  const result = await get(beforeMenu.pathname, {
    access: 'private',
    ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
  })
  if (!result) return new NextResponse('Not found', { status: 404 })

  const cache = 'public, max-age=300, stale-while-revalidate=86400'
  if (result.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, 'Cache-Control': cache } })
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': beforeMenu.contentType,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      ETag: result.blob.etag,
      'Cache-Control': cache,
    },
  })
}
