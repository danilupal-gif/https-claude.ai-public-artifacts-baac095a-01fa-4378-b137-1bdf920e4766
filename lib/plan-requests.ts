import 'server-only'

import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientDocuments, clientStore, portalAccess, user } from '@/lib/db/schema'
import { escapeHtml as e } from '@/lib/email'
import { formatDue, readPlanItems, readPlanPhases, type PlanItem } from '@/lib/plan-items'
import { firstName } from '@/lib/plan-status'

export const REQUESTS_SECTION_ID = 'your-input'
export const INBOX_SECTION_ID = 'from-client'

/** Things the client is asked to provide: their own and shared checklist items. */
export function requestItems(clientHtml: string) {
  return readPlanItems(clientHtml).filter((i) => i.owner !== 'd')
}

export async function consultantName() {
  const [row] = await db
    .select({ name: user.name })
    .from(portalAccess)
    .innerJoin(user, sql`lower(${user.email}) = lower(${portalAccess.email})`)
    .where(eq(portalAccess.role, 'admin'))
    .orderBy(portalAccess.createdAt)
    .limit(1)
  return row ? firstName(row.name) : 'your consultant'
}

export type ClientReply = {
  item: PlanItem
  text: string
  at: Date
  reviewed: boolean
  phase: string | null
  nextSteps: PlanItem[]
}

/** Every reply the client has sent, with the consultant's open tasks in the same phase of the playbook. */
export async function getClientReplies(slug: string): Promise<ClientReply[]> {
  const [docs, rows] = await Promise.all([
    db
      .select({ kind: clientDocuments.kind, html: clientDocuments.html })
      .from(clientDocuments)
      .where(eq(clientDocuments.clientSlug, slug)),
    db
      .select({ space: clientStore.space, collection: clientStore.collection, id: clientStore.docId, data: clientStore.data, at: clientStore.updatedAt })
      .from(clientStore)
      .where(and(eq(clientStore.clientSlug, slug), sql`(${clientStore.space}, ${clientStore.collection}) in (('client','responses'),('internal','inbox'),('internal','progress'))`)),
  ])

  const clientHtml = docs.find((d) => d.kind === 'client')?.html
  if (!clientHtml) return []
  const items = new Map(requestItems(clientHtml).map((i) => [i.id, i]))
  const phases = readPlanPhases(docs.find((d) => d.kind === 'internal')?.html ?? clientHtml)
  const reviewedAt = new Map<string, string>()
  const done = new Set<string>()
  for (const r of rows) {
    const data = r.data as Record<string, unknown>
    if (r.collection === 'inbox' && typeof data.reviewedAt === 'string') reviewedAt.set(r.id, data.reviewedAt)
    if (r.collection === 'progress' && data.done) done.add(r.id)
  }

  const replies: ClientReply[] = []
  for (const r of rows) {
    if (r.collection !== 'responses') continue
    const item = items.get(r.id)
    const text = (r.data as { text?: unknown }).text
    if (!item || typeof text !== 'string' || !text.trim()) continue
    const phase = phases.find((p) => p.items.some((i) => i.id === r.id)) ?? null
    const seen = reviewedAt.get(r.id)
    replies.push({
      item,
      text: text.trim(),
      at: r.at,
      reviewed: Boolean(seen && new Date(seen) >= r.at),
      phase: phase ? phase.name : null,
      nextSteps: (phase?.items ?? []).filter((i) => i.owner !== 'k' && i.id !== r.id && !done.has(i.id)).slice(0, 4),
    })
  }
  return replies.sort((a, b) => Number(a.reviewed) - Number(b.reviewed) || b.at.getTime() - a.at.getTime())
}

const STYLE = `<style>
.v0-reqs{display:grid;gap:14px}
.v0-req{border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:16px 18px;display:grid;gap:10px}
.v0-req-head{display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap}
.v0-req-head label,.v0-req-head h3{font-weight:600;font-size:1rem;margin:0;font-family:inherit}
.v0-meta{font-family:var(--mono);font-size:.72rem;letter-spacing:.06em;color:var(--muted);text-transform:uppercase}
.v0-req textarea.inp{width:100%;box-sizing:border-box}
.v0-req-status{font-size:.85rem;color:var(--muted)}
.v0-req-status.ok{color:var(--leaf)}
.v0-req-status.err{color:var(--alert)}
.v0-reply{white-space:pre-wrap;line-height:1.6;margin:0;padding:12px 14px;border-left:2px solid var(--leaf);background:var(--paper)}
.v0-pill{font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:999px;border:1px solid var(--line)}
.v0-pill.new{background:var(--leaf);color:var(--paper);border-color:var(--leaf)}
.v0-next{margin:0;padding-left:18px;display:grid;gap:4px;color:var(--ink)}
.v0-req.is-reviewed{opacity:.72}
@media print{.v0-req .btnrow{display:none}}
</style>`

