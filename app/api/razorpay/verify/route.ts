import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service';

const VerifySchema = z.object({
  razorpay_order_id: z.string().min(4),
  razorpay_payment_id: z.string().min(4),
  razorpay_signature: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret is not configured on the server.' }, { status: 500 });
    }

    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Incomplete payment verification payload.' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(razorpay_signature, 'utf8');
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

    const db = createServiceClient();

    if (!valid) {
      await db
        .from('course_payments')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);
      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    const { data, error } = await db
      .from('course_payments')
      .update({
        status: 'paid',
        razorpay_payment_id,
        razorpay_signature,
        paid_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('id, course_title, student_name, amount_paise, razorpay_payment_id, paid_at')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Payment verified, but database update failed.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      enrollment: data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected verification error.' },
      { status: 500 },
    );
  }
}
