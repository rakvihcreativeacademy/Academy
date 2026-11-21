import { redirect } from 'next/navigation';
import AdminStudents from '@/components/AdminStudents';
import { requireAdmin } from '@/lib/cms/server';
import { configured } from '@/lib/supabase/config';
import type { CoursePayment } from '@/lib/payments';

export const metadata = { title: 'Students' };
export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  if (!configured) {
    return <AdminStudents initialStudents={[]} setupNeeded />;
  }

  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    redirect('/admin/login?next=/admin/students');
  }

  const { data, error } = await admin.db
    .from('course_payments')
    .select('*')
    .order('approved_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(500);

  return (
    <AdminStudents
      initialStudents={(data ?? []) as CoursePayment[]}
      setupNeeded={Boolean(error)}
    />
  );
}
