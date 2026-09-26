// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseClientInstance: SupabaseClient | null = null;
let adminSupabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClientInstance;
};

/**
 * Server-side Supabase client for admin API routes.
 * Uses SUPABASE_SERVICE_ROLE_KEY if defined (bypasses RLS),
 * otherwise falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export const getAdminSupabase = (): SupabaseClient => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  if (!adminSupabaseInstance) {
    adminSupabaseInstance = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminSupabaseInstance;
};