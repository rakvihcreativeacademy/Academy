import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseFetch } from './fetch';

/**
 * Server-only Supabase client using the service role key.
 * Used exclusively by trusted API routes (such as Razorpay order creation & verification)
 * to bypass RLS when inserting/updating verified payment records.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service credentials are not configured.');
  return createClient(url, key, {
    global: { fetch: supabaseFetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
