import 'server-only'

import type { CaseStudyCard } from '@/components/admin/client-card'
import { getCaseStudy } from '@/lib/case-studies'
import type { Client } from '@/lib/clients'
import { getBaselineRows } from '@/lib/plan-baseline'

/** The saved case study, or a first draft prefilled from the client's profile and before-and-after numbers. */
export async function getCaseStudyCard(client: Client): Promise<CaseStudyCard> {
  const study = await getCaseStudy(client.slug)
  if (study) {
    return { content: study, status: study.status, clientNote: study.clientNote, publicSlug: study.publicSlug }
  }
  const baseline = await getBaselineRows(client.slug)
  return {
    status: null,
    content: {
      headline: '',
      displayName: client.name,
      industry: '',
      summary: '',
      challenge: '',
      approach: '',
      outcome: '',
      quote: '',
      quoteBy: client.contact,
      results: baseline
        .filter((r) => r.w1 || r.end)
        .slice(0, 8)
        .map((r) => ({ label: r.label, before: r.w1.slice(0, 60), after: r.end.slice(0, 60) })),
    },
  }
}
