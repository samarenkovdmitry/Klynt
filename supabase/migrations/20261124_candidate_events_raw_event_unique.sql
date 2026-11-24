-- Idempotency: one candidate event per raw event per project.
-- A crash or concurrent run between the candidate insert and the
-- raw-event bookkeeping previously produced duplicate candidates
-- (and duplicate fact history / conflicts derived from them).

-- Drop unreferenced duplicates first, keeping the earliest row.
-- Duplicates already referenced by fact_history or conflicts are left
-- in place; if any exist, the index below will fail loudly and they
-- must be reconciled manually rather than silently deleted.
delete from candidate_events a
using candidate_events b
where a.project_id = b.project_id
  and a.raw_event_id = b.raw_event_id
  and a.id <> b.id
  and a.created_at > b.created_at
  and not exists (select 1 from fact_history h where h.event_id = a.id)
  and not exists (select 1 from conflicts c where c.new_event_id = a.id);

create unique index candidate_events_project_raw_event_key
  on candidate_events (project_id, raw_event_id)
  where raw_event_id is not null;
