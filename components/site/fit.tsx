import Link from 'next/link'
import { Check } from 'lucide-react'
import { fit } from '@/lib/site'
import { SectionHeading } from './section-heading'

export function Fit() {
  return (
    <section id="fit" aria-labelledby="fit-title" className="border-t border-border bg-card py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        <SectionHeading
          id="fit-title"
          eyebrow="Who we work with"
          title="Founder-led wellness and service businesses, ready for their next stage."
          intro="We work best with owners who already have customers and are stretched thin keeping up with them."
        />
        <div className="flex flex-col gap-8">
          <ul className="flex flex-col">
            {fit.map((item) => (
              <li key={item} className="flex items-center gap-4 border-b border-border py-5 text-lg">
                <Check className="size-5 shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 border border-border bg-background p-6">
            <h3 className="font-serif text-xl">Still finding your first customers?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Marketing is the right first step, not operations. We’re happy to point you in the right direction.{' '}
              <Link href="/#contact" className="text-primary underline underline-offset-4">
                Get in touch
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
