export type CourseOffering = {
  slug: 'video-editing';
  title: string;
  price_inr: number;
  currency: 'INR';
  batch_label: string;
  duration_label: string;
  is_live: boolean;
  enrollments_enabled: boolean;
  updated_at?: string;
};

export type CoursePayment = {
  id: string;
  course_slug: string;
  course_title: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  learning_mode: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  aadhaar_number: string | null;
  aadhaar_doc_path: string | null;
  aadhaar_doc_name: string | null;
  education: string | null;
  occupation: string | null;
  experience_level: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  goals: string | null;
  amount_paise: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  approval_status: 'pending' | 'approved' | 'rejected';
  student_user_id: string | null;
  approved_at: string | null;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
};

export const DEFAULT_VIDEO_EDITING_OFFERING: CourseOffering = {
  slug: 'video-editing',
  title: 'Professional Video Editing',
  price_inr: 14999,
  currency: 'INR',
  batch_label: 'Next batch enrolling now',
  duration_label: '8 weeks · Hands-on studio training',
  is_live: true,
  enrollments_enabled: true,
};

export function formatInr(amountInr: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInr);
}

export function formatAadhaar(raw: string | null | undefined) {
  if (!raw) return '—';
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 12) return raw;
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
}
