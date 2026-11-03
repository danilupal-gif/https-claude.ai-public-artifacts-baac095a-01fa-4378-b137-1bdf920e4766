import Image from 'next/image'
import { pillars } from '@/lib/site'
import { SectionHeading } from './section-heading'

export function Approach() {
  return (
    <section id="approach" aria-labelledby="approach-title" className="border-t border-border py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-12 lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden lg:col-span-5">
          <Image
            src="/images/approach-detail.png"
            alt="Hands arranging cards in sequence on a dark desk"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-12 lg:col-span-7">
          <SectionHeading
            id="approach-title"
            eyebrow="Our approach"
            title={
              <>
                Your business should run as <em className="text-primary">beautifully</em> as it looks.
              </>
            }
            intro="Most growing businesses don’t need more tools. They need the ones they have to work together, so customers are looked after and the owner gets time back. We start by measuring, build one journey properly, and leave you able to run it yourself."
          />
          <ul className="flex flex-col">
            {pillars.map((p) => (
              <li key={p.title} className="flex flex-col gap-2 border-t border-border py-6 md:flex-row md:gap-10">
                <h3 className="font-serif text-2xl md:w-64 md:shrink-0">{p.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Founded by Danielle, whose background is in healthcare workforce and client programs, where every
            handoff has to be right the first time.
          </p>
        </div>
      </div>
    </section>
  )
}
