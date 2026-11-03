'use server'

import { and, eq, isNull, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getClient, writeMeta } from '@/lib/clients'
import { db } from '@/lib/db'
import { clientDocuments, portalAccess } from '@/lib/db/schema'
import { inviteEmail, sendEmail, siteOrigin } from '@/lib/email'
import { canViewClient, generateInviteCode, getViewer, hashInviteCode } from '@/lib/portal'

export type ActionState = { ok: boolean; message?: string; code?: string; email?: string; emailed?: boolean }

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
  if (role === 'client' && !(await getClient(clientSlug))) return { ok: false, message: 'Choose a client.' }

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

  if (formData.get('sendEmail') !== 'on') return { ok: true, code, email }

  const client = role === 'client' ? await getClient(clientSlug) : null
  const message = inviteEmail({
    greetingName: client?.contact,
    clientName: client?.name,
    inviter: viewer.name.split(/\s+/)[0],
    code,
    email,
    link: `${await siteOrigin()}/portal/activate?email=${encodeURIComponent(email)}`,
  })
  const sent = await sendEmail({ to: email, replyTo: viewer.email, ...message })
  return sent.ok
    ? { ok: true, code, email, emailed: true }
    : { ok: true, code, email, emailed: false, message: `${sent.error} Send the code below yourself.` }
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

// --- Welcome note ------------------------------------------------------------

const welcomeSchema = z.object({
  slug: z.string(),
  note: z.string().trim().max(1500, 'Keep the note under 1,500 characters.'),
})

export async function saveWelcomeNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return { ok: false, message: 'Not allowed.' }
  const parsed = welcomeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message }
  if (!(await getClient(parsed.data.slug))) return { ok: false, message: 'Unknown client.' }

  await writeMeta(parsed.data.slug, 'welcome', 'note', { text: parsed.data.note, from: viewer.name.split(/\s+/)[0] }, viewer.email)
  revalidatePath('/portal/admin')
  revalidatePath(`/portal/${parsed.data.slug}`)
  return { ok: true, message: parsed.data.note ? 'Saved. It shows the next time they open their plan.' : 'Note removed.' }
}

const settingsSchema = z.object({
  slug: z.string().min(1),
  bookingUrl: z
    .string()
    .trim()
    .max(300, 'That link is too long.')
    .refine((v) => v === '' || /^https:\/\/[^\s<>"']+$/i.test(v), 'Use a full link starting with https://'),
})

export async function saveClientSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return { ok: false, message: 'Not allowed.' }
  const parsed = settingsSchema.safeParse({ slug: formData.get('slug'), bookingUrl: formData.get('bookingUrl') ?? '' })
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message }
  if (!(await getClient(parsed.data.slug))) return { ok: false, message: 'Unknown client.' }

  await writeMeta(
    parsed.data.slug,
    'settings',
    'main',
    { bookingUrl: parsed.data.bookingUrl, weeklyEmail: formData.get('weeklyEmail') === 'on' },
    viewer.email,
  )
  revalidatePath('/portal/admin')
  revalidatePath(`/portal/${parsed.data.slug}`)
  return { ok: true, message: 'Saved.' }
}

export async function dismissWelcome(slug: string): Promise<void> {
  const viewer = await getViewer()
  if (!viewer || !canViewClient(viewer, slug) || !(await getClient(slug))) return
  await writeMeta(slug, 'welcome-seen', viewer.userId, { at: new Date().toISOString() }, viewer.email)
  revalidatePath(`/portal/${slug}`)
}

// --- Activity read marker ----------------------------------------------------

export async function markActivityRead(): Promise<void> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return
  await writeMeta('*', 'activity-seen', viewer.userId, { at: new Date().toISOString() }, viewer.email)
  revalidatePath('/portal/admin')
}

// --- Clients and their plan pages -------------------------------------------

const RESERVED_SLUGS = new Set(['admin', 'sign-in', 'activate', 'api', 'plan'])
const MAX_PAGE_BYTES = 400_000

const clientSchema = z.object({
  name: z.string().trim().min(2, 'Enter the business name.').max(80),
  contact: z.string().trim().min(1, 'Enter the client’s first name.').max(40),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes only.')
    .min(3, 'Use at least 3 characters.')
    .max(40)
    .refine((s) => !RESERVED_SLUGS.has(s), 'That address is reserved. Choose another.'),
})

async function readPage(value: FormDataEntryValue | null, label: string, required: boolean) {
  if (!(value instanceof File) || value.size === 0) {
    return required ? { error: `Upload the ${label}.` } : { html: null }
  }
  if (value.size > MAX_PAGE_BYTES) return { error: `The ${label} is too large (400 KB max).` }
  const html = await value.text()
  if (!/<(?:style|section|body|div)[\s>]/i.test(html)) return { error: `The ${label} doesn’t look like an HTML page.` }
  return { html }
}

async function savePage(slug: string, kind: 'client' | 'internal', html: string) {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || (kind === 'client' ? 'Client plan' : 'Internal playbook')
  await db
    .insert(clientDocuments)
    .values({ clientSlug: slug, kind, title, html })
    .onConflictDoUpdate({
      target: [clientDocuments.clientSlug, clientDocuments.kind],
      set: { title, html, updatedAt: new Date() },
    })
}

export async function createClient(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return { ok: false, message: 'Not allowed.' }

  const parsed = clientSchema.safeParse({
    name: formData.get('name'),
    contact: formData.get('contact'),
    slug: formData.get('slug'),
  })
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message }
  const { name, contact, slug } = parsed.data
  if (await getClient(slug)) return { ok: false, message: 'A client already uses that address.' }

  const clientPage = await readPage(formData.get('clientPlan'), 'client plan', true)
  if ('error' in clientPage) return { ok: false, message: clientPage.error }
  const internalPage = await readPage(formData.get('internalPlan'), 'internal playbook', true)
  if ('error' in internalPage) return { ok: false, message: internalPage.error }

  await savePage(slug, 'client', clientPage.html!)
  await savePage(slug, 'internal', internalPage.html!)
  await writeMeta(slug, 'profile', 'profile', { name, contact }, viewer.email)

  revalidatePath('/portal/admin')
  return { ok: true, message: `${name} is ready at /portal/${slug}. Invite ${contact} below.` }
}

export async function updateClientPages(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return { ok: false, message: 'Not allowed.' }
  const slug = String(formData.get('slug') ?? '')
  if (!(await getClient(slug))) return { ok: false, message: 'Unknown client.' }

  const clientPage = await readPage(formData.get('clientPlan'), 'client plan', false)
  if ('error' in clientPage) return { ok: false, message: clientPage.error }
  const internalPage = await readPage(formData.get('internalPlan'), 'internal playbook', false)
  if ('error' in internalPage) return { ok: false, message: internalPage.error }
  if (!clientPage.html && !internalPage.html) return { ok: false, message: 'Choose at least one page to upload.' }

  if (clientPage.html) await savePage(slug, 'client', clientPage.html)
  if (internalPage.html) await savePage(slug, 'internal', internalPage.html)

  revalidatePath('/portal/admin')
  revalidatePath(`/portal/${slug}`)
  return { ok: true, message: 'Updated. Ticks and notes are kept for tasks that still exist.' }
}
