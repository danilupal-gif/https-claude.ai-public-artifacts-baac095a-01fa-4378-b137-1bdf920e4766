import Image from 'next/image'
import { ArrowUpRight, Check, CircleDashed } from 'lucide-react'

const delivered = [
  {
    title: 'Website Creation',
    body: 'A brand-new website that gives guests one place to find the menu, weekly events, the gallery, reviews and careers.',
  },
  {
    title: 'Digital Menu Design & Management',
    body: 'A searchable digital menu for cocktails, hookah, cigars and food, with photos and prices that stay easy to update.',
  },
]

const inProgress = [
  {
    title: 'Workforce Scheduling & Automation',
    body: 'Automated shift scheduling and staff access, so the team is organized and ready from day one.',
  },
  {
    title: 'Food & Beverage Ordering Optimization',
    body: 'A streamlined ordering system that makes it faster to take, track and fill food and drink orders.',
  },
]

export function ClientSpotlight() {
  return (
    <section aria-labelledby="spotlight-title" className="flex flex-col gap-10 border border-border bg-card p-5 md:p-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Client spotlight · Hospitality</p>
        <h2 id="spotlight-title" className="font-serif text-4xl leading-tight text-balance md:text-5xl">
          Vibes Lounge
        </h2>
        <p className="text-sm text-muted-foreground">Devin Mooring, owner · Grand opening November 13, 2026</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <figure className="flex flex-col gap-3 lg:sticky lg:top-28">
          <div className="relative pb-10 md:pb-14">
            <div className="relative aspect-[16/10] w-[82%] overflow-hidden border border-border">
              <Image
                src="/images/work/vibes-lounge-site.png"
                alt="The Vibes Lounge website homepage, with the lounge name in gold over a photo of the interior and a cocktail menu card."
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-top"
              />
            </div>
            <div className="absolute bottom-0 right-0 aspect-[390/844] w-[34%] overflow-hidden rounded-2xl border-4 border-background shadow-2xl">
              <Image
                src="/images/work/vibes-lounge-menu.png"
                alt="The Vibes Lounge digital menu on a phone, listing signature cocktails with prices and photos."
                fill
                sizes="(min-width: 1024px) 14vw, 34vw"
                className="object-cover object-top"
              />
            </div>
          </div>
          <figcaption className="text-xs text-muted-foreground">The new website and digital menu.</figcaption>
        </figure>

        <div className="flex flex-col gap-8">
          <p className="text-lg leading-relaxed text-pretty">
            Devin brought ÉLEVÉ in ahead of opening to give Vibes Lounge a strong online presence from the start. We began with
            digital optimization: a new website and a digital menu that make the lounge easy to find, easy to browse, and ready to
            grow its following before the doors open.
          </p>

          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
              <Check className="size-4" aria-hidden="true" />
              Delivered
            </h3>
            <ul className="flex flex-col border-t border-border">
              {delivered.map((item) => (
                <li key={item.title} className="flex flex-col gap-1 border-b border-border py-4">
                  <span className="font-serif text-xl">{item.title}</span>
                  <span className="leading-relaxed text-muted-foreground">{item.body}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              <CircleDashed className="size-4" aria-hidden="true" />
              Working on now
            </h3>
            <ul className="flex flex-col border-t border-border">
              {inProgress.map((item) => (
                <li key={item.title} className="flex flex-col gap-1 border-b border-border py-4">
                  <span className="font-serif text-xl">{item.title}</span>
                  <span className="leading-relaxed text-muted-foreground">{item.body}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="border-l border-primary pl-4 leading-relaxed text-muted-foreground text-pretty">
            <span className="text-foreground">Full case study coming soon.</span> After the November 13 grand opening,
            we&apos;ll share the results of this digital work from start to finish.
          </p>

          <a
            href="https://vibesloungewil.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-fit items-center gap-2 border border-foreground/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-colors hover:border-primary hover:text-primary"
          >
            Visit vibesloungewil.com
            <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  )
}
