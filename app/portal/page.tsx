import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/portal/auth-shell'
import { SignOutButton } from '@/components/portal/sign-out-button'
import { auth } from '@/lib/auth'
import { getClient } from '@/lib/clients'
import { getViewer } from '@/lib/portal'

export default async function PortalIndex() {
  const viewer = await getViewer()
  if (viewer?.role === 'admin') redirect('/portal/admin')
  if (viewer && (await getClient(viewer.clientSlug))) redirect(`/portal/${viewer.clientSlug}`)

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/portal/sign-in')

  return (
    <AuthShell
      title="No portal yet"
      intro="You’re signed in, but there’s no client portal linked to this account. Please contact Danielle."
    >
      <SignOutButton />
    </AuthShell>
  )
}
