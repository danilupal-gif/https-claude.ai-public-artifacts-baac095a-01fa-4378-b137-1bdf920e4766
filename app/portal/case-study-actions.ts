'use server'

import { and, eq, isNotNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/app/portal/actions'
import {
  caseStudyContentSchema,
  getCaseStudy,
  getPublishedCaseStudies,
  saveCaseStudy,
  slugify,
  type CaseStudy,
  type CaseStudyContent,
} from '@/lib/case-studies'
import { getClient } from '@/lib/clients'
import { db } from '@/lib/db'
import { portalAccess } from '@/lib/db/schema'
import { escapeHtml as e, sendEmail, siteOrigin } from '@/lib/email'
import { consultantName } from '@/lib/plan-requests'
import { firstName } from '@/lib/plan-status'
import { canViewClient, getViewer } from '@/lib/portal'
import { clientRecipients } from '@/lib/weekly-digest'

function noticeEmail(input: { eyebrow: string; title: string; body: string; cta: string; link: string }) {
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ec;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#17161a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4ddd0">
<tr><td style="padding:22px 32px;background:#141317;color:#c9aa78;font-size:10px;letter-spacing:4px">${e(input.eyebrow.toUpperCase())}</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6">
<p style="margin:0 0 14px;font-family:Georgia,serif;font-size:22px">${e(input.title)}</p>
<p style="margin:0 0 24px;white-space:pre-wrap;color:#4a463f">${e(input.body)}</p>
<a href="${e(input.link)}" style="display:inline-block;background:#c9aa78;color:#141317;text-decoration:none;padding:13px 22px;font-size:12px;letter-spacing:3px">${e(input.cta.toUpperCase())}</a>
</td></tr></table></td></tr></table></body></html>`
  return { html, text: `${input.title}\n\n${input.body}\n\n${input.cta}: ${input.link}` }
}

function readContent(formData: FormData) {
  const results: CaseStudyContent['results'] = []
  for (let i = 0; i < 8; i++) {
    const label = String(formData.get(`result-label-${i}`) ?? '').trim()
    if (!label) continue
    results.push({ label, before: String(formData.get(`result-before-${i}`) ?? ''), after: String(formData.get(`result-after-${i}`) ?? '') })
  }
  const field = (name: string) => String(formData.get(name) ?? '')
  return caseStudyContentSchema.safeParse({
    headline: field('headline'),
    displayName: field('displayName'),
    industry: field('industry'),
    summary: field('summary'),
    challenge: field('challenge'),
    approach: field('approach'),
    outcome: field('outcome'),
    quote: field('quote'),
    quoteBy: field('quoteBy'),
    results,
  })
}

const sameContent = (a: CaseStudyContent, b: CaseStudyContent) =>
  JSON.stringify(caseStudyContentSchema.parse(a)) === JSON.stringify(caseStudyContentSchema.parse(b))

async function uniquePublicSlug(headline: string, clientSlug: string) {
  const taken = new Set((await getPublishedCaseStudies()).filter((s) => s.clientSlug !== clientSlug).map((s) => s.publicSlug))
  const base = slugify(headline)
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  return slug
}

export async function saveCaseStudyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return { ok: false, message: 'Not allowed.' }
  const slug = String(formData.get('slug') ?? '')
  const client = await getClient(slug)
  if (!client) return { ok: false, message: 'Unknown client.' }
  const intent = String(formData.get('intent') ?? 'save')

  const parsed = readContent(formData)
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message }
  const content = parsed.data
  const existing = await getCaseStudy(slug)
  const changed = !existing || !sameContent(existing, content)

  let status: CaseStudy['status'] = existing && !changed ? existing.status : 'draft'
  let message = existing?.status === 'published' && changed ? 'Saved. It was taken off the website until the client approves the new version.' : 'Draft saved.'
  let publishedAt = status === 'published' ? existing?.publishedAt : undefined

  if (intent === 'send') {
    const recipients = await clientRecipients(slug)
    if (!recipients.length) return { ok: false, message: `${client.contact} doesn’t have an active portal login yet.` }
    status = 'awaiting'
    const origin = await siteOrigin()
    const consultant = await consultantName()
    for (const r of recipients) {
      const mail = noticeEmail({
        eyebrow: `${client.name} · Your story`,
        title: `${consultant} would like to share your results`,
        body: `${consultant} wrote a short case study about your pilot. Nothing is published unless you approve it. You can approve it, ask for changes or say no.`,
        cta: 'Review it',
        link: `${origin}/portal/${slug}/case-study`,
      })
      await sendEmail({ to: r.email, replyTo: viewer.email, subject: `Can ${consultant} share your story?`, ...mail })
    }
    message = `Sent to ${client.contact} for approval.`
  } else if (intent === 'publish') {
    if (!existing || changed || (existing.status !== 'approved' && existing.status !== 'published')) {
      return { ok: false, message: `Only the exact version ${client.contact} approved can be published.` }
    }
    status = 'published'
    publishedAt = existing.publishedAt ?? new Date().toISOString()
    message = 'Published on your website.'
  } else if (intent === 'unpublish') {
    if (existing?.status !== 'published') return { ok: false, message: 'It isn’t published.' }
    status = 'approved'
    publishedAt = undefined
    message = 'Taken off the website. It stays approved, so you can publish it again.'
  }

  await saveCaseStudy(
    slug,
    {
      ...content,
      publicSlug: existing?.status === 'published' && !changed ? existing.publicSlug : await uniquePublicSlug(content.headline, slug),
      status,
      clientNote: changed ? undefined : existing?.clientNote,
      decidedBy: changed ? undefined : existing?.decidedBy,
      decidedAt: changed ? undefined : existing?.decidedAt,
      publishedAt,
    },
    viewer.email,
  )
  revalidatePath('/portal/admin')
  revalidatePath(`/portal/${slug}`)
  revalidatePath('/case-studies', 'layout')
  return { ok: true, message }
}

export async function decideCaseStudyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  const slug = String(formData.get('slug') ?? '')
  if (!viewer || viewer.role !== 'client' || !canViewClient(viewer, slug)) {
    return { ok: false, message: 'Only the client can approve their own story.' }
  }
  const decision = String(formData.get('decision') ?? '')
  if (!['approved', 'changes', 'declined'].includes(decision)) return { ok: false, message: 'Choose an option.' }
  const note = String(formData.get('note') ?? '').trim().slice(0, 1500)
  if (decision === 'changes' && !note) return { ok: false, message: 'Tell us what to change.' }

  const [study, client] = await Promise.all([getCaseStudy(slug), getClient(slug)])
  if (!study || !client || study.status !== 'awaiting') return { ok: false, message: 'There’s nothing waiting for your approval.' }

  await saveCaseStudy(
    slug,
    {
      ...study,
      status: decision as CaseStudy['status'],
      clientNote: note || undefined,
      decidedBy: firstName(viewer.name),
      decidedAt: new Date().toISOString(),
    },
    viewer.email,
  )

  const admins = await db
    .select({ email: portalAccess.email })
    .from(portalAccess)
    .where(and(eq(portalAccess.role, 'admin'), isNotNull(portalAccess.activatedAt)))
  const origin = await siteOrigin()
  const who = firstName(viewer.name)
  const verdict = decision === 'approved' ? 'approved your case study' : decision === 'changes' ? 'asked for changes to the case study' : 'declined the case study'
  const mail = noticeEmail({
    eyebrow: `${client.name} · Case study`,
    title: `${who} ${verdict}`,
    body: `${decision === 'approved' ? 'You can publish it from your Admin page whenever you’re ready.' : ''}${note ? `${decision === 'approved' ? '\n\n' : ''}Their note: ${note}` : ''}`,
    cta: 'Open Admin',
    link: `${origin}/portal/admin`,
  })
  await Promise.all(admins.map((a) => sendEmail({ to: a.email, replyTo: viewer.email, subject: `${who} ${verdict}`, ...mail })))

  revalidatePath(`/portal/${slug}`)
  revalidatePath('/portal/admin')
  return {
    ok: true,
    message:
      decision === 'approved'
        ? 'Thank you. You’ve approved it, and we’ll let you know when it’s live.'
        : decision === 'changes'
          ? 'Thanks. Your notes were sent, and you’ll see the updated version here.'
          : 'Understood. It won’t be published.',
  }
}
