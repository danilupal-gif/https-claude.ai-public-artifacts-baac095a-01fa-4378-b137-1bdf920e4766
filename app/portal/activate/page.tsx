import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ActivateForm } from '@/components/portal/activate-form'
import { AuthShell } from '@/components/portal/auth-shell'
import { auth } from '@/lib/auth'

export default async function ActivatePage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/portal')
  const { email } = await searchParams
  const defaultEmail = typeof email === 'string' && email.length <= 254 ? email : ''

  return (
    <AuthShell
      title="Activate your portal."
      intro="Use the email and one-time access code Danielle sent you, then choose a password."
      footer={
        <>
          Already activated?{' '}
          <Link href="/portal/sign-in" className="text-primary underline underline-offset-4">
            Sign in
          </Link>
          .
        </>
      }
    >
      <ActivateForm defaultEmail={defaultEmail} />
    </AuthShell>
  )
}
