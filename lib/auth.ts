import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { and, gt, isNull, sql } from 'drizzle-orm'
import { db, pool } from '@/lib/db'
import { portalAccess } from '@/lib/db/schema'

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 10,
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        // Accounts can only be created for invited emails whose invite code was
        // checked by the activation action in the last 10 minutes. This blocks
        // direct calls to the public sign-up endpoint.
        before: async (newUser) => {
          const [invite] = await db
            .select({ email: portalAccess.email })
            .from(portalAccess)
            .where(
              and(
                sql`lower(${portalAccess.email}) = lower(${newUser.email})`,
                isNull(portalAccess.activatedAt),
                gt(portalAccess.codeVerifiedAt, sql`now() - interval '10 minutes'`),
              ),
            )
            .limit(1)
          if (!invite) {
            throw new APIError('FORBIDDEN', { message: 'An invitation is required to create an account.' })
          }
          return { data: newUser }
        },
      },
    },
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
