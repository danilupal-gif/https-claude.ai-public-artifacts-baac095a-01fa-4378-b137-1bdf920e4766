'use client'

import { useActionState, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { ActionState } from '@/app/portal/actions'
import { decideCaseStudyAction } from '@/app/portal/case-study-actions'
import { fieldInput, fieldLabel, primaryButton } from '@/components/portal/auth-shell'

const initialState: ActionState = { ok: false }
const options = [
  { value: 'approved', label: 'Yes, you can share it', hint: 'It goes on the website exactly as shown.' },
  { value: 'changes', label: 'Yes, with changes', hint: 'Tell us what to change and you’ll review it again.' },
  { value: 'declined', label: 'No, please don’t share it', hint: 'It stays private. No hard feelings.' },
] as const

export function CaseStudyDecision({ slug, consultant }: { slug: string; consultant: string }) {
  const [state, formAction, pending] = useActionState(decideCaseStudyAction, initialState)
  const [choice, setChoice] = useState<string>('approved')

  if (state.ok) {
    return (
      <p role="status" className="border border-primary/50 bg-surface px-5 py-4 leading-relaxed">
        {state.message}
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 border border-border bg-card p-6 md:p-8">
      <input type="hidden" name="slug" value={slug} />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-serif text-2xl">Can {consultant} share this?</legend>
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors ${choice === o.value ? 'border-primary bg-surface' : 'border-border'}`}
          >
            <input
              type="radio"
              name="decision"
              value={o.value}
              checked={choice === o.value}
              onChange={() => setChoice(o.value)}
              className="mt-1 size-4 accent-primary"
            />
            <span className="flex flex-col">
              <span>{o.label}</span>
              <span className="text-sm text-muted-foreground">{o.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-2">
        <label htmlFor="cs-note" className={fieldLabel}>
          {choice === 'changes' ? 'What should we change?' : 'Anything to add? (optional)'}
        </label>
        <textarea id="cs-note" name="note" rows={4} maxLength={1500} required={choice === 'changes'} className={`${fieldInput} leading-relaxed`} />
      </div>
      {state.message ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Send my answer
      </button>
    </form>
  )
}
