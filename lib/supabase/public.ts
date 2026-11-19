import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseFetch } from './fetch';

/**
 * Cookie-less, anonymous client for public reads (published page content, published projects).
 * Because it never touches request cookies, pages that use it can be statically cached and are
 * refreshed by the revalidatePath() calls made when an admin publishes.
 */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { fetch: supabaseFetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
