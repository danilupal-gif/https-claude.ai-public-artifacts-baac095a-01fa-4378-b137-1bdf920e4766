import 'server-only'

import { readMeta } from '@/lib/clients'

export type ClientSettings = { bookingUrl: string | null; weeklyEmail: boolean }

type Stored = Partial<{ bookingUrl: string; weeklyEmail: boolean }>

export async function getClientSettings(slug: string): Promise<ClientSettings> {
  const row = await readMeta<Stored>(slug, 'settings', 'main')
  const url = row?.data.bookingUrl
  return {
    bookingUrl: typeof url === 'string' && /^https:\/\//i.test(url) ? url : null,
    weeklyEmail: row?.data.weeklyEmail !== false,
  }
}
