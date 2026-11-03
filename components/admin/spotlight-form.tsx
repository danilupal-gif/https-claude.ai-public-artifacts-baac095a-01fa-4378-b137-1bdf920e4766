'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import type { ActionState } from '@/app/portal/actions'
import { saveSpotlight } from '@/app/portal/spotlight-actions'
import { fieldInput, fieldLabel, primaryButton } from '@/components/portal/auth-shell'

type Pair = { label: string; value: string }

const initialState: ActionState = { ok: false }

const suggestedBaseline = [
  'Website visits per week',
  'Digital menu views per week',
  'Google Business Profile views per month',
  'Calls and direction requests from Google per month',
  'Instagram followers',
  'Hours per week building the staff schedule',
  'Minutes from order to kitchen',
  'Orders handled per hour on a busy night',
]

function withRows(rows: Pair[], count: number, labels: string[] = []) {
  const out = rows.slice(0, count)
  const used = new Set(out.map((r) => r.label))
  const remaining = labels.filter((l) => !used.has(l))
  while (out.length < count) out.push({ label: remaining.shift() ?? '', value: '' })
  return out
}

function PairRows({ prefix, rows, labelHint, valueHint }: { prefix: string; rows: Pair[]; labelHint: string; valueHint: string }) {
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <li key={i} className="grid gap-2 border-b border-border pb-3 last:border-0 sm:grid-cols-[1fr_7rem] sm:gap-3 sm:border-0 sm:pb-0">
          <label className="sr-only" htmlFor={`${prefix}-label-${i}`}>
            {`${labelHint} ${i + 1}`}
          </label>
          <input
            id={`${prefix}-label-${i}`}
            name={`${prefix}-label-${i}`}
            defaultValue={row.label}
            maxLength={80}
            placeholder={labelHint}
            className={fieldInput}
          />
          <label className="sr-only" htmlFor={`${prefix}-value-${i}`}>
            {`${valueHint} ${i + 1}`}
          </label>
          <input
            id={`${prefix}-value-${i}`}
            name={`${prefix}-value-${i}`}
            defaultValue={row.value}
            maxLength={40}
            placeholder={valueHint}
            className={fieldInput}
          />
        </li>
      ))}
    </ul>
  )
}

export function SpotlightForm({
  quote,
  quoteBy,
  metrics,
  baseline,
  beforeMenuSrc,
}: {
  quote: string
  quoteBy: string
  metrics: Pair[]
  baseline: Pair[]
  beforeMenuSrc: string | null
}) {
  const [state, formAction, pending] = useActionState(saveSpotlight, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-8 border border-border bg-card p-5 md:p-6">
      <fieldset className="flex flex-col gap-3">
        <legend className={`${fieldLabel} mb-1`}>Starting numbers · private, only you see these</legend>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Record these before the grand opening. They become the &ldquo;before&rdquo; in the full case study. Leave a value
          blank to skip it.
        </p>
        <PairRows prefix="baseline" rows={withRows(baseline, 8, suggestedBaseline)} labelHint="What you measured" valueHint="Number" />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${fieldLabel} mb-1`}>Early numbers · shown on the Results page</legend>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Up to four, e.g. &ldquo;Menu views in the first two weeks&rdquo; and &ldquo;1,200&rdquo;. Only filled rows appear.
        </p>
        <PairRows prefix="metric" rows={withRows(metrics, 4)} labelHint="What it measures" valueHint="Number" />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${fieldLabel} mb-1`}>Quote from Devin · shown on the Results page</legend>
        <label htmlFor="spotlight-quote" className="sr-only">
          Quote
        </label>
        <textarea
          id="spotlight-quote"
          name="quote"
          rows={4}
          maxLength={600}
          defaultValue={quote}
          placeholder="One or two sentences in his own words."
          className={`${fieldInput} resize-y leading-relaxed`}
        />
        <label htmlFor="spotlight-quote-by" className="text-sm text-muted-foreground">
          Who it&apos;s from
        </label>
        <input
          id="spotlight-quote-by"
          name="quoteBy"
          maxLength={80}
          defaultValue={quoteBy || 'Devin Mooring, owner, Vibes Lounge'}
          className={fieldInput}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${fieldLabel} mb-1`}>Old menu photo · shown as before and after</legend>
        {beforeMenuSrc ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- served by our own route, already sized */}
            <img src={beforeMenuSrc} alt="Current old menu photo" className="size-20 border border-border object-cover" />
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" name="removeBeforeMenu" className="size-5 accent-primary" />
              Remove this photo
            </label>
          </div>
        ) : null}
        <label htmlFor="spotlight-before-menu" className="text-sm text-muted-foreground">
          {beforeMenuSrc ? 'Replace with a new photo' : 'PNG, JPG or WebP, up to 4 MB'}
        </label>
        <input
          id="spotlight-before-menu"
          name="beforeMenu"
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          className="text-base file:mr-4 file:min-h-11 file:border file:border-border file:bg-background file:px-4 file:text-sm file:text-foreground"
        />
      </fieldset>

      {state.message ? (
        <p role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-primary' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Save spotlight
      </button>
    </form>
  )
}
