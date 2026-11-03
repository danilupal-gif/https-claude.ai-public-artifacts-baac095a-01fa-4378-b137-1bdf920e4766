import 'server-only'

import { and, eq, isNotNull, sql } from 'drizzle-orm'
import { getClientSettings } from '@/lib/client-settings'
import { getClient, getClients, readMeta, writeMeta } from '@/lib/clients'
import { db } from '@/lib/db'
import { clientStore, portalAccess, user } from '@/lib/db/schema'
import { escapeHtml as e, sendEmail } from '@/lib/email'
import { addDays, formatDue, todayISO, type PlanItem } from '@/lib/plan-items'
import { consultantName } from '@/lib/plan-requests'
import { documentItems, firstName } from '@/lib/plan-status'

type Digest = { subject: string; html: string; text: string }

/** Public origin for links in scheduled emails, where there is no incoming page request. */
export function scheduledOrigin(fallback: string) {
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL
  return prod ? `https://${prod}` : fallback
}

export async function clientRecipients(slug: string) {
  const rows = await db
    .select({ email: portalAccess.email, name: user.name })
    .from(portalAccess)
    .leftJoin(user, sql`lower(${user.email}) = lower(${portalAccess.email})`)
    .where(and(eq(portalAccess.clientSlug, slug), eq(portalAccess.role, 'client'), isNotNull(portalAccess.activatedAt)))
  return rows.map((r) => ({ email: r.email, name: r.name ? firstName(r.name) : null }))
}

