import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/service';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please select your Aadhaar card file (JPG, PNG, WebP, or PDF).' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Upload JPG, PNG, WebP, or PDF.' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be smaller than 5 MB.' }, { status: 400 });
    }

    const ext = file.type === 'application/pdf' ? 'pdf'
      : file.type === 'image/png' ? 'png'
      : file.type === 'image/webp' ? 'webp'
      : 'jpg';
    const path = `aadhaar/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

    const db = createServiceClient();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await db.storage
      .from('student-documents')
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json(
        { error: 'Unable to upload Aadhaar document. Ensure supabase/005_enrollment_kyc.sql has been run.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      path,
      name: file.name.slice(0, 200),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed. Please try again.' },
      { status: 500 },
    );
  }
}
