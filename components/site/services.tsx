import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { services } from '@/lib/site'
import { SectionHeading } from './section-heading'

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="border-t border-border bg-card py-24 md:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-5 md:px-8">
        <SectionHeading
          id="services-title"
          eyebrow="Services"
          title="Start small. Measure. Then build what matters."
          intro="Every engagement begins with a review, so we only build what the numbers say is worth building."
        />
        <ul className="grid gap-px bg-border md:grid-cols-2">
          {services.map((s) => (
            <li key={s.name} className="group relative flex flex-col gap-8 bg-card p-8 md:p-10">
              {s.featured ? (
                <span className="absolute right-8 top-8 text-[0.625rem] font-semibold uppercase tracking-[0.3em] text-primary md:right-10 md:top-10">
                  Most chosen
                </span>
              ) : null}
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{s.length}</p>
                <h3 className="font-serif text-3xl md:text-4xl">{s.name}</h3>
                <p className="font-serif text-xl italic text-primary">{s.price}</p>
              </div>
              <p className="leading-relaxed text-muted-foreground text-pretty">{s.summary}</p>
              <ul className="flex flex-col gap-3 border-t border-border pt-6">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-2.5 h-px w-4 shrink-0 bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/?service=${encodeURIComponent(s.name)}#contact`}
                className="mt-auto inline-flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:text-foreground"
              >
                Ask about this
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Every business is different. Final pricing follows the review and is agreed before any work begins.
        </p>
      </div>
    </section>
  )
}
