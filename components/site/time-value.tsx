'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm leading-relaxed text-muted-foreground">
          {label}
        </label>
        <output htmlFor={id} className="shrink-0 whitespace-nowrap font-serif text-3xl text-foreground lining-nums tabular-nums">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-primary"
      />
    </div>
  )
}

export function TimeValue() {
  const [hours, setHours] = useState(10)
  const [rate, setRate] = useState(75)
  const yearlyHours = hours * 52
  const yearlyCost = yearlyHours * rate

  return (
    <section id="your-time" aria-labelledby="your-time-title" className="scroll-mt-16 border-t border-border py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="flex flex-col gap-6">
          <p className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.36em] text-primary">
            <span className="h-px w-12 bg-primary" aria-hidden="true" />
            The real cost
          </p>
          <h2 id="your-time-title" className="font-serif text-5xl leading-[1.05] text-balance md:text-6xl">
            How much is your time worth?
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
            Copying leads into a spreadsheet, chasing payments, sending the same welcome message again. Small tasks add up. Move the
            sliders to see what the manual work in your week really costs.
          </p>
        </div>

        <div className="flex flex-col gap-8 border border-border bg-card p-6 md:p-10">
          <Slider
            label="Hours a week you spend on repeat admin"
            value={hours}
            min={1}
            max={40}
            step={1}
            display={`${hours} hrs`}
            onChange={setHours}
          />
          <Slider
            label="What an hour of your time is worth"
            value={rate}
            min={25}
            max={300}
            step={5}
            display={money.format(rate)}
            onChange={setRate}
          />

          <div className="grid gap-px border border-border bg-border sm:grid-cols-2" aria-live="polite">
            <div className="flex flex-col gap-2 bg-background p-6">
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Hours a year</span>
              <span className="font-serif text-4xl lining-nums">{whole.format(yearlyHours)}</span>
              <span className="text-sm text-muted-foreground">That&apos;s about {whole.format(yearlyHours / 40)} full work weeks.</span>
            </div>
            <div className="flex flex-col gap-2 bg-background p-6">
              <span className="text-xs uppercase tracking-[0.24em] text-primary">Cost a year</span>
              <span className="font-serif text-4xl text-primary lining-nums">{money.format(yearlyCost)}</span>
              <span className="text-sm text-muted-foreground">Time you could spend serving customers and growing.</span>
            </div>
          </div>

          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-3 bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Find out where your hours go
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
