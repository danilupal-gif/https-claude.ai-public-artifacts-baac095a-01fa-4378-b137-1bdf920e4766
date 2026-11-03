'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const PLAN_FRAME_ID = 'plan-frame'

/** The plan page, plus a refresh of the portal chrome (reminders) whenever the plan saves. */
export function PlanFrame({ src, title }: { src: string; title: string }) {
  const router = useRouter()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== 'plan:saved') return
      clearTimeout(timer)
      timer = setTimeout(() => router.refresh(), 600)
    }
    window.addEventListener('message', onMessage)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
    }
  }, [router])

  return <iframe id={PLAN_FRAME_ID} src={src} title={title} className="w-full flex-1 border-0" />
}

export function planFrameWindow() {
  const frame = document.getElementById(PLAN_FRAME_ID) as HTMLIFrameElement | null
  return frame?.contentWindow ?? null
}
