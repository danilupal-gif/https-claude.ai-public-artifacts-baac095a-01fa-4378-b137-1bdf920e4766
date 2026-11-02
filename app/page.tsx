import { Hero } from '@/components/hero'
import { Journey } from '@/components/journey'
import { Measures } from '@/components/measures'
import { Needs } from '@/components/needs'
import { Priorities } from '@/components/priorities'
import { Review } from '@/components/review'
import { SiteHeader } from '@/components/site-header'
import { Timeline } from '@/components/timeline'
import { plan } from '@/lib/plan'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Priorities />
        <Timeline />
        <Journey />
        <Measures />
        <Needs />
        <Review />
      </main>
      <footer className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-8 text-sm text-muted-foreground md:flex-row md:justify-between">
        <span>
          Prepared by {plan.firm} for {plan.business}
        </span>
        <span>Draft · {plan.preparedOn} · Confidential</span>
      </footer>
    </>
  )
}
