import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { brand } from '@/lib/site'

export function Hero() {
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden pb-16 pt-28 md:pb-24">
      <Image
        src="/images/hero-atelier.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 md:px-8">
        <p className="rise flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
          <span className="h-px w-12 bg-primary" aria-hidden="true" />
          {brand.tagline}
        </p>
        <h1
          className="rise max-w-4xl font-serif text-5xl font-normal leading-[1.02] text-balance md:text-7xl lg:text-8xl"
          style={{ animationDelay: '120ms' }}
        >
          Elevate how you <em className="text-primary">operate</em>, serve and grow.
        </h1>
        <p
          className="rise max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
          style={{ animationDelay: '240ms' }}
        >
          {brand.positioning}
        </p>
        <div className="rise flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '360ms' }}>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-3 bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book a Workflow Review
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/#services"
            className="inline-flex items-center justify-center border border-foreground/30 px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Explore services
          </Link>
        </div>
      </div>
    </section>
  )
}