export async function buildWeeklyDigest(slug: string, origin: string, greetingName: string | null): Promise<Digest | null> {
  const [client, items, progress, consultant, settings] = await Promise.all([
    getClient(slug),
    documentItems(slug),
    db
      .select({ id: clientStore.docId, data: clientStore.data, at: clientStore.updatedAt })
      .from(clientStore)
      .where(and(eq(clientStore.clientSlug, slug), eq(clientStore.space, 'client'), eq(clientStore.collection, 'progress'))),
    consultantName(),
    getClientSettings(slug),
  ])
  if (!client || !items.client || items.client.length === 0) return null

  const all = items.client
  const doneRows = progress.filter((r) => (r.data as { done?: boolean }).done)
  const done = new Set(doneRows.map((r) => r.id))
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentIds = new Set(doneRows.filter((r) => r.at.getTime() >= weekAgo).map((r) => r.id))

  const today = todayISO()
  const weekEnd = addDays(today, 6)
  const open = all.filter((i) => i.due && !done.has(i.id))
  const doneThisWeek = all.filter((i) => recentIds.has(i.id))
  const overdue = open.filter((i) => i.owner !== 'd' && i.due! < today).sort((a, b) => a.due!.localeCompare(b.due!))
  const dueThisWeek = open.filter((i) => i.due! >= today && i.due! <= weekEnd).sort((a, b) => a.due!.localeCompare(b.due!))
  const pct = Math.round((done.size / all.length) * 100)

  const owner = (i: PlanItem) => (i.owner === 'k' ? 'You' : i.owner === 'b' ? 'Both of us' : consultant)
  const link = `${origin}/portal/${slug}`
  const name = greetingName ?? client.contact

  const groups: { title: string; items: PlanItem[]; empty: string; tone: string; due: boolean }[] = [
    { title: 'Done this week', items: doneThisWeek, empty: 'Nothing ticked off this week yet.', tone: '#3d6b4f', due: false },
    { title: 'Due this week', items: dueThisWeek, empty: 'Nothing due this week.', tone: '#8a6a3b', due: true },
    { title: 'Overdue', items: overdue, empty: 'Nothing overdue. Nice work.', tone: '#a3402e', due: true },
  ]

  const list = (g: (typeof groups)[number]) =>
    g.items.length
      ? `<ul style="margin:0;padding:0;list-style:none">${g.items
          .map(
            (i) =>
              `<li style="padding:10px 0;border-top:1px solid #eee6d8"><span style="display:block">${e(i.text)}</span><span style="font-size:12px;color:#7a746a">${e(owner(i))}${g.due && i.due ? ` · due ${e(formatDue(i.due))}` : ''}</span></li>`,
          )
          .join('')}</ul>`
      : `<p style="margin:0;color:#7a746a">${e(g.empty)}</p>`

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ec;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#17161a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4ddd0">
<tr><td style="padding:22px 32px;background:#141317;color:#c9aa78;font-size:10px;letter-spacing:4px">${e(client.name.toUpperCase())} · WEEKLY UPDATE</td></tr>
<tr><td style="padding:28px 32px 8px;font-size:15px;line-height:1.6">
<p style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px">Good morning, ${e(name)}.</p>
<p style="margin:0 0 20px;color:#4a463f">Here&#39;s where the plan stands this week.</p>
<p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#8a6a3b">OVERALL PROGRESS</p>
<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:32px">${pct}%<span style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#7a746a"> · ${done.size} of ${all.length} done</span></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px"><tr><td style="background:#eee6d8;height:6px"><div style="width:${pct}%;background:#c9aa78;height:6px"></div></td></tr></table>
</td></tr>
${groups
  .map(
    (g) =>
      `<tr><td style="padding:18px 32px 4px;font-size:15px;line-height:1.5"><p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:${g.tone}">${e(g.title.toUpperCase())} · ${g.items.length}</p>${list(g)}</td></tr>`,
  )
  .join('')}
<tr><td style="padding:24px 32px 32px">
<a href="${e(link)}" style="display:inline-block;background:#c9aa78;color:#141317;text-decoration:none;padding:13px 22px;font-size:12px;letter-spacing:3px">OPEN MY PLAN</a>
${settings.bookingUrl ? `<p style="margin:16px 0 0;font-size:14px;color:#4a463f">Want to talk something through? <a href="${e(settings.bookingUrl)}" style="color:#8a6a3b">Book a check-in with ${e(consultant)}</a>.</p>` : ''}
<p style="margin:16px 0 0;font-size:12px;color:#7a746a">You get this every Monday during the pilot. Reply to this email to reach ${e(consultant)}.</p>
</td></tr></table></td></tr></table></body></html>`

  const textList = (g: (typeof groups)[number]) =>
    g.items.length ? g.items.map((i) => `- ${i.text} (${owner(i)}${g.due && i.due ? `, due ${formatDue(i.due)}` : ''})`).join('\n') : g.empty
  const text = [
    `Good morning, ${name}.`,
    '',
    `Overall progress: ${pct}% (${done.size} of ${all.length} done)`,
    '',
    ...groups.flatMap((g) => [`${g.title.toUpperCase()} (${g.items.length})`, textList(g), '']),
    `Open your plan: ${link}`,
    settings.bookingUrl ? `Book a check-in: ${settings.bookingUrl}` : '',
  ].join('\n')

  const bits = [dueThisWeek.length && `${dueThisWeek.length} due this week`, overdue.length && `${overdue.length} overdue`].filter(Boolean)
  return { subject: `Your weekly update: ${pct}% done${bits.length ? `, ${bits.join(', ')}` : ''}`, html, text }
}

async function replyToAddress() {
  const [row] = await db
    .select({ email: portalAccess.email })
    .from(portalAccess)
    .where(and(eq(portalAccess.role, 'admin'), isNotNull(portalAccess.activatedAt)))
    .orderBy(portalAccess.createdAt)
    .limit(1)
  return row?.email
}

/** Sends the Monday update to every client who has it switched on. Skips anyone already sent one in the last 20 hours. */
export async function sendWeeklyDigests(origin: string) {
  const replyTo = await replyToAddress()
  const summary: { slug: string; sent: number; skipped?: string }[] = []

  for (const client of await getClients()) {
    const settings = await getClientSettings(client.slug)
    if (!settings.weeklyEmail) {
      summary.push({ slug: client.slug, sent: 0, skipped: 'switched off' })
      continue
    }
    const last = await readMeta<{ sentAt?: string }>(client.slug, 'digest', 'last')
    if (last?.data.sentAt && Date.now() - new Date(last.data.sentAt).getTime() < 20 * 60 * 60 * 1000) {
      summary.push({ slug: client.slug, sent: 0, skipped: 'already sent' })
      continue
    }

    let sent = 0
    for (const r of await clientRecipients(client.slug)) {
      const digest = await buildWeeklyDigest(client.slug, origin, r.name)
      if (!digest) break
      const result = await sendEmail({ to: r.email, subject: digest.subject, html: digest.html, text: digest.text, replyTo })
      if (result.ok) sent++
    }
    if (sent) await writeMeta(client.slug, 'digest', 'last', { sentAt: new Date().toISOString(), sent }, 'system')
    summary.push({ slug: client.slug, sent })
  }
  return summary
}
