import { InquiryForm } from './inquiry-form'
import { SectionHeading } from './section-heading'

export function Contact({ defaultService }: { defaultService?: string }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-border py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-12 lg:gap-20">
        <div className="flex flex-col gap-8 lg:col-span-5">
          <SectionHeading
            id="contact-title"
            eyebrow="Begin"
            title={
              <>
                Let’s make your business <em className="text-primary">easier</em> to run.
              </>
            }
            intro="Tell us a little about your business and where things feel stuck. Danielle replies personally within one business day."
          />
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li>A short discovery call comes first. No cost, no pressure.</li>
            <li>If it’s a fit, most clients start with a Business Workflow Review.</li>
          </ul>
        </div>
        <div className="lg:col-span-7">
          <InquiryForm defaultService={defaultService} />
        </div>
      </div>
    </section>
  )
}
