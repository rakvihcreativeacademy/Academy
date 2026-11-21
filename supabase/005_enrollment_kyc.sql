-- 005_enrollment_kyc.sql
-- Adds full student enrollment fields, Aadhaar KYC document storage (private bucket),
-- and admin approval / student account creation columns to public.course_payments.
-- Paste into Supabase > SQL Editor and run (safe to re-run).
begin;

-- 1. Extended student enrollment & KYC columns on course_payments
alter table public.course_payments add column if not exists date_of_birth date;
alter table public.course_payments add column if not exists gender text check (char_length(gender) <= 40);
alter table public.course_payments add column if not exists address text check (char_length(address) <= 400);
alter table public.course_payments add column if not exists city text check (char_length(city) <= 100);
alter table public.course_payments add column if not exists state text check (char_length(state) <= 100);
alter table public.course_payments add column if not exists pincode text check (char_length(pincode) <= 12);
alter table public.course_payments add column if not exists aadhaar_number text check (aadhaar_number is null or aadhaar_number ~ '^[0-9]{12}$');
alter table public.course_payments add column if not exists aadhaar_doc_path text check (char_length(aadhaar_doc_path) <= 400);
alter table public.course_payments add column if not exists aadhaar_doc_name text check (char_length(aadhaar_doc_name) <= 200);
alter table public.course_payments add column if not exists education text check (char_length(education) <= 120);
alter table public.course_payments add column if not exists occupation text check (char_length(occupation) <= 120);
alter table public.course_payments add column if not exists experience_level text check (char_length(experience_level) <= 60);
alter table public.course_payments add column if not exists emergency_contact_name text check (char_length(emergency_contact_name) <= 120);
alter table public.course_payments add column if not exists emergency_contact_phone text check (char_length(emergency_contact_phone) <= 24);
alter table public.course_payments add column if not exists goals text check (char_length(goals) <= 1500);

-- 2. Admin approval & student portal account linkage
alter table public.course_payments add column if not exists approval_status text not null default 'pending'
  check (approval_status in ('pending', 'approved', 'rejected'));
alter table public.course_payments add column if not exists student_user_id uuid references auth.users(id) on delete set null;
alter table public.course_payments add column if not exists approved_at timestamptz;
alter table public.course_payments add column if not exists approved_by uuid references auth.users(id) on delete set null;

create index if not exists course_payments_approval_idx on public.course_payments (approval_status, created_at desc);

grant update(status, notes, approval_status, student_user_id, approved_at, approved_by) on public.course_payments to authenticated;

-- 3. Private storage bucket for student Aadhaar / KYC uploads (admin-only read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-documents', 'student-documents', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

drop policy if exists "Admins read student documents" on storage.objects;
create policy "Admins read student documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'student-documents' and (select public.is_admin()));

drop policy if exists "Admins delete student documents" on storage.objects;
create policy "Admins delete student documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'student-documents' and (select public.is_admin()));

commit;
