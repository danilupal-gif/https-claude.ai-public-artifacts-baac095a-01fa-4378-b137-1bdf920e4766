import { boolean, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, unique } from 'drizzle-orm/pg-core'

// --- Better Auth required tables (camelCase columns match Better Auth defaults)

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- Client portal ---------------------------------------------------------

/** Invitation list. Only emails listed here can create a portal account. */
export const portalAccess = pgTable('portal_access', {
  email: text('email').primaryKey(),
  clientSlug: text('client_slug').notNull(),
  role: text('role').notNull().default('client'),
  inviteCodeHash: text('invite_code_hash'),
  codeVerifiedAt: timestamp('code_verified_at'),
  activatedAt: timestamp('activated_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const clientItemStatus = pgTable(
  'client_item_status',
  {
    id: serial('id').primaryKey(),
    clientSlug: text('client_slug').notNull(),
    itemKey: text('item_key').notNull(),
    status: text('status').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.clientSlug, t.itemKey)],
)

export const clientMessages = pgTable('client_messages', {
  id: serial('id').primaryKey(),
  clientSlug: text('client_slug').notNull(),
  userId: text('user_id').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/** Plan pages per client: kind 'client' (what the client sees) or 'internal' (admin only). */
export const clientDocuments = pgTable(
  'client_documents',
  {
    clientSlug: text('client_slug').notNull(),
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    html: text('html').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.clientSlug, t.kind] })],
)

/** Saved state for the plan pages (checklists, confirmations, baseline, hours). */
export const clientStore = pgTable(
  'client_store',
  {
    clientSlug: text('client_slug').notNull(),
    space: text('space').notNull(),
    collection: text('collection').notNull(),
    docId: text('doc_id').notNull(),
    data: jsonb('data').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.clientSlug, t.space, t.collection, t.docId] })],
)

/** Files a client attaches to a request in their plan. The bytes live in private Vercel Blob storage. */
export const clientFiles = pgTable('client_files', {
  id: text('id').primaryKey(),
  clientSlug: text('client_slug').notNull(),
  itemId: text('item_id').notNull(),
  pathname: text('pathname').notNull(),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  contentType: text('content_type').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Website inquiries (existing table) ------------------------------------

export const projectInquiries = pgTable('project_inquiries', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: text('name').notNull(),
  businessName: text('business_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  industry: text('industry').notNull(),
  website: text('website'),
  services: text('services').array().notNull().default([]),
  budget: text('budget').notNull(),
  launchDate: text('launch_date'),
  description: text('description').notNull(),
  userAgent: text('user_agent'),
  status: text('status').notNull().default('new'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
