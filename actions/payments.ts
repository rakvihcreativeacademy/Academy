"use server";
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

type Result = { ok: true } | { ok: false; error: string };

async function adminDb() {
  if (!configured) throw new Error('Supabase is not connected.');
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error('Please sign in again.');
  const { data: isAdmin } = await db.rpc('is_admin');
  if (!isAdmin) throw new Error('Your account does not have admin access.');
  return { db, user };
}

const OfferingSchema = z.object({
  price_inr: z.coerce.number().int().min(1, 'Fee must be at least ₹1.').max(500000, 'Fee must be under ₹5,00,000.'),
  batch_label: z.string().trim().max(120).default('Next batch enrolling now'),
  duration_label: z.string().trim().max(120).default('8 weeks · Hands-on studio training'),
  is_live: z.boolean(),
  enrollments_enabled: z.boolean(),
});

export async function saveVideoEditingOffering(input: {
  price_inr: number;
  batch_label: string;
  duration_label: string;
  is_live: boolean;
  enrollments_enabled: boolean;
}): Promise<Result> {
  const parsed = OfferingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || 'Invalid course settings.' };
  try {
    const { db, user } = await adminDb();
    const { error } = await db.from('course_offerings').upsert(
      {
        slug: 'video-editing',
        title: 'Professional Video Editing',
        currency: 'INR',
        ...parsed.data,
        updated_by: user.id,
      },
      { onConflict: 'slug' },
    );
    if (error) return { ok: false, error: 'Could not save fee settings. Ensure supabase/004_payments.sql has been run.' };
    revalidatePath('/courses');
    revalidatePath('/admissions');
    revalidatePath('/admin/payments');
    revalidatePath('/admin');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}

const idSchema = z.uuid();
const paymentPatch = z.object({
  status: z.enum(['created', 'paid', 'failed', 'refunded']).optional(),
  notes: z.string().max(2000).optional(),
});

export async function updateCoursePayment(paymentId: string, patch: { status?: string; notes?: string }): Promise<Result> {
  const parsed = paymentPatch.safeParse(patch);
  if (!idSchema.safeParse(paymentId).success || !parsed.success) return { ok: false, error: 'Invalid payment update.' };
  try {
    const { db } = await adminDb();
    const { error } = await db.from('course_payments').update(parsed.data).eq('id', paymentId);
    if (error) return { ok: false, error: 'Could not update registration record.' };
    revalidatePath('/admin/payments');
    revalidatePath('/admin/students');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}

export async function deleteCoursePayment(paymentId: string): Promise<Result> {
  if (!idSchema.safeParse(paymentId).success) return { ok: false, error: 'Invalid registration ID.' };
  try {
    const { db } = await adminDb();
    const { error } = await db.from('course_payments').delete().eq('id', paymentId);
    if (error) return { ok: false, error: 'Could not delete registration record.' };
    revalidatePath('/admin/payments');
    revalidatePath('/admin/students');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}

export async function getAadhaarSignedUrl(docPath: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!docPath || !docPath.startsWith('aadhaar/')) return { ok: false, error: 'Invalid document path.' };
  try {
    await adminDb();
    const service = createServiceClient();
    const { data, error } = await service.storage.from('student-documents').createSignedUrl(docPath, 300);
    if (error || !data?.signedUrl) return { ok: false, error: 'Could not open Aadhaar document.' };
    return { ok: true, url: data.signedUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unable to generate secure document link.' };
  }
}

export async function approveAndCreateStudentAccount(
  paymentId: string,
  password: string,
): Promise<{ ok: true; email: string; userId: string; updatedExisting: boolean } | { ok: false; error: string }> {
  if (!idSchema.safeParse(paymentId).success) return { ok: false, error: 'Invalid registration ID.' };
  const cleanPassword = password.trim();
  if (cleanPassword.length < 8 || cleanPassword.length > 72) {
    return { ok: false, error: 'Password must be between 8 and 72 characters.' };
  }

  try {
    const { user: adminUser } = await adminDb();
    const service = createServiceClient();

    const { data: reg, error: fetchErr } = await service
      .from('course_payments')
      .select('id, student_name, student_email, student_phone, course_title')
      .eq('id', paymentId)
      .single();

    if (fetchErr || !reg) return { ok: false, error: 'Registration record not found.' };

    const email = reg.student_email.trim().toLowerCase();
    let studentUserId = '';
    let updatedExisting = false;

    const { data: created, error: createErr } = await service.auth.admin.createUser({
      email,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: {
        full_name: reg.student_name,
        phone: reg.student_phone,
        course: reg.course_title,
      },
    });

    if (created?.user) {
      studentUserId = created.user.id;
    } else if (createErr && /already|exists|registered/i.test(createErr.message)) {
      const { data: listData, error: listErr } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = listData?.users?.find(u => u.email?.toLowerCase() === email);
      if (listErr || !existing) {
        return { ok: false, error: 'An account with this email already exists, but could not be updated.' };
      }
      const { error: updErr } = await service.auth.admin.updateUserById(existing.id, {
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          ...existing.user_metadata,
          full_name: reg.student_name,
          phone: reg.student_phone,
          course: reg.course_title,
        },
      });
      if (updErr) return { ok: false, error: updErr.message || 'Could not update existing student password.' };
      studentUserId = existing.id;
      updatedExisting = true;
    } else {
      return { ok: false, error: createErr?.message || 'Could not create student account.' };
    }

    const { error: saveErr } = await service
      .from('course_payments')
      .update({
        approval_status: 'approved',
        student_user_id: studentUserId,
        approved_at: new Date().toISOString(),
        approved_by: adminUser.id,
      })
      .eq('id', paymentId);

    if (saveErr) return { ok: false, error: 'Student account was created, but saving approval status failed. Run 005_enrollment_kyc.sql.' };

    revalidatePath('/admin/payments');
    revalidatePath('/admin/students');
    return { ok: true, email, userId: studentUserId, updatedExisting };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong during approval.' };
  }
}

export async function rejectCourseRegistration(paymentId: string, notes?: string): Promise<Result> {
  if (!idSchema.safeParse(paymentId).success) return { ok: false, error: 'Invalid registration ID.' };
  try {
    const { db } = await adminDb();
    const patch: { approval_status: 'rejected'; notes?: string } = { approval_status: 'rejected' };
    if (notes !== undefined) patch.notes = notes.slice(0, 2000);
    const { error } = await db.from('course_payments').update(patch).eq('id', paymentId);
    if (error) return { ok: false, error: 'Could not reject registration.' };
    revalidatePath('/admin/payments');
    revalidatePath('/admin/students');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}
