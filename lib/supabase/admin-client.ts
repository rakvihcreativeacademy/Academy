'use client';
import { createBrowserClient } from '@supabase/ssr';
import { ADMIN_AUTH_COOKIE } from './admin-cookie';

export function createAdminBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { name: ADMIN_AUTH_COOKIE }, isSingleton: false },
  );
}
