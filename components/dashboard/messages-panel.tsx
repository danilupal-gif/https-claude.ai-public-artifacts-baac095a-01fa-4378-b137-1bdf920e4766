'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Loader2, Send } from 'lucide-react'
import { postMessage, type ActionState } from '@/app/portal/actions'

type Message = { id: number; authorName: string; authorRole: string; body: string; createdAt: string }

const initialState: ActionState = { ok: false }

const timeFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export function MessagesPanel({
  slug,
  viewerRole,
  messages,
}: {
  slug: string
  viewerRole: 'client' | 'admin'
  messages: Message[]
}) {
  const [state, formAction, pending] = useActionState(postMessage, initialState)
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  return (
    <section
      aria-labelledby="messages-title"
      className="no-print flex flex-col gap-6 rounded-lg bg-card p-6 text-card-foreground"
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Direct line</p>
        <h3 id="messages-title" className="font-serif text-2xl font-medium text-primary">
          Questions & changes
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {viewerRole === 'admin'
            ? 'Replies appear here for Keon.'
            : 'Send me anything you’d like changed or asked. I reply within one business day.'}
        </p>
      </div>
      {messages.length > 0 ? (
        <ol ref={listRef} className="flex max-h-96 flex-col gap-4 overflow-y-auto" aria-label="Messages">
          {messages.map((m) => {
            const fromFirm = m.authorRole === 'admin'
            return (
              <li
                key={m.id}
                className={`flex flex-col gap-1 border-l-2 py-1 pl-4 ${fromFirm ? 'border-primary' : 'border-input'}`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <span className={fromFirm ? 'text-primary' : 'text-foreground'}>{m.authorName}</span> ·{' '}
                  <time dateTime={m.createdAt}>{timeFormat.format(new Date(m.createdAt))}</time>
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      )}
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="slug" value={slug} />
        <label htmlFor="message-body" className="sr-only">
          Write a message
        </label>
        <textarea
          id="message-body"
          name="body"
          rows={3}
          required
          maxLength={2000}
          placeholder="Write a message..."
          className="w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
        />
        {state.message ? (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          Send
        </button>
      </form>
    </section>
  )
}
