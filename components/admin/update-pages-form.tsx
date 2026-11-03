'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateClientPages, type ActionState } from '@/app/portal/actions'
import { fieldLabel, primaryButton } from '@/components/portal/auth-shell'

const initialState: ActionState = { ok: false }

export const fileInput =
  'w-full border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:mr-4 file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-[0.16em] file:text-foreground'

export function PageFileField({ id, name, label, required }: { id: string; name: string; label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <input id={id} name={name} type="file" accept=".html,.htm,text/html" required={required} className={fileInput} />
    </div>
  )
}

export function UpdatePagesForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(updateClientPages, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <p className="text-sm leading-relaxed text-muted-foreground">
        Upload a new version of either page. Ticks, notes and hours stay as long as the task IDs in the page match.
      </p>
      <PageFileField id={`client-${slug}`} name="clientPlan" label="Client plan (.html)" />
      <PageFileField id={`internal-${slug}`} name="internalPlan" label="Internal playbook (.html)" />
      {state.message ? (
        <p role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Upload
      </button>
    </form>
  )
}
