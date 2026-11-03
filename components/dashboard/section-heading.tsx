export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
}: {
  id: string
  eyebrow: string
  title: string
  intro?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h2 id={id} className="font-serif text-3xl font-medium leading-tight text-balance text-primary md:text-4xl">
        {title}
      </h2>
      {intro ? <p className="max-w-2xl leading-relaxed text-pretty text-muted-foreground">{intro}</p> : null}
    </div>
  )
}
