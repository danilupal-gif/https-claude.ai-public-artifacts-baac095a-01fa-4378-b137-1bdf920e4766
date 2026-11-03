'use client'

import { Download } from 'lucide-react'
import { planFrameWindow } from '@/components/portal/plan-frame'

/** Opens the browser's print dialog for the plan, where "Save as PDF" produces the download. */
export function DownloadPdfButton() {
  function handleClick() {
    const win = planFrameWindow()
    if (!win) return
    const closed = [...win.document.querySelectorAll('details:not([open])')]
    closed.forEach((d) => d.setAttribute('open', ''))
    win.addEventListener('afterprint', () => closed.forEach((d) => d.removeAttribute('open')), { once: true })
    win.focus()
    win.print()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
    >
      <Download className="size-4" aria-hidden="true" />
      <span className="hidden lg:inline">Download PDF</span>
      <span className="sr-only lg:hidden">Download PDF</span>
    </button>
  )
}
