'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { saveWelcomeNote, type ActionState } from '@/app/portal/actions'
import { fieldInput, fieldLabel, primaryButton } from '@/components/portal/auth-shell'

const initialState: ActionState = { ok: false }

export function WelcomeNoteForm({ slug, contact, note }: { slug: string; contact: string; note: string }) {
  const [state, formAction, pending] = useActionState(saveWelcomeNote, initialState)
  const id = `welcome-${slug}`

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className={fieldLabel}>
          Shown to {contact} when they next open their plan
        </label>
        <textarea
          id={id}
          name="note"
          rows={5}
          maxLength={1500}
          defaultValue={note}
          placeholder={`Hi ${contact}, here's your plan. Start with "What we discussed" and let me know if anything's off.`}
          className={`${fieldInput} resize-y leading-relaxed`}
        />
      </div>
      {state.message ? (
        <p role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Save note
      </button>
    </form>
  )
}
