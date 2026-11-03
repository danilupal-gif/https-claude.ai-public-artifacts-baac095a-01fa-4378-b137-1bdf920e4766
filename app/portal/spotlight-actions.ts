'use server'

import { randomUUID } from 'node:crypto'
import { del, put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/app/portal/actions'
import { writeMeta } from '@/lib/clients'
import { getViewer } from '@/lib/portal'
import {
  MAX_SPOTLIGHT_IMAGE_BYTES,
  SPOTLIGHT_COLLECTION,
  SPOTLIGHT_DOC,
  SPOTLIGHT_IMAGE_TYPES,
  SPOTLIGHT_SLUG,
  getSpotlight,
  spotlightSchema,
  type Spotlight,
} from '@/lib/spotlight'

function readPairs(formData: FormData, prefix: string, max: number) {
  const rows = []
  for (let i = 0; i < max; i++) {
    const label = String(formData.get(`${prefix}-label-${i}`) ?? '').trim()
    const value = String(formData.get(`${prefix}-value-${i}`) ?? '').trim()
    if (label && value) rows.push({ label, value })
  }
  return rows
}

export async function saveSpotlight(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return { ok: false, message: 'Not allowed.' }

  const current = await getSpotlight()
  let beforeMenu: Spotlight['beforeMenu'] = current.beforeMenu
  let staleImage: string | null = null

  const file = formData.get('beforeMenu')
  if (file instanceof File && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const contentType = SPOTLIGHT_IMAGE_TYPES[ext]
    if (!contentType) return { ok: false, message: 'Use a PNG, JPG or WebP photo of the old menu.' }
    if (file.size > MAX_SPOTLIGHT_IMAGE_BYTES) return { ok: false, message: 'The photo can be up to 4 MB.' }
    const version = randomUUID()
    const blob = await put(`spotlight/${SPOTLIGHT_SLUG}/before-menu-${version}.${ext}`, file, {
      access: 'private',
      contentType,
      addRandomSuffix: false,
    })
    staleImage = current.beforeMenu?.pathname ?? null
    beforeMenu = { pathname: blob.pathname, contentType, version }
  } else if (formData.get('removeBeforeMenu') === 'on') {
    staleImage = current.beforeMenu?.pathname ?? null
    beforeMenu = null
  }

  const parsed = spotlightSchema.safeParse({
    quote: formData.get('quote') ?? '',
    quoteBy: formData.get('quoteBy') ?? '',
    metrics: readPairs(formData, 'metric', 4),
    baseline: readPairs(formData, 'baseline', 8),
    beforeMenu,
  })
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Check the fields and try again.' }
  if (parsed.data.quote && !parsed.data.quoteBy) return { ok: false, message: 'Add who the quote is from.' }

  await writeMeta(SPOTLIGHT_SLUG, SPOTLIGHT_COLLECTION, SPOTLIGHT_DOC, parsed.data, viewer.email)
  if (staleImage) await del(staleImage).catch((error) => console.error('Spotlight image delete failed', error))

  revalidatePath('/case-studies')
  revalidatePath('/portal/admin')
  return { ok: true, message: 'Saved. The Results page is updated.' }
}
