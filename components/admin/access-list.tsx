'use client'

import { useTransition } from 'react'
import { revokeAccess } from '@/app/portal/actions'

type Row = { email: string; role: string; client: string; activated: boolean }

export function AccessList({ rows, currentEmail }: { rows: Row[]; currentEmail: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <caption className="sr-only">People with portal access</caption>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <th scope="col" className="py-3 pr-4 font-medium">Email</th>
            <th scope="col" className="py-3 pr-4 font-medium">Dashboard</th>
            <th scope="col" className="py-3 pr-4 font-medium">Status</th>
            <th scope="col" className="py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.email} className="border-b border-border">
              <td className="py-4 pr-4">{r.email}</td>
              <td className="py-4 pr-4 text-muted-foreground">{r.client}</td>
              <td className="py-4 pr-4">
                <span className={r.activated ? 'text-primary' : 'text-muted-foreground'}>
                  {r.activated ? 'Active' : 'Invited'}
                </span>
              </td>
              <td className="py-4 text-right">
                {r.email.toLowerCase() !== currentEmail.toLowerCase() ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`Remove portal access for ${r.email}?`)) {
                        startTransition(async () => {
                          await revokeAccess(r.email)
                        })
                      }
                    }}
                    className="text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-destructive disabled:opacity-60"
                  >
                    Remove
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
