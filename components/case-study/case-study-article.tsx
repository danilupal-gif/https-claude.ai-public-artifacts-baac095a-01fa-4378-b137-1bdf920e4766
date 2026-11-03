import type { CaseStudyContent } from '@/lib/case-studies'

function Block({ title, body }: { title: string; body: string }) {
  if (!body) return null
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-8 md:flex-row md:gap-12">
      <h2 className="shrink-0 text-xs font-medium uppercase tracking-[0.3em] text-primary md:w-48">{title}</h2>
      <p className="max-w-2xl whitespace-pre-line text-lg leading-relaxed text-pretty text-foreground/90">{body}</p>
    </section>
  )
}

/** One case study, exactly as it appears on the website. The client approves this same view. */
export function CaseStudyArticle({ study }: { study: CaseStudyContent }) {
  return (
    <article className="flex flex-col gap-12 lining-nums">
      <header className="flex flex-col gap-5">
        <p className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
          <span className="h-px w-12 bg-primary" aria-hidden="true" />
          {study.displayName}
          {study.industry ? ` · ${study.industry}` : ''}
        </p>
        <h1 className="max-w-4xl font-serif text-4xl leading-[1.05] text-balance md:text-6xl">{study.headline}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">{study.summary}</p>
      </header>

      {study.results.length ? (
        <section aria-labelledby="results-title" className="flex flex-col gap-5">
          <h2 id="results-title" className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
            Before and after
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {study.results.map((r) => (
              <li key={r.label} className="flex flex-col gap-4 border border-border bg-card p-6">
                <span className="text-sm leading-relaxed text-muted-foreground">{r.label}</span>
                <span className="flex items-baseline gap-3">
                  <span className="text-lg text-muted-foreground line-through decoration-primary/60">{r.before || '—'}</span>
                  <span aria-hidden="true" className="text-primary">
                    →
                  </span>
                  <span className="sr-only">to</span>
                  <span className="font-serif text-3xl text-foreground">{r.after || '—'}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-col gap-8">
        <Block title="The challenge" body={study.challenge} />
        <Block title="What we did" body={study.approach} />
        <Block title="The outcome" body={study.outcome} />
      </div>

      {study.quote ? (
        <figure className="flex flex-col gap-4 border-l-2 border-primary pl-6 md:pl-10">
          <blockquote className="max-w-3xl font-serif text-3xl leading-snug text-balance md:text-4xl">
            &ldquo;{study.quote}&rdquo;
          </blockquote>
          {study.quoteBy ? (
            <figcaption className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{study.quoteBy}</figcaption>
          ) : null}
        </figure>
      ) : null}
    </article>
  )
}
