// Loads a client's plan pages into the database so they never live in the (public) repository.
// Usage: node --env-file=/vercel/share/.env.project scripts/load-plan-documents.mjs <slug> <client.html> <internal.html>
import { readFile } from 'node:fs/promises'
import pg from 'pg'

const [slug, clientPath, internalPath] = process.argv.slice(2)
if (!slug || !clientPath || !internalPath) {
  console.error('Usage: load-plan-documents.mjs <slug> <client.html> <internal.html>')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

await pool.query(`
  create table if not exists client_documents (
    client_slug text not null,
    kind text not null,
    title text not null,
    html text not null,
    updated_at timestamptz not null default now(),
    primary key (client_slug, kind)
  );
  create table if not exists client_store (
    client_slug text not null,
    space text not null,
    collection text not null,
    doc_id text not null,
    data jsonb not null,
    updated_by text not null,
    updated_at timestamptz not null default now(),
    primary key (client_slug, space, collection, doc_id)
  );
`)

for (const [kind, path] of [
  ['client', clientPath],
  ['internal', internalPath],
]) {
  const html = await readFile(path, 'utf8')
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? kind
  await pool.query(
    `insert into client_documents (client_slug, kind, title, html) values ($1, $2, $3, $4)
     on conflict (client_slug, kind) do update set title = excluded.title, html = excluded.html, updated_at = now()`,
    [slug, kind, title, html],
  )
  console.log(`Loaded ${kind}: ${title} (${html.length} chars)`)
}

await pool.end()
