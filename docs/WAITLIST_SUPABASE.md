# Supabase (reports + waitlist)

Run in the Supabase SQL editor.

## Reports (shareable links)

```sql
create table if not exists public.reports (
  id text primary key,
  audited_url text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx
  on public.reports (created_at desc);
```

- Saved on every successful `POST /api/analyze`
- Loaded via `GET /api/reports/[id]` when opening a shared link
- New links use a **10-character** id, e.g. `https://klynt.one/report/k7m2x9p4q1` (older UUID links still load if already in the table)

If you already created `reports` with `id uuid`, either drop the table (empty) or migrate:

```sql
alter table public.reports alter column id type text using id::text;
```

## Waitlist emails

```sql
create table if not exists public.waitlist_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  report_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_emails_report_id_idx
  on public.waitlist_emails (report_id);

create index if not exists waitlist_emails_created_at_idx
  on public.waitlist_emails (created_at desc);

-- If you use the anon key (not service role), allow inserts from the API:
alter table public.waitlist_emails enable row level security;

create policy "waitlist_anon_insert"
  on public.waitlist_emails
  for insert
  to anon, authenticated
  with check (true);
```

## Environment

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project URL from Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | Server only (Vercel). Bypasses RLS. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev fallback | Works if the RLS policy above is applied |

Add the same variables to Vercel for production (use **service role**, not anon).

## Flows

**Shareable report**

1. `POST /api/analyze` → insert `reports` → returns `reportId`
2. User opens `/report/{id}` on any device
3. `useReportData` → localStorage cache, else `GET /api/reports/{id}`

**Waitlist**

1. User submits email on `/report/[id]`
2. `POST /api/waitlist` with `{ email, reportId, reportUrl }`
3. Row inserted into `waitlist_emails`
4. Resend sends the report link email
5. Frontend calls `onUnlock()` → full report visible (localStorage flag)
