"use server";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

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
 * Validates an enquiry and stores it directly in Supabase (`public.enquiries`)
 * so it appears immediately in Admin Panel -> Enquiries.
 */
export async function submitEnquiry(
  input: Record<string, string>,
): Promise<{ ok: true; saved: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!configured) {
    return { ok: false, error: 'Enquiry submission is not connected yet. Please try again shortly.' };
  }

  try {
    const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? createServiceClient() : await createClient();
    const { error } = await db.from('enquiries').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      interest: parsed.data.interest,
      preferred: parsed.data.preferred || null,
      learning_mode: parsed.data.learning_mode || null,
      message: parsed.data.message || null,
      type: parsed.data.type,
    });
    if (error) {
      return { ok: false, error: 'Could not save your enquiry right now. Please try again.' };
    }
    revalidatePath('/admin/enquiries');
    revalidatePath('/admin');
    return { ok: true, saved: true };
  } catch {
    return { ok: false, error: 'Could not save your enquiry right now. Please try again.' };
  }
}
