import 'server-only'

export type Owner = 'k' | 'd' | 'b'
export type PlanItem = { id: string; owner: Owner; text: string; due: string | null }

/**
 * Reads the checklist out of a plan page's script: tasks are written as ['id','k|d|b','text']
 * and due dates as `var DUE={id:'YYYY-MM-DD',...}`.
 */
export function readPlanItems(html: string): PlanItem[] {
  const dueBlock = html.match(/var DUE=\{([^}]*)\}/)?.[1] ?? ''
  const due = new Map([...dueBlock.matchAll(/(\w+):'(\d{4}-\d{2}-\d{2})'/g)].map((m) => [m[1], m[2]]))

  const items: PlanItem[] = []
  const seen = new Set<string>()
  for (const m of html.matchAll(/\['([A-Za-z0-9_-]{1,40})','([kdb])','((?:[^'\\]|\\.)*)'\]/g)) {
    if (seen.has(m[1])) continue
    seen.add(m[1])
    items.push({ id: m[1], owner: m[2] as Owner, text: cleanText(m[3]), due: due.get(m[1]) ?? null })
  }
  return items
}

function cleanText(raw: string) {
  return raw
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\(.)/g, '$1')
    .replace(/&amp;/g, '&')
}

/** Today's date in the portal's working timezone, as YYYY-MM-DD. */
export function todayISO(timeZone = 'America/New_York') {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
export function formatDue(iso: string) {
  return short.format(new Date(`${iso}T12:00:00Z`))
}
