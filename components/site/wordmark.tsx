export function Wordmark({ subtitle = 'Business Partners' }: { subtitle?: string }) {
  return (
    <span className="flex flex-col leading-none">
      <span className="font-serif text-2xl font-medium tracking-[0.28em] text-foreground">ÉLEVÉ</span>
      <span className="mt-1 text-[0.625rem] font-medium uppercase tracking-[0.42em] text-primary">{subtitle}</span>
    </span>
  )
}
