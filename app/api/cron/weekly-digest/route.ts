import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { scheduledOrigin, sendWeeklyDigests } from '@/lib/weekly-digest'

export const maxDuration = 60

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** Called by Vercel Cron every Monday (see vercel.json). */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const summary = await sendWeeklyDigests(scheduledOrigin(request.nextUrl.origin))
  return NextResponse.json({ ok: true, summary })
}
