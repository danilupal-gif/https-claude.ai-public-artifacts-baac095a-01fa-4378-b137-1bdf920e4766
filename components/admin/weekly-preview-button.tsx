'use client'

import { useActionState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { sendWeeklyPreview, type ActionState } from '@/app/portal/actions'

const initialState: ActionState = { ok: false }

export function WeeklyPreviewButton({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(sendWeeklyPreview, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 border border-border px-4 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Mail className="size-4" aria-hidden="true" />}
        Email me this week&apos;s preview
      </button>
      {state.message ? (
        <p role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
