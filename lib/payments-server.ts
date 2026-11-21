import 'server-only';
import { configured } from '@/lib/supabase/config';
import { createPublicClient } from '@/lib/supabase/public';
import { DEFAULT_VIDEO_EDITING_OFFERING, type CourseOffering } from '@/lib/payments';

/** Fetch live Professional Video Editing fee & status from Supabase (safe fallback before migration runs). */
export async function getVideoEditingOffering(): Promise<CourseOffering> {
  if (!configured) return DEFAULT_VIDEO_EDITING_OFFERING;
  try {
    const db = createPublicClient();
    const { data, error } = await db
      .from('course_offerings')
      .select('slug, title, price_inr, currency, batch_label, duration_label, is_live, enrollments_enabled, updated_at')
      .eq('slug', 'video-editing')
      .maybeSingle();
    if (error || !data) return DEFAULT_VIDEO_EDITING_OFFERING;
    return {
      slug: 'video-editing',
      title: data.title || DEFAULT_VIDEO_EDITING_OFFERING.title,
      price_inr: Number(data.price_inr) || DEFAULT_VIDEO_EDITING_OFFERING.price_inr,
      currency: 'INR',
      batch_label: data.batch_label || DEFAULT_VIDEO_EDITING_OFFERING.batch_label,
      duration_label: data.duration_label || DEFAULT_VIDEO_EDITING_OFFERING.duration_label,
      is_live: Boolean(data.is_live),
      enrollments_enabled: Boolean(data.enrollments_enabled),
      updated_at: data.updated_at,
    };
  } catch {
    return DEFAULT_VIDEO_EDITING_OFFERING;
  }
}
