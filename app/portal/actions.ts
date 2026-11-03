'use server'

import { and, eq, isNull, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clientItemStatus, clientMessages, portalAccess } from '@/lib/db/schema'
import { milestoneStatuses, milestones, needStatuses, needs } from '@/lib/plan'
import {
  canViewClient,
  generateInviteCode,
  getViewer,
  hashInviteCode,
  isClientSlug,
} from '@/lib/portal'

export type ActionState = { ok: boolean; message?: string; code?: string; email?: string }

const activateSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(80),
  email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
  code: z.string().trim().min(12, 'Please enter the full access code.').max(20),
  password: z.string().min(10, 'Use at least 10 characters.').max(128),
})

const ACTIVATION_ERROR = 'That email and access code don’t match an open invitation.'

export async function activateAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = activateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message }
  const { name, email, code, password } = parsed.data

  const verified = await db
    .update(portalAccess)
    .set({ codeVerifiedAt: sql`now()` })
    .where(
      and(
        sql`lower(${portalAccess.email}) = ${email}`,
        eq(portalAccess.inviteCodeHash, hashInviteCode(code)),
        isNull(portalAccess.activatedAt),
      ),
    )
    .returning({ email: portalAccess.email })
  if (verified.length === 0) return { ok: false, message: ACTIVATION_ERROR }

  try {
    await auth.api.signUpEmail({ body: { name, email, password } })
  } catch (error) {
    console.error('Portal activation failed', error)
    return { ok: false, message: 'We couldn’t create your account. Please contact Danielle.' }
  }

  await db
    .update(portalAccess)
    .set({ activatedAt: sql`now()`, inviteCodeHash: null })
    .where(sql`lower(${portalAccess.email}) = ${email}`)

  return { ok: true, email }
}

const itemSchema = z.object({
  slug: z.string(),
  key: z.string(),
  status: z.string(),
})

export async function updateItemStatus(input: z.infer<typeof itemSchema>): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer) return { ok: false, message: 'Please sign in again.' }

  const { slug, key, status } = itemSchema.parse(input)
  if (!isClientSlug(slug) || !canViewClient(viewer, slug)) return { ok: false, message: 'Not allowed.' }

  const isMilestone = milestones.some((m) => m.key === key)
  const isNeed = needs.some((n) => n.key === key)
  if (isMilestone) {
    if (viewer.role !== 'admin') return { ok: false, message: 'Only Danielle can update milestones.' }
    if (!(milestoneStatuses as readonly string[]).includes(status)) return { ok: false, message: 'Invalid status.' }
  } else if (isNeed) {
    if (!(needStatuses as readonly string[]).includes(status)) return { ok: false, message: 'Invalid status.' }
  } else {
    return { ok: false, message: 'Unknown item.' }
  }

  await db
    .insert(clientItemStatus)
    .values({ clientSlug: slug, itemKey: key, status, updatedBy: viewer.userId })
    .onConflictDoUpdate({
      target: [clientItemStatus.clientSlug, clientItemStatus.itemKey],
      set: { status, updatedBy: viewer.userId, updatedAt: sql`now()` },
    })

  revalidatePath(`/portal/${slug}`)
  return { ok: true }
}

const messageSchema = z.object({
  slug: z.string(),
  body: z.string().trim().min(1, 'Write a message first.').max(2000, 'Keep it under 2,000 characters.'),
})

export async function postMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer) return { ok: false, message: 'Please sign in again.' }

  const parsed = messageSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message }
  const { slug, body } = parsed.data
  if (!isClientSlug(slug) || !canViewClient(viewer, slug)) return { ok: false, message: 'Not allowed.' }

  await db.insert(clientMessages).values({
    clientSlug: slug,
    userId: viewer.userId,
    authorName: viewer.name,
    authorRole: viewer.role,
    body,
  })

  revalidatePath(`/portal/${slug}`)
  return { ok: true }
}

const grantSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
  clientSlug: z.string(),
  role: z.enum(['client', 'admin']),
})

export async function grantAccess(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return { ok: false, message: 'Not allowed.' }

  const parsed = grantSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message }
  const { email, clientSlug, role } = parsed.data
  if (role === 'client' && !isClientSlug(clientSlug)) return { ok: false, message: 'Choose a client.' }

  const [existing] = await db
    .select({ activatedAt: portalAccess.activatedAt })
    .from(portalAccess)
    .where(sql`lower(${portalAccess.email}) = ${email}`)
    .limit(1)
  if (existing?.activatedAt) return { ok: false, message: 'That person already has an active account.' }

  const code = generateInviteCode()
  const values = {
    email,
    clientSlug: role === 'admin' ? '*' : clientSlug,
    role,
    inviteCodeHash: hashInviteCode(code),
    codeVerifiedAt: null,
  }
  await db
    .insert(portalAccess)
    .values(values)
    .onConflictDoUpdate({ target: portalAccess.email, set: values })

  revalidatePath('/portal/admin')
  return { ok: true, code, email }
}

export async function revokeAccess(email: string): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return { ok: false, message: 'Not allowed.' }
  const target = z.string().email().parse(email).toLowerCase()
  if (target === viewer.email.toLowerCase()) return { ok: false, message: 'You can’t remove your own access.' }

  await db.delete(portalAccess).where(sql`lower(${portalAccess.email}) = ${target}`)
  revalidatePath('/portal/admin')
  return { ok: true }
}
