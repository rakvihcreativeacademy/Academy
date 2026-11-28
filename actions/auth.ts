"use server";
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-server';
import { configured } from '@/lib/supabase/config';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const schema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});

const registrationSchema = schema.extend({
  name: z.string().trim().min(1, 'Enter your name').max(100),
  phone: z.string().trim().max(32)
    .refine(value => /^\+?[0-9 ()-]+$/.test(value) && /^\+?\d{10,15}$/.test(value.replace(/[ ()-]/g, '')),
      'Enter a valid phone number with 10 to 15 digits')
    .transform(value => value.replace(/[ ()-]/g, '')),
  confirmPassword: z.string().min(1, 'Confirm your password').max(128),
}).refine(fields => fields.password === fields.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export async function registerStudent(form: FormData) {
  if (!configured) return { error: 'The student portal is not connected yet.' };

  const parsed = registrationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const db = await createClient();
  const { email, password, name, phone } = parsed.data;
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, phone, registration_source: 'student_portal' } },
  });

  if (error) {
    if (error.code === 'user_already_exists') {
      return { error: 'An account already exists. Sign in with your existing password.' };
    }
    return { error: error.message };
  }

  if (data.session) redirect('/dashboard');
  return { message: 'Check your inbox for a confirmation link, then sign in.' };
}

export async function authenticate(form: FormData) {
  if (!configured) {
    return { error: 'The portal is not connected yet. Please contact the academy for account access.' };
  }
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const isAdminLogin = form.get('mode') === 'admin';
  const db = isAdminLogin ? await createAdminClient() : await createClient();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: 'Invalid email or password. If you just registered, check whether your email needs confirmation.' };
  }

  const { data: isAdmin, error: roleError } = await db.rpc('is_admin');
  if (roleError || Boolean(isAdmin) !== isAdminLogin) {
    await db.auth.signOut();
    return {
      error: isAdminLogin
        ? 'This account does not have admin access. Sign in with your authorised admin email.'
        : 'Administrator accounts must sign in through the admin portal.',
    };
  }

  if (isAdminLogin) {
    const studentDb = await createClient();
    const { data: { user: existingUser } } = await studentDb.auth.getUser();
    if (existingUser) {
      const { data: existingIsAdmin } = await studentDb.rpc('is_admin');
      if (existingIsAdmin) await studentDb.auth.signOut();
    }
  }

  const next = String(form.get('next') || '');
  if (isAdminLogin) redirect(/^\/admin(?:\/|$)/.test(next) ? next : '/admin');
  redirect(/^\/(dashboard|courses)(\/|#|$)/.test(next) ? next : '/dashboard');
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
    const db = await createAdminClient();
    await db.auth.signOut();
  }
  redirect('/admin/login');
}
