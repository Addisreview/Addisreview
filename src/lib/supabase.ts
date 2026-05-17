import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_HOST = process.env.NEXT_PUBLIC_DB_HOST || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_DB_ANON || '';
const SUPABASE_SERVICE = process.env.DB_SERVICE_KEY || '';

export function createBrowserClient() {
  return createClient<Database>(SUPABASE_HOST, SUPABASE_ANON);
}

export function createServerClient() {
  return createClient<Database>(SUPABASE_HOST, SUPABASE_ANON, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

export function createAdminClient() {
  return createClient<Database>(SUPABASE_HOST, SUPABASE_SERVICE, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
