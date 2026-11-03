import { Approach } from '@/components/site/approach'
import { Contact } from '@/components/site/contact'
import { Fit } from '@/components/site/fit'
import { Hero } from '@/components/site/hero'
import { PortalCallout } from '@/components/site/portal-callout'
import { Process } from '@/components/site/process'
import { Services } from '@/components/site/services'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { TimeValue } from '@/components/site/time-value'
import { WhatToExpect } from '@/components/site/what-to-expect'
import { serviceOptions } from '@/lib/site'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams
  const defaultService = (serviceOptions as readonly string[]).includes(service ?? '') ? service : undefined

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <TimeValue />
        <WhatToExpect />
        <Approach />
        <Services />
        <Process />
        <Fit />
        <PortalCallout />
        <Contact defaultService={defaultService} />
      </main>
      <SiteFooter />
    </>
  )
}
