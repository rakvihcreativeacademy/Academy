-- 004_payments.sql
-- Razorpay payments & live course offering config for Professional Video Editing.
-- Paste into Supabase > SQL Editor and run (safe to re-run).
begin;

-- 1. Live course offering / fee settings (managed from Admin > Payments)
create table if not exists public.course_offerings (
  slug text primary key check (slug = 'video-editing'),
  title text not null default 'Professional Video Editing',
  price_inr integer not null default 14999 check (price_inr >= 1 and price_inr <= 500000),
  currency text not null default 'INR' check (currency = 'INR'),
  batch_label text default 'Next batch enrolling now',
  duration_label text default '8 weeks · Hands-on studio training',
  is_live boolean not null default true,
  enrollments_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

drop trigger if exists course_offerings_updated_at on public.course_offerings;
create trigger course_offerings_updated_at
  before update on public.course_offerings
  for each row execute function public.set_updated_at();

alter table public.course_offerings enable row level security;

drop policy if exists "Anyone reads course offerings" on public.course_offerings;
create policy "Anyone reads course offerings"
  on public.course_offerings for select to anon, authenticated using (true);

drop policy if exists "Admins manage course offerings" on public.course_offerings;
create policy "Admins manage course offerings"
  on public.course_offerings for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.course_offerings to anon, authenticated;
grant insert, update, delete on public.course_offerings to authenticated;

-- Seed default offering for Professional Video Editing
insert into public.course_offerings (slug, title, price_inr, currency, batch_label, duration_label, is_live, enrollments_enabled)
values ('video-editing', 'Professional Video Editing', 14999, 'INR', 'Next batch enrolling now', '8 weeks · Hands-on studio training', true, true)
on conflict (slug) do nothing;

-- 2. Razorpay course payment / enrollment records (Professional Video Editing only)
create table if not exists public.course_payments (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null default 'video-editing' check (course_slug = 'video-editing'),
  course_title text not null default 'Professional Video Editing',
  student_name text not null check (char_length(student_name) between 2 and 120),
  student_email text not null check (char_length(student_email) <= 254),
  student_phone text not null check (student_phone ~ '^[+()0-9 -]{8,20}$'),
  learning_mode text check (char_length(learning_mode) <= 60),
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  razorpay_order_id text unique not null,
  razorpay_payment_id text unique,
  razorpay_signature text,
  status text not null default 'created' check (status in ('created', 'paid', 'failed', 'refunded')),
  notes text check (char_length(notes) <= 2000),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_payments_created_idx on public.course_payments (created_at desc);
create index if not exists course_payments_status_idx on public.course_payments (status, created_at desc);

drop trigger if exists course_payments_updated_at on public.course_payments;
create trigger course_payments_updated_at
  before update on public.course_payments
  for each row execute function public.set_updated_at();

alter table public.course_payments enable row level security;

drop policy if exists "Admins read course payments" on public.course_payments;
create policy "Admins read course payments"
  on public.course_payments for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins update course payments" on public.course_payments;
create policy "Admins update course payments"
  on public.course_payments for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins delete course payments" on public.course_payments;
create policy "Admins delete course payments"
  on public.course_payments for delete to authenticated
  using ((select public.is_admin()));

revoke all on public.course_payments from anon, authenticated;
grant select, update(status, notes), delete on public.course_payments to authenticated;

commit;
