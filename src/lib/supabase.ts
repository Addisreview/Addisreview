import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_HOST    = process.env.NEXT_PUBLIC_DB_HOST || '';
const SUPABASE_ANON    = process.env.NEXT_PUBLIC_DB_ANON || '';
const SUPABASE_SERVICE = process.env.DB_SERVICE_KEY || '';

// ── Singleton browser client ──────────────────────────────
// Only one instance ever created — fixes "Multiple GoTrueClient" warning
// and session conflicts across components
let browserClient: SupabaseClient<Database> | null = null;

export function createBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createClient<Database>(SUPABASE_HOST, SUPABASE_ANON, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'addisreview-auth',
      }
    });
  }
  return browserClient;
}

// ── Server client (no session persistence) ───────────────
export function createServerClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_HOST, SUPABASE_ANON, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

// ── Admin client (service key) ────────────────────────────
export function createAdminClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_HOST, SUPABASE_SERVICE, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
}
