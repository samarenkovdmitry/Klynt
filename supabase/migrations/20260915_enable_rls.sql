-- Enable RLS on every public table. All app data flows through API routes
-- using the service-role key, which bypasses RLS — anon/authenticated get nothing.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

-- The view runs as its owner and would bypass RLS on underlying tables.
REVOKE ALL ON public.current_project_state FROM anon, authenticated;
ALTER VIEW public.current_project_state SET (security_invoker = true);
