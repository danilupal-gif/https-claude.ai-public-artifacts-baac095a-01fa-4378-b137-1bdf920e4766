import 'server-only'

import type { PortalViewer } from '@/lib/portal'

export const planSpaces = ['client', 'internal'] as const
export type PlanSpace = (typeof planSpaces)[number]

/** Collections each plan page is allowed to save. Anything else is rejected. */
export const allowedCollections: Record<PlanSpace, readonly string[]> = {
  client: ['progress', 'discovery', 'baseline', 'responses'],
  internal: ['progress', 'hours', 'inbox'],
}

export function isPlanSpace(value: unknown): value is PlanSpace {
  return value === 'client' || value === 'internal'
}

/** Clients only ever reach their own plan; the internal playbook is admin-only. */
export function canUseSpace(viewer: PortalViewer, space: PlanSpace) {
  return space === 'client' || viewer.role === 'admin'
}
