'use client'

import { startTransition, useActionState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { submitInquiry, type InquiryState } from '@/app/actions/inquiry'
import { budgetOptions, serviceOptions, timingOptions } from '@/lib/site'

const initialState: InquiryState = { ok: false }

const inputClass =
  'w-full border-0 border-b border-input bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-0 aria-[invalid=true]:border-destructive'

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string
  name: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function InquiryForm({ defaultService }: { defaultService?: string }) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState)
  const errors = state.fieldErrors ?? {}

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-5 border border-primary/40 bg-card p-10">
        <span className="flex size-12 items-center justify-center bg-primary text-primary-foreground">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h3 className="font-serif text-3xl">Thank you. Your inquiry is in.</h3>
        <p className="leading-relaxed text-muted-foreground">
          Danielle will reply personally within one business day to set up a short discovery call.
        </p>
      </div>
    )
  }

  const err = (name: string) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // Submitting manually (instead of form action) keeps typed values when validation fails.
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        startTransition(() => formAction(data))
      }}
      className="flex flex-col gap-8 border border-border bg-card p-6 md:p-10">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_url">Leave this empty</label>
        <input id="company_url" name="company_url" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Field label="Your name" name="name" error={errors.name}>
          <input id="name" name="name" autoComplete="name" required className={inputClass} {...err('name')} />
        </Field>
        <Field label="Business name" name="businessName" error={errors.businessName}>
          <input
            id="businessName"
            name="businessName"
            autoComplete="organization"
            required
            className={inputClass}
            {...err('businessName')}
          />
        </Field>
        <Field label="Email" name="email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} {...err('email')} />
        </Field>
        <Field label="Phone (optional)" name="phone">
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="Industry" name="industry" error={errors.industry}>
          <input
            id="industry"
            name="industry"
            placeholder="e.g. Wellness programs"
            required
            className={inputClass}
            {...err('industry')}
          />
        </Field>
        <Field label="Website (optional)" name="website">
          <input id="website" name="website" type="url" placeholder="https://" className={inputClass} />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-3" aria-describedby={errors.services ? 'services-error' : undefined}>
        <legend className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          What would you like help with?
        </legend>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((option) => (
            <label key={option} className="cursor-pointer">
              <input
                type="checkbox"
                name="services"
                value={option}
                defaultChecked={option === defaultService}
                className="peer sr-only"
              />
              <span className="inline-flex border border-input px-4 py-2 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                {option}
              </span>
            </label>
          ))}
        </div>
        {errors.services ? (
          <p id="services-error" className="text-sm text-destructive">
            {errors.services}
          </p>
        ) : null}
      </fieldset>

      <div className="grid gap-8 md:grid-cols-2">
        <Field label="Budget range" name="budget" error={errors.budget}>
          <select id="budget" name="budget" defaultValue="" className={`${inputClass} bg-card`} {...err('budget')}>
            <option value="">Choose one</option>
            {budgetOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label="When would you like to start?" name="timing">
          <select id="timing" name="timing" defaultValue="" className={`${inputClass} bg-card`}>
            <option value="">Choose one</option>
            {timingOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Where do things feel stuck?" name="description" error={errors.description}>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          placeholder="Follow-up, onboarding, too many tools, not enough hours..."
          className={`${inputClass} resize-y`}
          {...err('description')}
        />
      </Field>

      {state.message ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-3 self-start bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Sending' : 'Send inquiry'}
        {pending ? null : <ArrowRight className="size-4" aria-hidden="true" />}
      </button>
    </form>
  )
}
