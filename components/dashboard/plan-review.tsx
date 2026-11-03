import { plan } from '@/lib/plan'

export function PlanReview({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="review" className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Your review</p>
          <h2 id="review" className="font-serif text-3xl font-medium leading-tight text-balance md:text-4xl">
            Does this plan match what matters most to you?
          </h2>
          <p className="leading-relaxed text-pretty text-primary-foreground/80">
            Read it through and tell me what to change: priorities, dates, anything that doesn’t fit how you work.
            Once you’re happy, we start on November 9 and meet again for the pilot review on {plan.reviewDate}.
          </p>
          <p className="leading-relaxed">
            With gratitude,
            <br />
            <span className="font-serif text-2xl">{plan.consultant}</span>
            <br />
            <span className="text-sm text-primary-foreground/80">{plan.firm}</span>
          </p>
        </div>
        {children}
      </div>
    </section>
  )
}
