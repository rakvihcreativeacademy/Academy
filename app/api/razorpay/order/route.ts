import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service';
import { DEFAULT_VIDEO_EDITING_OFFERING } from '@/lib/payments';

const OrderRequestSchema = z.object({
  courseSlug: z.literal('video-editing'),
  name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  phone: z.string().trim().regex(/^[+()0-9 -]{8,20}$/, 'Please enter a valid phone number.'),
  dateOfBirth: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter your date of birth.'),
  gender: z.string().trim().min(1, 'Please select your gender.').max(40),
  address: z.string().trim().min(5, 'Please enter your residential address.').max(400),
  city: z.string().trim().min(2, 'Please enter your city.').max(100),
  state: z.string().trim().min(2, 'Please enter your state.').max(100),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode.'),
  aadhaarNumber: z.string().transform(v => v.replace(/\D/g, '')).refine(v => /^[0-9]{12}$/.test(v), 'Please enter a valid 12-digit Aadhaar number.'),
  aadhaarDocPath: z.string().trim().min(5, 'Please upload your Aadhaar card copy.').max(400),
  aadhaarDocName: z.string().trim().min(1).max(200),
  education: z.string().trim().min(2, 'Please enter your highest qualification.').max(120),
  occupation: z.string().trim().min(2, 'Please select your current role.').max(120),
  experienceLevel: z.string().trim().min(2, 'Please select your editing experience level.').max(60),
  learningMode: z.string().trim().min(2).max(60).default('In-studio (Bengaluru)'),
  emergencyContactName: z.string().trim().min(2, 'Please enter an emergency contact name.').max(120),
  emergencyContactPhone: z.string().trim().regex(/^[+()0-9 -]{8,20}$/, 'Please enter a valid emergency contact phone.'),
  goals: z.string().trim().max(1500).optional().default(''),
});

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys are not configured on the server.' }, { status: 500 });
    }

    const body = await req.json();
    const parsed = OrderRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Please complete all required enrollment fields.' },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const db = createServiceClient();

    // Always read live fee and availability from Supabase (never trust client-submitted price)
    const { data: offeringRow, error: offeringErr } = await db
      .from('course_offerings')
      .select('*')
      .eq('slug', 'video-editing')
      .maybeSingle();

    if (offeringErr && offeringErr.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Payment tables are not initialized yet. Run supabase/004_payments.sql and 005_enrollment_kyc.sql in Supabase SQL Editor.' },
        { status: 500 },
      );
    }

    const offering = offeringRow ?? DEFAULT_VIDEO_EDITING_OFFERING;
    if (!offering.is_live || !offering.enrollments_enabled) {
      return NextResponse.json(
        { error: 'Online enrollment for Professional Video Editing is currently paused.' },
        { status: 400 },
      );
    }

    const amountPaise = Math.round(Number(offering.price_inr) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return NextResponse.json({ error: 'Invalid course fee configured.' }, { status: 500 });
    }

    const receipt = `rk_ve_${Date.now()}`;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: {
          course_slug: 'video-editing',
          course_title: offering.title,
          student_name: d.name,
          student_email: d.email,
          student_phone: d.phone,
          learning_mode: d.learningMode,
          city: d.city,
        },
      }),
    });

    const rzpOrder = await rzpRes.json();
    if (!rzpRes.ok || !rzpOrder?.id) {
      return NextResponse.json(
        { error: rzpOrder?.error?.description || 'Unable to create Razorpay order. Check your Razorpay keys.' },
        { status: 502 },
      );
    }

    const { data: record, error: insertErr } = await db
      .from('course_payments')
      .insert({
        course_slug: 'video-editing',
        course_title: offering.title,
        student_name: d.name,
        student_email: d.email,
        student_phone: d.phone,
        date_of_birth: d.dateOfBirth,
        gender: d.gender,
        address: d.address,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
        aadhaar_number: d.aadhaarNumber,
        aadhaar_doc_path: d.aadhaarDocPath,
        aadhaar_doc_name: d.aadhaarDocName,
        education: d.education,
        occupation: d.occupation,
        experience_level: d.experienceLevel,
        learning_mode: d.learningMode,
        emergency_contact_name: d.emergencyContactName,
        emergency_contact_phone: d.emergencyContactPhone,
        goals: d.goals || null,
        amount_paise: amountPaise,
        currency: 'INR',
        razorpay_order_id: rzpOrder.id,
        status: 'created',
        approval_status: 'pending',
      })
      .select('id')
      .single();

    if (insertErr) {
      return NextResponse.json(
        { error: 'Unable to save registration in database. Ensure supabase/005_enrollment_kyc.sql has been run.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      orderId: rzpOrder.id,
      amountPaise,
      currency: 'INR',
      keyId,
      courseTitle: offering.title,
      paymentRecordId: record.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected server error while starting payment.' },
      { status: 500 },
    );
  }
}
