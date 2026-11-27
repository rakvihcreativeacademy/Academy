import { createServerClient } from '@supabase/ssr';
import { supabaseFetch } from './fetch';
import { cookies } from 'next/headers';
import { ADMIN_AUTH_COOKIE } from './admin-cookie';

export async function createAdminClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: supabaseFetch },
      cookieOptions: { name: ADMIN_AUTH_COOKIE },
      cookies: {
        getAll: () => jar.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) => jar.set(name, value, options));
          } catch {
            // Server Components refresh cookies through proxy.
          }
        },
      },
    },
  );
}
