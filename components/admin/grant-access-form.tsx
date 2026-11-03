'use client'

import { useActionState, useState } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { grantAccess, type ActionState } from '@/app/portal/actions'
import { fieldInput, fieldLabel, primaryButton } from '@/components/portal/auth-shell'

const initialState: ActionState = { ok: false }

export function GrantAccessForm({ clients }: { clients: { slug: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(grantAccess, initialState)
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex flex-col gap-6 border border-border bg-card p-6">
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="grant-email" className={fieldLabel}>
            Client email
          </label>
          <input id="grant-email" name="email" type="email" required className={fieldInput} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="grant-client" className={fieldLabel}>
            Dashboard
          </label>
          <select id="grant-client" name="clientSlug" className={fieldInput}>
            {clients.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <input type="hidden" name="role" value="client" />
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" name="sendEmail" defaultChecked className="mt-1 size-4 accent-primary" />
          <span>
            Email the invitation and access code to them
            <span className="block text-muted-foreground">Replies come to your email address.</span>
          </span>
        </label>
        {state.message ? (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Create access code
        </button>
      </form>

      {state.ok && state.code ? (
        <div role="status" className="flex flex-col gap-3 border border-primary/50 p-5">
          <p className="text-sm text-muted-foreground">
            {state.emailed ? (
              <>
                Invitation emailed to <span className="text-foreground">{state.email}</span>. The code is here as a backup
                in case it lands in spam; it won’t be shown again.
              </>
            ) : (
              <>
                Access code for <span className="text-foreground">{state.email}</span>. Copy it now and send it with the
                link to /portal/activate; it won’t be shown again.
              </>
            )}
          </p>
          <div className="flex items-center justify-between gap-3">
            <code className="font-mono text-xl tracking-widest text-primary">{state.code}</code>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(state.code ?? '')
                setCopied(true)
              }}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              <Copy className="size-4" aria-hidden="true" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