export function clientRequestsSection(items: PlanItem[], consultant: string) {
  if (items.length === 0) return ''
  const cards = items
    .map(
      (i) => `<div class="v0-req" data-req="${e(i.id)}">
  <div class="v0-req-head"><label for="req-${e(i.id)}">${e(i.text)}</label>${i.due ? `<span class="v0-meta">Due ${e(formatDue(i.due))}</span>` : ''}</div>
  <textarea class="inp" id="req-${e(i.id)}" maxlength="2000" placeholder="Type the details, links or answers here."></textarea>
  <div class="btnrow"><button type="button" class="btn" data-send="${e(i.id)}">Send to ${e(consultant)}</button><span class="v0-req-status" aria-live="polite"></span></div>
</div>`,
    )
    .join('')

  return `${STYLE}<section id="${REQUESTS_SECTION_ID}"><div class="wrap">
  <div class="head">
    <div class="eyebrow">What I need from you</div>
    <h2>Your input</h2>
    <p class="muted">Add anything I&#39;ve asked for under the matching item and press send. It comes straight to me, and you can update it any time. Please don&#39;t paste passwords here: invite me as a user on the tool instead.</p>
  </div>
  <div class="v0-reqs">${cards}</div>
</div></section>`
}

const when = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })

export function internalInboxSection(replies: ClientReply[], contact: string) {
  const open = replies.filter((r) => !r.reviewed).length
  const cards = replies
    .map(
      (r) => `<div class="v0-req${r.reviewed ? ' is-reviewed' : ''}" data-reply="${e(r.item.id)}">
  <div class="v0-req-head"><h3>${e(r.item.text)}</h3><span class="v0-pill${r.reviewed ? '' : ' new'}" data-reply-pill>${r.reviewed ? 'Reviewed' : 'New'}</span></div>
  <span class="v0-meta">${e(contact)} · ${e(when.format(r.at))}${r.phase ? ` · ${e(r.phase)}` : ''}</span>
  <p class="v0-reply">${e(r.text)}</p>
  ${
    r.nextSteps.length
      ? `<div><div class="v0-meta" style="margin-bottom:6px">Your next steps</div><ol class="v0-next">${r.nextSteps.map((s) => `<li><a href="#timeline">${e(s.text)}</a></li>`).join('')}</ol></div>`
      : ''
  }
  ${r.reviewed ? '' : `<div class="btnrow"><button type="button" class="btn" data-review="${e(r.item.id)}">Mark as reviewed</button><span class="v0-req-status" aria-live="polite"></span></div>`}
</div>`,
    )
    .join('')

  return `${STYLE}<section id="${INBOX_SECTION_ID}"><div class="wrap">
  <div class="head">
    <div class="eyebrow">Inbox · ${open ? `${open} to review` : 'all reviewed'}</div>
    <h2>From ${e(contact)}</h2>
    <p class="muted">What ${e(contact)} sent from the &quot;Your input&quot; section of the client plan, newest unreviewed first, with your open tasks from the same phase.</p>
  </div>
  ${cards ? `<div class="v0-reqs">${cards}</div>` : `<p class="muted">Nothing from ${e(contact)} yet. When they send something, it appears here and you get an email.</p>`}
</div></section>`
}

/** Inserts a section after `afterId`'s section (or before `beforeId`), and a matching link in the page's section nav. */
export function injectSection(html: string, section: string, opts: { id: string; label: string; afterId?: string; beforeId?: string }) {
  if (!section) return html
  let out = html
  let at = -1
  if (opts.afterId) {
    const start = out.indexOf(`<section id="${opts.afterId}"`)
    if (start >= 0) at = out.indexOf('<section', start + 8)
  }
  if (at < 0 && opts.beforeId) at = out.indexOf(`<section id="${opts.beforeId}"`)
  if (at < 0) at = out.indexOf('<section')
  out = at < 0 ? out + section : out.slice(0, at) + section + '\n' + out.slice(at)

  const link = `<a href="#${opts.id}">${e(opts.label)}</a>`
  const afterLink = opts.afterId ? out.match(new RegExp(`<a href="#${opts.afterId}">[^<]*</a>`)) : null
  if (afterLink?.index !== undefined) {
    const end = afterLink.index + afterLink[0].length
    return out.slice(0, end) + link + out.slice(end)
  }
  return out.replace(/(<nav class="toc"[^>]*>\s*<div class="wrap">\s*)/, `$1${link}`)
}
