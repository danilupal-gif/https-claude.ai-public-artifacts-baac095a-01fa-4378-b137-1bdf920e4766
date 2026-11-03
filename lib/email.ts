import 'server-only'

import { headers } from 'next/headers'

type Email = { to: string; subject: string; html: string; text: string; replyTo?: string }

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_EMAIL_DOMAIN)
}

export async function sendEmail({ to, subject, html, text, replyTo }: Email) {
  if (!emailConfigured()) return { ok: false as const, error: 'Email is not set up.' }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `ÉLEVÉ Business Partners <portal@${process.env.RESEND_EMAIL_DOMAIN}>`,
      to: [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('Resend send failed', res.status, detail)
    return { ok: false as const, error: 'The email could not be sent.' }
  }
  return { ok: true as const }
}

/** The site's public origin for links in emails, taken from the current request. */
export async function siteOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

export function inviteEmail(input: { greetingName?: string; clientName?: string; inviter: string; code: string; link: string; email: string }) {
  const hello = input.greetingName ? `Hi ${input.greetingName},` : 'Hi,'
  const what = input.clientName ? `your ${input.clientName} client portal` : 'the ÉLEVÉ client portal'
  const e = escapeHtml

  const text = [
    hello,
    '',
    `${input.inviter} has set up ${what}. It holds your plan, your checklist and what's due next.`,
    '',
    `1. Open ${input.link}`,
    `2. Enter this email (${input.email}) and your access code: ${input.code}`,
    '3. Choose a password. After that you sign in with your email and password.',
    '',
    'The code works once, only with this email address.',
    '',
    input.inviter,
    'ÉLEVÉ Business Partners',
  ].join('\n')

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ec;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#17161a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e4ddd0">
<tr><td style="padding:28px 32px;background:#141317;color:#f4f1ec;font-family:Georgia,serif;font-size:22px;letter-spacing:6px">ÉLEVÉ<div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:4px;color:#c9aa78;margin-top:6px">CLIENT PORTAL</div></td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6">
<p style="margin:0 0 16px">${e(hello)}</p>
<p style="margin:0 0 24px">${e(input.inviter)} has set up ${e(what)}. It holds your plan, your checklist and what&#39;s due next.</p>
<p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#8a6a3b">YOUR ACCESS CODE</p>
<p style="margin:0 0 24px;font-family:'Courier New',monospace;font-size:24px;letter-spacing:4px;color:#17161a">${e(input.code)}</p>
<p style="margin:0 0 28px"><a href="${e(input.link)}" style="display:inline-block;background:#c9aa78;color:#141317;text-decoration:none;padding:14px 24px;font-size:12px;letter-spacing:3px">ACTIVATE MY PORTAL</a></p>
<p style="margin:0 0 8px">Enter this email (<strong>${e(input.email)}</strong>) and the code, then choose a password. After that you sign in with your email and password.</p>
<p style="margin:0;color:#6b6670;font-size:13px">The code works once, only with this email address.</p>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e4ddd0;font-size:13px;color:#6b6670">${e(input.inviter)} · ÉLEVÉ Business Partners</td></tr>
</table></td></tr></table></body></html>`

  return { subject: input.clientName ? `Your ${input.clientName} client portal` : 'Your ÉLEVÉ client portal', html, text }
}
