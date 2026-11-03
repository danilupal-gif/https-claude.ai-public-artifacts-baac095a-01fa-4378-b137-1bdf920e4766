'use client'

import { useEffect, useRef, useTransition } from 'react'
import { dismissWelcome } from '@/app/portal/actions'
import { primaryButton } from '@/components/portal/auth-shell'

export function WelcomeDialog({ slug, note, from }: { slug: string; note: string; from: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  function close() {
    ref.current?.close()
    startTransition(() => dismissWelcome(slug))
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="welcome-title"
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      className="m-auto w-[min(92vw,34rem)] border border-border bg-card p-0 text-foreground backdrop:bg-background/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-primary">A note from {from}</p>
          <h2 id="welcome-title" className="font-serif text-4xl leading-tight text-balance">
            Welcome to your plan
          </h2>
        </div>
        <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{note}</p>
        <button type="button" onClick={close} disabled={pending} className={primaryButton}>
          Open my plan
        </button>
      </div>
    </dialog>
  )
}
