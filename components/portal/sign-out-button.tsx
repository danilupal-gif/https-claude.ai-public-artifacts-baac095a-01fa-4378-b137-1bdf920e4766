'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await authClient.signOut()
        router.push('/portal/sign-in')
        router.refresh()
      }}
      className={
        compact
          ? 'inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60'
          : 'inline-flex w-full items-center justify-center gap-2 border border-input px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground hover:border-primary disabled:opacity-60'
      }
    >
      <LogOut className="size-4" aria-hidden="true" />
      Sign out
    </button>
  )
}
