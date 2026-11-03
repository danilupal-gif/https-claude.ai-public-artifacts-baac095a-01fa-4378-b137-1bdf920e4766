import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { CaseStudyArticle } from '@/components/case-study/case-study-article'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { getPublishedCaseStudy } from '@/lib/case-studies'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const study = await getPublishedCaseStudy((await params).slug)
  if (!study) return { title: 'Case study' }
  return { title: study.headline, description: study.summary, openGraph: { title: study.headline, description: study.summary } }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const study = await getPublishedCaseStudy((await params).slug)
  if (!study) notFound()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-5 pb-24 pt-32 md:px-8 md:pt-40">
        <Link
          href="/case-studies"
          className="inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All case studies
        </Link>
        <CaseStudyArticle study={study} />
        <section className="flex flex-col items-start gap-5 border-t border-border pt-12">
          <h2 className="font-serif text-4xl leading-tight text-balance">How much is your time worth?</h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            A Workflow Review shows where your hours go and which few changes would give the most back.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-3 bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book a Workflow Review
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
