import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CaseStudyArticle } from '@/components/case-study/case-study-article'
import { CaseStudyDecision } from '@/components/portal/case-study-decision'
import { Wordmark } from '@/components/site/wordmark'
import { getCaseStudy, statusLabel } from '@/lib/case-studies'
import { consultantName } from '@/lib/plan-requests'
import { requireClientViewer } from '@/lib/portal'

export const metadata: Metadata = { title: 'Your story', robots: { index: false } }

export default async function CaseStudyReview({ params }: { params: Promise<{ client: string }> }) {
  const { client: slug } = await params
  const { viewer, client } = await requireClientViewer(slug)
  const [study, consultant] = await Promise.all([getCaseStudy(slug), consultantName()])
  const isClient = viewer.role === 'client'

  return (
    <div className="min-h-svh bg-background">
      <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4 md:px-6">
        <Link href="/" aria-label="ÉLEVÉ Business Partners website" className="shrink-0">
          <Wordmark subtitle="Client Portal" />
        </Link>
        <Link
          href={`/portal/${slug}${isClient ? '' : '?view=client'}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to plan
        </Link>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-12 md:px-8 md:py-16">
        {!study || study.status === 'draft' ? (
          <p className="text-muted-foreground">There&apos;s no case study to review yet.</p>
        ) : (
          <>
            <div className="flex flex-col gap-3 border border-primary/40 bg-surface px-5 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                Your story · {study.status === 'awaiting' && isClient ? 'Waiting for your answer' : statusLabel[study.status]}
              </p>
              <p className="leading-relaxed text-pretty">
                {study.status === 'awaiting'
                  ? `${consultant} wrote this about your pilot with ${client.name}. This is exactly how it would appear on the website. Nothing is published without your yes.`
                  : study.status === 'published'
                    ? 'This is live on the website. Thank you for letting us share it.'
                    : `You answered on ${new Date(study.decidedAt ?? study.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Thank you.`}
              </p>
            </div>
            <CaseStudyArticle study={study} />
            {study.status === 'awaiting' && isClient ? <CaseStudyDecision slug={slug} consultant={consultant} /> : null}
            {study.status === 'awaiting' && !isClient ? (
              <p className="text-sm text-muted-foreground">This is the preview {client.contact} sees. Only they can approve it.</p>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}
