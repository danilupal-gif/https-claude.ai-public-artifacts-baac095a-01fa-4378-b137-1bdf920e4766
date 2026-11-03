'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { db } from '@/lib/db'
import { projectInquiries } from '@/lib/db/schema'
import { serviceOptions } from '@/lib/site'

export type InquiryState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> }

const optional = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : null))

const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Please share your name.').max(120),
  businessName: z.string().trim().min(1, 'Please share your business name.').max(160),
  email: z.string().trim().email('Please enter a valid email.').max(200),
  phone: optional,
  website: optional,
  industry: z.string().trim().min(1, 'Please tell us your industry.').max(120),
  services: z
    .array(z.enum(serviceOptions))
    .min(1, 'Choose at least one area you want help with.'),
  budget: z.string({ error: 'Please choose a budget range.' }).trim().min(1, 'Please choose a budget range.').max(60),
  timing: optional,
  description: z
    .string()
    .trim()
    .min(20, 'A few more details will help (20 characters or more).')
    .max(4000),
})

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Honeypot: real visitors never fill in this hidden field.
  if (formData.get('company_url')) return { ok: true }

  const parsed = inquirySchema.safeParse({
    ...Object.fromEntries(formData),
    services: formData.getAll('services'),
  })
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      fieldErrors[key] ??= issue.message
    }
    return { ok: false, message: 'Please check the highlighted fields.', fieldErrors }
  }

  const data = parsed.data
  try {
    await db.insert(projectInquiries).values({
      name: data.name,
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      website: data.website,
      industry: data.industry,
      services: data.services,
      budget: data.budget,
      launchDate: data.timing,
      description: data.description,
      userAgent: (await headers()).get('user-agent')?.slice(0, 300) ?? null,
    })
  } catch (error) {
    console.error('Inquiry insert failed', error)
    return { ok: false, message: 'Something went wrong saving your inquiry. Please try again.' }
  }

  return { ok: true }
}
