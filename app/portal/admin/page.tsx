import Link from 'next/link'
import { asc, desc } from 'drizzle-orm'
import { ArrowRight } from 'lucide-react'
import { AccessList } from '@/components/admin/access-list'
import { GrantAccessForm } from '@/components/admin/grant-access-form'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PanelHeading } from '@/components/dashboard/panel-heading'
import { db } from '@/lib/db'
import { portalAccess, projectInquiries } from '@/lib/db/schema'
import { clients, requireAdmin } from '@/lib/portal'

export const metadata = { title: 'Admin' }

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default async function AdminPage() {
  const viewer = await requireAdmin()

  const [access, inquiries] = await Promise.all([
    db
      .select({
        email: portalAccess.email,
        clientSlug: portalAccess.clientSlug,
        role: portalAccess.role,
        activatedAt: portalAccess.activatedAt,
      })
      .from(portalAccess)
      .orderBy(asc(portalAccess.createdAt)),
    db
      .select({
        id: projectInquiries.id,
        name: projectInquiries.name,
        businessName: projectInquiries.businessName,
        email: projectInquiries.email,
        services: projectInquiries.services,
        budget: projectInquiries.budget,
        description: projectInquiries.description,
        createdAt: projectInquiries.createdAt,
      })
      .from(projectInquiries)
      .orderBy(desc(projectInquiries.createdAt))
      .limit(20),
  ])

  const clientList = Object.values(clients)

  return (
    <div className="min-h-svh">
      <DashboardHeader viewerName={viewer.name} isAdmin />
      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-5 pb-24 pt-10 md:px-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-primary">Admin</p>
          <h1 className="font-serif text-5xl">Good to see you, {viewer.name.split(' ')[0]}.</h1>
        </div>

        <section aria-labelledby="clients-title" className="flex flex-col gap-6">
          <PanelHeading id="clients-title" eyebrow="Active" title="Client dashboards" />
          <ul className="grid gap-4 md:grid-cols-2">
            {clientList.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/portal/${c.slug}`}
                  className="group flex items-center justify-between gap-4 border border-border bg-card p-6 transition-colors hover:bg-surface"
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-serif text-2xl">{c.name}</span>
                    <span className="text-sm text-muted-foreground">Contact: {c.contact}</span>
                  </span>
                  <ArrowRight className="size-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="access-title" className="grid gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <PanelHeading
              id="access-title"
              eyebrow="Portal access"
              title="Invite a client"
              intro="Creates a one-time access code. Send it to your client with the link to /portal/activate. The code is shown once."
            />
            <GrantAccessForm clients={clientList.map((c) => ({ slug: c.slug, name: c.name }))} />
          </div>
          <div className="lg:col-span-7">
            <AccessList
              currentEmail={viewer.email}
              rows={access.map((a) => ({
                email: a.email,
                role: a.role,
                client: a.role === 'admin' ? 'All clients' : (clients[a.clientSlug as keyof typeof clients]?.name ?? a.clientSlug),
                activated: Boolean(a.activatedAt),
              }))}
            />
          </div>
        </section>

        <section aria-labelledby="inquiries-title" className="flex flex-col gap-6">
          <PanelHeading
            id="inquiries-title"
            eyebrow="Website"
            title="Recent inquiries"
            intro="From the contact form on your website, newest first."
          />
          {inquiries.length === 0 ? (
            <p className="text-muted-foreground">No inquiries yet.</p>
          ) : (
            <ul className="flex flex-col">
              {inquiries.map((q) => (
                <li key={q.id} className="grid gap-2 border-t border-border py-5 md:grid-cols-12 md:gap-6">
                  <div className="flex flex-col md:col-span-4">
                    <span className="font-medium">{q.name}</span>
                    <span className="text-sm text-muted-foreground">{q.businessName}</span>
                    <a href={`mailto:${q.email}`} className="text-sm text-primary underline-offset-4 hover:underline">
                      {q.email}
                    </a>
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground md:col-span-6">
                    {q.description}
                  </p>
                  <div className="flex flex-col text-sm md:col-span-2 md:text-right">
                    <span>{dateFormat.format(q.createdAt)}</span>
                    <span className="text-muted-foreground">{q.budget}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
