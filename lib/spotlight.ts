import 'server-only'

import { z } from 'zod'
import { readMeta } from '@/lib/clients'

/** Stored in client_store (meta space) under this slug, so it works before Vibes Lounge has a portal. */
export const SPOTLIGHT_SLUG = 'vibes-lounge'
export const SPOTLIGHT_COLLECTION = 'spotlight'
export const SPOTLIGHT_DOC = 'main'

export const MAX_SPOTLIGHT_IMAGE_BYTES = 4 * 1024 * 1024
export const SPOTLIGHT_IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

const pairSchema = z.object({
  label: z.string().trim().max(80),
  value: z.string().trim().max(40),
})

export const spotlightSchema = z.object({
  quote: z.string().trim().max(600).default(''),
  quoteBy: z.string().trim().max(80).default(''),
  metrics: z.array(pairSchema).max(4).default([]),
  baseline: z.array(pairSchema).max(8).default([]),
  beforeMenu: z
    .object({ pathname: z.string(), contentType: z.string(), version: z.string() })
    .nullable()
    .default(null),
})

export type Spotlight = z.infer<typeof spotlightSchema>
export type SpotlightPair = z.infer<typeof pairSchema>

export async function getSpotlight(): Promise<Spotlight> {
  const row = await readMeta<unknown>(SPOTLIGHT_SLUG, SPOTLIGHT_COLLECTION, SPOTLIGHT_DOC)
  const parsed = spotlightSchema.safeParse(row?.data ?? {})
  return parsed.success ? parsed.data : spotlightSchema.parse({})
}

export function beforeMenuSrc(spotlight: Spotlight) {
  return spotlight.beforeMenu ? `/api/spotlight/before-menu?v=${encodeURIComponent(spotlight.beforeMenu.version)}` : null
}
