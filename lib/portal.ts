import 'server-only'

import { createHash, randomBytes } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { portalAccess } from '@/lib/db/schema'
import { plan } from '@/lib/plan'

export const clients = {
  dreamworks365: { slug: plan.slug, name: plan.business, contact: plan.client },
} as const

export type ClientSlug = keyof typeof clients

export function isClientSlug(value: string): value is ClientSlug {
  return Object.prototype.hasOwnProperty.call(clients, value)
}

export type PortalViewer = {
  userId: string
  name: string
  email: string
  role: 'client' | 'admin'
  clientSlug: string
}

export async function getViewer(): Promise<PortalViewer | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [access] = await db
    .select()
    .from(portalAccess)
    .where(sql`lower(${portalAccess.email}) = lower(${session.user.email})`)
    .limit(1)
  if (!access) return null

  return {
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: access.role === 'admin' ? 'admin' : 'client',
    clientSlug: access.clientSlug,
  }
}

export function canViewClient(viewer: PortalViewer, slug: string) {
  return viewer.role === 'admin' || viewer.clientSlug === slug
}

/** For pages: redirects to sign-in when signed out, 404s when the viewer has no access. */
export async function requireClientViewer(slug: string) {
  const viewer = await getViewer()
  if (!viewer) redirect('/portal/sign-in')
  if (!isClientSlug(slug) || !canViewClient(viewer, slug)) notFound()
  return viewer
}

export async function requireAdmin() {
  const viewer = await getViewer()
  if (!viewer) redirect('/portal/sign-in')
  if (viewer.role !== 'admin') notFound()
  return viewer
}

export function hashInviteCode(code: string) {
  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return createHash('sha256').update(normalized).digest('hex')
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateInviteCode() {
  const bytes = randomBytes(12)
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`
}
