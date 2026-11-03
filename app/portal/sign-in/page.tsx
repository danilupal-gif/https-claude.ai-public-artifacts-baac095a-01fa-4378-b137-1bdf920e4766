import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/portal/auth-shell'
import { SignInForm } from '@/components/portal/sign-in-form'
import { auth } from '@/lib/auth'

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/portal')
  const { email } = await searchParams

  return (
    <AuthShell
      title="Welcome back."
      intro="Sign in to see your plan, milestones and messages."
      footer={
        <>
          First time here?{' '}
          <Link href="/portal/activate" className="text-primary underline underline-offset-4">
            Activate your portal with your access code
          </Link>
          .
        </>
      }
    >
      <SignInForm defaultEmail={email} />
    </AuthShell>
  )
}
