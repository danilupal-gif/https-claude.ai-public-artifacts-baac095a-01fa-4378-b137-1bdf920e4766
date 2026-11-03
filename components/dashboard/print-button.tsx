'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="hidden items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
    >
      <Printer className="size-4" aria-hidden="true" />
      Save PDF
    </button>
  )
}
