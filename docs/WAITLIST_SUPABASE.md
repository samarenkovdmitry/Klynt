# Waitlist emails (Supabase)

## Table

Run in the Supabase SQL editor:

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
```

## Environment

- `NEXT_PUBLIC_SUPABASE_URL` — project URL from Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` — **server only** (Vercel env, never `NEXT_PUBLIC_`)

Add the same variables to Vercel for production.

## Flow

1. User submits email on `/report/[id]`
2. `POST /api/waitlist` with `{ email, reportId, reportUrl }`
3. Row inserted into `waitlist_emails`
4. Resend sends the report link email
5. Frontend calls `onUnlock()` → full report visible (localStorage flag)
