'use client'

import { useActionState, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient, type ActionState } from '@/app/portal/actions'
import { PageFileField } from '@/components/admin/update-pages-form'
import { fieldInput, fieldLabel, primaryButton } from '@/components/portal/auth-shell'

const initialState: ActionState = { ok: false }

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function AddClientForm() {
  const [state, formAction, pending] = useActionState(createClient, initialState)
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  return (
    <form action={formAction} className="flex flex-col gap-5 border border-border bg-card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="new-client-name" className={fieldLabel}>
            Business name
          </label>
          <input
            id="new-client-name"
            name="name"
            required
            maxLength={80}
            onChange={(e) => {
              if (!slugEdited) setSlug(toSlug(e.target.value))
            }}
            className={fieldInput}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="new-client-contact" className={fieldLabel}>
            Client&apos;s first name
          </label>
          <input id="new-client-contact" name="contact" required maxLength={40} className={fieldInput} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="new-client-slug" className={fieldLabel}>
          Portal address
        </label>
        <div className="flex items-center border border-input bg-background focus-within:border-primary">
          <span className="pl-3 text-sm text-muted-foreground">/portal/</span>
          <input
            id="new-client-slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugEdited(true)
              setSlug(toSlug(e.target.value))
            }}
            className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none"
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <PageFileField id="new-client-plan" name="clientPlan" label="Client plan (.html)" required />
        <PageFileField id="new-client-internal" name="internalPlan" label="Internal playbook (.html)" required />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Use the same page format as the Deep Reset plans: checklist items written as{' '}
        <code className="text-foreground">{"['id','k','Task']"}</code> and due dates in{' '}
        <code className="text-foreground">{'var DUE={...}'}</code>. Pages are stored in the database, never in the repository.
      </p>
      {state.message ? (
        <p role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-primary' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Add client
      </button>
    </form>
  )
}
