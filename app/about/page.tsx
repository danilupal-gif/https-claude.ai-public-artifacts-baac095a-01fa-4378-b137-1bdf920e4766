import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'

export const metadata: Metadata = {
  title: 'About Danielle',
  description:
    'ÉLEVÉ was founded by Danielle Palmer to help business owners simplify their operations, scale with intention and reclaim their time.',
}

const story = [
  'ÉLEVÉ was founded by Danielle Palmer with a clear purpose: to help business owners simplify their operations, scale with intention, and reclaim their most valuable asset: time.',
  'With over 12 years as a tech healthcare workforce executive, Danielle partnered with hospital leaders to solve complex staffing challenges, streamline workflows, and build solutions that made daily operations more manageable. Earning their trust meant listening closely, understanding the challenges behind the numbers, and turning strategy into practical results.',
  'That experience shaped her approach and brought ÉLEVÉ Business Partners to life. Danielle enjoys finding what’s slowing a business down and creating a clearer path forward. Through business consulting, digital solutions, and thoughtful automation, she helps owners reduce manual work, improve the customer experience, and build systems that support growth.',
]

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-svh">
        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-28 md:grid-cols-12 md:gap-x-16 md:gap-y-10 md:px-8 md:pb-28 md:pt-40">
            <header className="flex flex-col gap-6 md:col-span-7">
              <p className="rise flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
                <span className="h-px w-12 bg-primary" aria-hidden="true" />
                About Danielle
              </p>
              <h1
                className="rise font-serif text-5xl leading-[1.05] text-balance md:text-7xl"
                style={{ animationDelay: '120ms' }}
              >
                A strategist by nature. <em className="text-primary">A problem solver</em> at heart.
              </h1>
            </header>

          <figure
            className="rise relative mx-auto w-full max-w-xs pt-6 sm:max-w-sm md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1 md:mr-0 md:max-w-md md:self-start"
            style={{ animationDelay: '200ms' }}
          >
            <div className="absolute inset-x-4 bottom-0 top-[22%] border border-primary/70 md:inset-x-6" aria-hidden="true" />
            <Image
              src="/images/danielle-portrait.png"
              alt="Danielle Palmer, founder of ÉLEVÉ Business Partners, in a black turtleneck with a pink blazer over her shoulder"
              width={842}
              height={1327}
              priority
              sizes="(min-width: 768px) 38vw, (min-width: 640px) 24rem, 20rem"
              className="relative h-auto w-full"
            />
          </figure>

            <div className="rise flex max-w-2xl flex-col gap-6 md:col-span-7" style={{ animationDelay: '240ms' }}>
              {story.map((paragraph, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? 'text-xl leading-relaxed text-foreground text-pretty'
                      : 'text-lg leading-relaxed text-muted-foreground text-pretty'
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
        </section>

        <section aria-labelledby="quote" className="border-y border-border bg-card">
          <figure className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-20 md:px-8 md:py-28">
            <span className="font-serif text-7xl leading-none text-primary" aria-hidden="true">
              {'“'}
            </span>
            <blockquote id="quote" className="-mt-10 font-serif text-3xl leading-snug text-balance md:text-5xl">
              My goal is simple: to give you more time to run your business, pursue your vision, and enjoy the life you&apos;re
              working so hard to build.
            </blockquote>
            <figcaption className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
              <span className="h-px w-12 bg-primary" aria-hidden="true" />
              Danielle Palmer, Founder
            </figcaption>
          </figure>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="max-w-xl font-serif text-3xl leading-snug text-balance">
            Ready to find what&apos;s slowing your business down?
          </p>
          <Link
            href="/#contact"
            className="inline-flex min-h-11 w-full items-center justify-center gap-3 bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
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
