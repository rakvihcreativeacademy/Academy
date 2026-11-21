"use server";
import { createClient } from '@/lib/supabase/server';
import { configured } from '@/lib/supabase/config';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const schema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});

export async function authenticate(form: FormData) {
  if (!configured) {
    return { error: 'The portal is not connected yet. Please contact the academy for account access.' };
  }
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const db = await createClient();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: 'Invalid email or password. Use the credentials shared after enrollment approval.' };
  }

  const next = String(form.get('next') || '');
  if (/^\/admin(\/|$)/.test(next)) {
    const { data: admin, error: roleError } = await db.rpc('is_admin');
    if (roleError || !admin) {
      return { error: 'This account does not have admin access. Sign in with your authorised admin email.' };
    }
  }
  redirect(/^\/(admin|dashboard)(\/|$)/.test(next) ? next : '/dashboard');
}

export async function signOut() {
  if (configured) {
    const db = await createClient();
    await db.auth.signOut();
  }
  redirect('/login');
}

export async function adminSignOut() {
  if (configured) {
    const db = await createClient();
    await db.auth.signOut();
  }
  redirect('/admin/login');
}
