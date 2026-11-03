'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { saveClientSettings, type ActionState } from '@/app/portal/actions'
import { fieldInput, fieldLabel, primaryButton } from '@/components/portal/auth-shell'

const initialState: ActionState = { ok: false }

export function ClientSettingsForm({
  slug,
  contact,
  bookingUrl,
  weeklyEmail,
}: {
  slug: string
  contact: string
  bookingUrl: string | null
  weeklyEmail: boolean
}) {
  const [state, formAction, pending] = useActionState(saveClientSettings, initialState)
  const id = `booking-${slug}`

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className={fieldLabel}>
          Check-in booking link
        </label>
        <input
          id={id}
          name="bookingUrl"
          type="url"
          inputMode="url"
          defaultValue={bookingUrl ?? ''}
          placeholder="https://calendly.com/your-name/check-in"
          className={fieldInput}
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your Calendly, Cal.com, Google or HubSpot meetings link. {contact} gets a &quot;Book a check-in&quot; button in the plan.
        </p>
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" name="weeklyEmail" defaultChecked={weeklyEmail} className="mt-1 size-4 accent-primary" />
        <span>
          Monday progress email to {contact}
          <span className="block text-muted-foreground">What&apos;s done, what&apos;s due this week and anything overdue. Sent at 8 AM Eastern.</span>
        </span>
      </label>
      {state.message ? (
        <p role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Save settings
      </button>
    </form>
  )
}
