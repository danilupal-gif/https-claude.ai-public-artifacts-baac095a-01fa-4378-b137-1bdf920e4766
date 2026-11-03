'use client'

import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { activateAccount, type ActionState } from '@/app/portal/actions'
import { authClient } from '@/lib/auth-client'
import { fieldInput, fieldLabel, primaryButton } from './auth-shell'

const initialState: ActionState = { ok: false }

export function ActivateForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const router = useRouter()
  const submittedPassword = useRef('')
  const [state, formAction, pending] = useActionState(activateAccount, initialState)
  const [signInError, setSignInError] = useState<string | null>(null)

  useEffect(() => {
    if (!state.ok || !state.email) return
    const password = submittedPassword.current
    submittedPassword.current = ''
    authClient.signIn.email({ email: state.email, password }).then(({ error }) => {
      if (error) {
        setSignInError('Your account is ready. Please sign in.')
        router.push(`/portal/sign-in?email=${encodeURIComponent(state.email ?? '')}`)
        return
      }
      router.push('/portal')
      router.refresh()
    })
  }, [state, router])

  const busy = pending || (state.ok && !signInError)

  return (
    <form
      method="post"
      onSubmit={(event) => {
        // Submitting manually keeps typed values when the code doesn't match.
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        submittedPassword.current = String(data.get('password') ?? '')
        startTransition(() => formAction(data))
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={fieldLabel}>
          Your name
        </label>
        <input id="name" name="name" autoComplete="name" required className={fieldInput} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={fieldLabel}>
          Email Danielle invited
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={defaultEmail} className={fieldInput} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="code" className={fieldLabel}>
          Access code
        </label>
        <input
          id="code"
          name="code"
          required
          autoComplete="one-time-code"
          placeholder="XXXX-XXXX-XXXX"
          className={`${fieldInput} font-mono uppercase tracking-widest`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={fieldLabel}>
          Choose a password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          aria-describedby="password-hint"
          className={fieldInput}
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          At least 10 characters.
        </p>
      </div>
      {state.message || signInError ? (
        <p role="alert" className="text-sm text-destructive">
          {signInError ?? state.message}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className={primaryButton}>
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {busy ? 'Setting up' : 'Activate my portal'}
      </button>
    </form>
  )
}
