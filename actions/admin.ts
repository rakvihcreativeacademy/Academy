"use server";
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/cms/server';

type Result = { ok: true } | { ok: false; error: string };

async function adminDb() {
  const { db } = await requireAdmin();
  return db;
}
async function run(fn: () => Promise<{ error: unknown } | void>): Promise<Result> {
  try {
    const r = await fn();
    if (r && r.error) return { ok: false, error: 'The change could not be saved. Please try again.' };
    revalidatePath('/admin');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong.' };
  }
}

const id = z.uuid();
const enquiryPatch = z.object({ status: z.enum(['new', 'contacted', 'enrolled', 'closed']).optional(), notes: z.string().max(2000).optional() });

export async function updateEnquiry(enquiryId: string, patch: { status?: string; notes?: string }) {
  const p = enquiryPatch.safeParse(patch);
  if (!id.safeParse(enquiryId).success || !p.success) return { ok: false, error: 'Invalid update.' } as Result;
  return run(async () => (await adminDb()).from('enquiries').update(p.data).eq('id', enquiryId));
}
export async function deleteEnquiry(enquiryId: string) {
  if (!id.safeParse(enquiryId).success) return { ok: false, error: 'Invalid enquiry.' } as Result;
  return run(async () => (await adminDb()).from('enquiries').delete().eq('id', enquiryId));
}
export async function setProjectStatus(projectId: string, status: string) {
  const s = z.enum(['draft', 'published', 'archived']).safeParse(status);
  if (!id.safeParse(projectId).success || !s.success) return { ok: false, error: 'Invalid update.' } as Result;
  const r = await run(async () => (await adminDb()).from('projects').update({ status: s.data }).eq('id', projectId));
  if (r.ok) revalidatePath('/projects');
  return r;
}
export async function adminDeleteProject(projectId: string) {
  if (!id.safeParse(projectId).success) return { ok: false, error: 'Invalid project.' } as Result;
  const r = await run(async () => (await adminDb()).from('projects').delete().eq('id', projectId));
  if (r.ok) revalidatePath('/projects');
  return r;
}
