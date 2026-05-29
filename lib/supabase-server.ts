import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    ""
  );
}

function getSupabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

export function getSupabaseConfigError(): string | null {
  if (!getSupabaseUrl()) {
    return "Set NEXT_PUBLIC_SUPABASE_URL in .env.local";
  }

  if (!getSupabaseKey()) {
    return "Set SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY";
  }

  return null;
}

export function isSupabaseConfigured() {
  return getSupabaseConfigError() === null;
}

export function createServerSupabase(): SupabaseClient {
  const configError = getSupabaseConfigError();

  if (configError) {
    throw new Error(configError);
  }

  return createClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
