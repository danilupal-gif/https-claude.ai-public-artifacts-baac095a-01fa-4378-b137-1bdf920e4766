export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
}: {
  id: string
  eyebrow: string
  title: React.ReactNode
  intro?: string
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <p className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
        <span className="h-px w-10 bg-primary" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 id={id} className="font-serif text-4xl font-normal leading-tight text-balance md:text-6xl">
        {title}
      </h2>
      {intro ? <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">{intro}</p> : null}
    </div>
  )
}
