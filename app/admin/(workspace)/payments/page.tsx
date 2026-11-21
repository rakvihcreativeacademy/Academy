import AdminPayments from '@/components/AdminPayments';
import { requireAdmin } from '@/lib/cms/server';
import { DEFAULT_VIDEO_EDITING_OFFERING, type CourseOffering, type CoursePayment } from '@/lib/payments';

export const metadata = { title: 'Course Registrations' };
export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const { db } = await requireAdmin();
  const [offeringRes, paymentsRes] = await Promise.all([
    db.from('course_offerings').select('*').eq('slug', 'video-editing').maybeSingle(),
    db.from('course_payments').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  const setupNeeded = Boolean(offeringRes.error || paymentsRes.error);
  const initialOffering: CourseOffering = offeringRes.data
    ? {
        slug: 'video-editing',
        title: offeringRes.data.title || DEFAULT_VIDEO_EDITING_OFFERING.title,
        price_inr: Number(offeringRes.data.price_inr) || DEFAULT_VIDEO_EDITING_OFFERING.price_inr,
        currency: 'INR',
        batch_label: offeringRes.data.batch_label || DEFAULT_VIDEO_EDITING_OFFERING.batch_label,
        duration_label: offeringRes.data.duration_label || DEFAULT_VIDEO_EDITING_OFFERING.duration_label,
        is_live: Boolean(offeringRes.data.is_live),
        enrollments_enabled: Boolean(offeringRes.data.enrollments_enabled),
        updated_at: offeringRes.data.updated_at,
      }
    : DEFAULT_VIDEO_EDITING_OFFERING;

  const initialPayments = (paymentsRes.data ?? []) as CoursePayment[];

  return (
    <AdminPayments
      initialOffering={initialOffering}
      initialPayments={initialPayments}
      setupNeeded={setupNeeded}
    />
  );
}
