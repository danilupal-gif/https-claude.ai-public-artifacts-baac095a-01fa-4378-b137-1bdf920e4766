'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import type { ActionState } from '@/app/portal/actions'
import { saveCaseStudyAction } from '@/app/portal/case-study-actions'
import { fieldInput, fieldLabel, primaryButton } from '@/components/portal/auth-shell'
import type { CaseStudyContent, CaseStudyStatus } from '@/lib/case-studies'

const initialState: ActionState = { ok: false }
const secondary =
  'inline-flex items-center justify-center gap-2 border border-border px-4 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50'

function Field({
  id,
  name,
  label,
  defaultValue,
  rows,
  hint,
  maxLength,
}: {
  id: string
  name: string
  label: string
  defaultValue: string
  rows?: number
  hint?: string
  maxLength: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      {rows ? (
        <textarea id={id} name={name} rows={rows} maxLength={maxLength} defaultValue={defaultValue} className={`${fieldInput} leading-relaxed`} />
      ) : (
        <input id={id} name={name} maxLength={maxLength} defaultValue={defaultValue} className={fieldInput} />
      )}
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function CaseStudyForm({
  slug,
  contact,
  study,
  status,
  clientNote,
}: {
  slug: string
  contact: string
  study: CaseStudyContent
  status: CaseStudyStatus | null
  clientNote?: string
}) {
  const [state, formAction, pending] = useActionState(saveCaseStudyAction, initialState)
  const id = (name: string) => `cs-${slug}-${name}`
  const rows = [...study.results, ...Array.from({ length: Math.max(0, 6 - study.results.length) }, () => ({ label: '', before: '', after: '' }))]
  const canPublish = status === 'approved'

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="slug" value={slug} />
      {clientNote ? (
        <p className="border-l-2 border-primary bg-surface px-4 py-3 text-sm leading-relaxed">
          <span className="block text-xs uppercase tracking-[0.2em] text-primary">{contact}&apos;s note</span>
          {clientNote}
        </p>
      ) : null}
      <Field id={id('headline')} name="headline" label="Headline" defaultValue={study.headline} maxLength={140} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={id('displayName')}
          name="displayName"
          label="Business name shown"
          defaultValue={study.displayName}
          maxLength={80}
          hint="Use a description like “A wellness reset brand” if they’d rather stay anonymous."
        />
        <Field id={id('industry')} name="industry" label="Industry" defaultValue={study.industry} maxLength={60} />
      </div>
      <Field id={id('summary')} name="summary" label="One-line summary" defaultValue={study.summary} rows={2} maxLength={280} />
      <Field id={id('challenge')} name="challenge" label="The challenge" defaultValue={study.challenge} rows={4} maxLength={1500} />
      <Field id={id('approach')} name="approach" label="What we did" defaultValue={study.approach} rows={4} maxLength={1500} />
      <Field id={id('outcome')} name="outcome" label="The outcome" defaultValue={study.outcome} rows={3} maxLength={1500} />

      <fieldset className="flex flex-col gap-3">
        <legend className={`${fieldLabel} mb-2`}>Before and after</legend>
        <p className="text-xs leading-relaxed text-muted-foreground">Filled in from the numbers in the plan. Clear a row to leave it out.</p>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_5.5rem_5.5rem] gap-2">
            <input aria-label={`Result ${i + 1} label`} name={`result-label-${i}`} defaultValue={r.label} maxLength={120} placeholder="Measure" className={fieldInput} />
            <input aria-label={`Result ${i + 1} before`} name={`result-before-${i}`} defaultValue={r.before} maxLength={60} placeholder="Before" className={fieldInput} />
            <input aria-label={`Result ${i + 1} after`} name={`result-after-${i}`} defaultValue={r.after} maxLength={60} placeholder="After" className={fieldInput} />
          </div>
        ))}
      </fieldset>

      <Field id={id('quote')} name="quote" label="Client quote (optional)" defaultValue={study.quote} rows={2} maxLength={500} />
      <Field id={id('quoteBy')} name="quoteBy" label="Quote attribution" defaultValue={study.quoteBy} maxLength={80} />

      {state.message ? (
        <p role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <button type="submit" name="intent" value="send" disabled={pending} className={primaryButton}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {status === 'awaiting' ? `Resend to ${contact} for approval` : `Save and send to ${contact} for approval`}
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="submit" name="intent" value="save" disabled={pending} className={secondary}>
            Save draft
          </button>
          {status === 'published' ? (
            <button type="submit" name="intent" value="unpublish" disabled={pending} className={secondary}>
              Take off website
            </button>
          ) : (
            <button type="submit" name="intent" value="publish" disabled={pending || !canPublish} className={secondary}>
              Publish to website
            </button>
          )}
        </div>
        {!canPublish && status !== 'published' ? (
          <p className="text-xs leading-relaxed text-muted-foreground">Publishing unlocks once {contact} approves this exact version.</p>
        ) : null}
      </div>
    </form>
  )
}
