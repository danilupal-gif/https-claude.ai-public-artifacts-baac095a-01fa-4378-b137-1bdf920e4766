export function PanelHeading({
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
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-[0.32em] text-primary">{eyebrow}</p>
      <h2 id={id} className="font-serif text-3xl md:text-4xl">
        {title}
      </h2>
      {intro ? <p className="leading-relaxed text-muted-foreground">{intro}</p> : null}
    </div>
  )
}
