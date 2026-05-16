import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Supabase project config
const SUPABASE_HOST = process.env.NEXT_PUBLIC_DB_HOST || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_DB_ANON || '';
const SUPABASE_SERVICE = process.env.DB_SERVICE_KEY || '';

// ── Client Component (browser) ────────────────────────────
export function createBrowserClient() {
  return createClient<Database>(SUPABASE_HOST, SUPABASE_ANON);
}

// ── Server Component ──────────────────────────────────────
export function createServerClient() {
  return createClient<Database>(SUPABASE_HOST, SUPABASE_ANON);
}

// ── Service Role (server-only, bypasses RLS) ──────────────
export function createAdminClient() {
  return createClient<Database>(
    SUPABASE_HOST,
    SUPABASE_SERVICE,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
