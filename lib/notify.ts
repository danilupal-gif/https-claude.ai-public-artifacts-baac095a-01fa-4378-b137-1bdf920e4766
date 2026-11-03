import 'server-only'

import { and, eq, isNotNull } from 'drizzle-orm'
import { getClient } from '@/lib/clients'
import { db } from '@/lib/db'
import { clientDocuments, portalAccess } from '@/lib/db/schema'
import { escapeHtml as e, sendEmail } from '@/lib/email'
import { readPlanPhases } from '@/lib/plan-items'
import { requestItems } from '@/lib/plan-requests'

/** Emails every active consultant when a client sends information from their plan. */
export async function notifyClientReply(input: { slug: string; itemId: string; text: string; fromName: string; fromEmail: string; origin: string }) {
  const [client, admins, docs] = await Promise.all([
    getClient(input.slug),
    db
      .select({ email: portalAccess.email })
      .from(portalAccess)
      .where(and(eq(portalAccess.role, 'admin'), isNotNull(portalAccess.activatedAt))),
    db.select({ kind: clientDocuments.kind, html: clientDocuments.html }).from(clientDocuments).where(eq(clientDocuments.clientSlug, input.slug)),
  ])
  if (!client || admins.length === 0) return

  const clientHtml = docs.find((d) => d.kind === 'client')?.html ?? ''
  const item = requestItems(clientHtml).find((i) => i.id === input.itemId)
  const phase = readPlanPhases(docs.find((d) => d.kind === 'internal')?.html ?? '').find((p) => p.items.some((i) => i.id === input.itemId))
  const nextSteps = (phase?.items ?? []).filter((i) => i.owner !== 'k' && i.id !== input.itemId).slice(0, 4)
  const task = item?.text ?? input.itemId
  const link = `${input.origin}/portal/${input.slug}`

  const text = [
    `${input.fromName} sent you information for: ${task}`,
    '',
    input.text,
    '',
    nextSteps.length ? `Your next steps${phase ? ` (${phase.name})` : ''}:\n${nextSteps.map((s) => `- ${s.text}`).join('\n')}\n` : '',
    `Open your playbook: ${link}`,
  ].join('\n')

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ec;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#17161a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4ddd0">
<tr><td style="padding:22px 32px;background:#141317;color:#c9aa78;font-size:10px;letter-spacing:4px">${e(client.name.toUpperCase())} · FROM ${e(input.fromName.toUpperCase())}</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.6">
<p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#8a6a3b">THEY SENT YOU</p>
<p style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px">${e(task)}</p>
<p style="margin:0 0 24px;padding:14px 16px;border-left:3px solid #c9aa78;background:#f8f5ef;white-space:pre-wrap">${e(input.text)}</p>
${
  nextSteps.length
    ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#8a6a3b">YOUR NEXT STEPS${phase ? ` · ${e(phase.name.toUpperCase())}` : ''}</p><ol style="margin:0 0 24px;padding-left:20px">${nextSteps.map((s) => `<li style="margin-bottom:4px">${e(s.text)}</li>`).join('')}</ol>`
    : ''
}
<p style="margin:0"><a href="${e(link)}" style="display:inline-block;background:#c9aa78;color:#141317;text-decoration:none;padding:13px 22px;font-size:12px;letter-spacing:3px">OPEN MY PLAYBOOK</a></p>
</td></tr></table></td></tr></table></body></html>`

  await Promise.all(
    admins.map((a) =>
      sendEmail({ to: a.email, replyTo: input.fromEmail, subject: `${input.fromName} sent you: ${task}`, html, text }),
    ),
  )
}
