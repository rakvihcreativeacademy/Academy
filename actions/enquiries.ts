"use server";
import { z } from 'zod';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(120),
  email: z.email('Please enter a valid email address').max(254),
  phone: z.string().trim().regex(/^[+()\d\s-]{8,20}$/, 'Please enter a valid mobile number'),
  interest: z.string().trim().min(2, 'Please choose what you are interested in').max(150),
  preferred: z.string().trim().max(120).default(''),
  learning_mode: z.string().trim().max(60).default(''),
  message: z.string().trim().max(3000).default(''),
  type: z.enum(['admission', 'studio', 'production', 'general']),
});
export type EnquiryInput = z.infer<typeof schema>;

/**
 * Validates an enquiry and stores it for the admin panel when Supabase is connected.
 * The browser then forwards the same details to WhatsApp, so a missing database never blocks a student.
 */
export async function submitEnquiry(input: Record<string, string>): Promise<{ ok: true; saved: boolean } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!configured) return { ok: true, saved: false };
  try {
    const db = await createClient();
    const { error } = await db.from('enquiries').insert(parsed.data);
    return { ok: true, saved: !error };
  } catch {
    return { ok: true, saved: false };
  }
}
