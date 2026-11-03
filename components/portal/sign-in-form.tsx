'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { fieldInput, fieldLabel, primaryButton } from './auth-shell'

export function SignInForm({ defaultEmail }: { defaultEmail?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    const { error } = await authClient.signIn.email({
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    })
    if (error) {
      setError('That email and password don’t match. Please try again.')
      setPending(false)
      return
    }
    router.push('/portal')
    router.refresh()
  }

  return (
    <form method="post" onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={fieldLabel}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
          className={fieldInput}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={fieldLabel}>
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={fieldInput} />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? 'Signing in' : 'Sign in'}
      </button>
    </form>
  )
}
