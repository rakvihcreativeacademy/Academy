-- RAKVIH Creative Academy: COMPLETE DATABASE SETUP
-- Paste this entire file into Supabase > SQL Editor and run.
-- Supports a fresh project or an existing installation of migrations 001-003.
-- Keeps existing projects, enquiries, content and users. Does not reset passwords.
-- After success, run npm run admin:setup (see ADMIN_SETUP.md) to create the admin login.
-- Run this file instead of running the three individual migrations.
begin;
-- 001_initial.sql
create extension if not exists pgcrypto;
create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 2 and 120),
 tagline text check(char_length(tagline)<=200),
 description text check(char_length(description)<=20000),
 category text,
 website_url text check(website_url is null or website_url='' or website_url ~ '^https?://'),
 logo_url text,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists projects_user_idx on public.projects(user_id,created_at desc);
create index if not exists projects_published_idx on public.projects(created_at desc) where status='published';
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end; $$;
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
alter table public.projects enable row level security;
drop policy if exists "Owners read projects" on public.projects;
create policy "Owners read projects" on public.projects for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Anyone reads published projects" on public.projects;
create policy "Anyone reads published projects" on public.projects for select to anon,authenticated using(status='published');
drop policy if exists "Owners insert projects" on public.projects;
create policy "Owners insert projects" on public.projects for insert to authenticated with check((select auth.uid())=user_id);
drop policy if exists "Owners update projects" on public.projects;
create policy "Owners update projects" on public.projects for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists "Owners delete projects" on public.projects;
create policy "Owners delete projects" on public.projects for delete to authenticated using((select auth.uid())=user_id);
grant select on public.projects to anon;
grant select,insert,update,delete on public.projects to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('project-logos','project-logos',true,2097152,array['image/png','image/jpeg','image/svg+xml','image/webp']) on conflict(id) do nothing;
drop policy if exists "Public logo access" on storage.objects;
create policy "Public logo access" on storage.objects for select to anon,authenticated using(bucket_id='project-logos');
drop policy if exists "Own folder uploads" on storage.objects;
create policy "Own folder uploads" on storage.objects for insert to authenticated with check(bucket_id='project-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Own folder updates" on storage.objects;
create policy "Own folder updates" on storage.objects for update to authenticated using(bucket_id='project-logos' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='project-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Own folder deletes" on storage.objects;
create policy "Own folder deletes" on storage.objects for delete to authenticated using(bucket_id='project-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create table if not exists public.enquiries (
 id uuid primary key default gen_random_uuid(),
 name text not null check(char_length(name) between 2 and 120),
 email text not null check(char_length(email)<=254),
 phone text not null check(phone ~ '^[+()0-9 -]{8,20}$'),
 interest text not null check(char_length(interest) between 2 and 150),
 preferred text check(char_length(preferred)<=120),
 message text check(char_length(message)<=3000),
 type text not null check(type in ('admission','studio','production')),
 created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
drop policy if exists "Visitors submit enquiries" on public.enquiries;
create policy "Visitors submit enquiries" on public.enquiries for insert to anon,authenticated with check(true);
revoke all on public.enquiries from anon,authenticated;
grant insert(name,email,phone,interest,preferred,message,type) on public.enquiries to anon,authenticated;

-- 002_admin.sql
-- Admin panel support: admin users, enquiry status tracking, and admin access to projects.
-- Run once in the Supabase SQL editor after 001_initial.sql.
-- 1. Who is an admin
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "Users can see their own admin row" on public.admins;
create policy "Users can see their own admin row" on public.admins for select to authenticated using ((select auth.uid()) = user_id);
grant select on public.admins to authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
grant execute on function public.is_admin() to authenticated;

-- 2. Enquiries: new fields + allow the 'general' contact type
alter table public.enquiries add column if not exists learning_mode text check (char_length(learning_mode) <= 60);
alter table public.enquiries add column if not exists status text not null default 'new' check (status in ('new','contacted','enrolled','closed'));
alter table public.enquiries add column if not exists notes text check (char_length(notes) <= 2000);
alter table public.enquiries add column if not exists updated_at timestamptz not null default now();
alter table public.enquiries drop constraint if exists enquiries_type_check;
alter table public.enquiries add constraint enquiries_type_check check (type in ('admission','studio','production','general'));
drop trigger if exists enquiries_updated_at on public.enquiries;
create trigger enquiries_updated_at before update on public.enquiries for each row execute function public.set_updated_at();
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);

grant insert(learning_mode) on public.enquiries to anon, authenticated;
grant select, update(status, notes), delete on public.enquiries to authenticated;
drop policy if exists "Admins read enquiries" on public.enquiries;
create policy "Admins read enquiries" on public.enquiries for select to authenticated using ((select public.is_admin()));
drop policy if exists "Admins update enquiries" on public.enquiries;
create policy "Admins update enquiries" on public.enquiries for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Admins delete enquiries" on public.enquiries;
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using ((select public.is_admin()));

-- 3. Admins can review and publish/unpublish every student project
drop policy if exists "Admins read all projects" on public.projects;
create policy "Admins read all projects" on public.projects for select to authenticated using ((select public.is_admin()));
drop policy if exists "Admins update all projects" on public.projects;
create policy "Admins update all projects" on public.projects for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Admins delete all projects" on public.projects;
create policy "Admins delete all projects" on public.projects for delete to authenticated using ((select public.is_admin()));

-- 003_content.sql
-- Run after 001_initial.sql and 002_admin.sql.
create table if not exists public.site_content (
  key text primary key check (key in ('courses','podcast-studio','production','projects','careers')),
  draft jsonb not null,
  published jsonb,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.site_content enable row level security;
-- Public users can read only key and published columns, never draft columns.
drop policy if exists "Read published or admin content" on public.site_content;
create policy "Read published or admin content" on public.site_content for select using (published is not null or (select public.is_admin()));
drop policy if exists "Only admins insert content" on public.site_content;
create policy "Only admins insert content" on public.site_content for insert to authenticated with check ((select public.is_admin()));
drop policy if exists "Only admins update content" on public.site_content;
create policy "Only admins update content" on public.site_content for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.site_content from anon, authenticated;
grant select (key,published) on public.site_content to anon, authenticated;
grant select,insert,update on public.site_content to authenticated;
-- Read full records (including drafts) only through an admin-checked RPC.
revoke select on public.site_content from authenticated;
grant select(key,published) on public.site_content to authenticated;
create or replace function public.admin_content() returns setof public.site_content
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  return query select * from public.site_content order by key;
end;
$$;
revoke all on function public.admin_content() from public;
grant execute on function public.admin_content() to authenticated;
create or replace function public.save_site_content(p_key text, p_draft jsonb, p_revision integer, p_publish boolean)
returns integer language plpgsql security definer set search_path = '' as $$
declare next_revision integer;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_key not in ('courses','podcast-studio','production','projects','careers') then raise exception 'Invalid page'; end if;
  if p_revision = 0 then
    insert into public.site_content(key,draft,published,published_at,updated_by)
    values(p_key,p_draft,case when p_publish then p_draft else null end,case when p_publish then now() else null end,auth.uid())
    on conflict do nothing returning revision into next_revision;
  else
    update public.site_content set draft=p_draft,
      published=case when p_publish then p_draft else published end,
      published_at=case when p_publish then now() else published_at end,
      revision=revision+1,updated_at=now(),updated_by=auth.uid()
    where key=p_key and revision=p_revision returning revision into next_revision;
  end if;
  if next_revision is null then raise exception 'This page changed elsewhere. Reload before saving.'; end if;
  return next_revision;
end;
$$;
revoke all on function public.save_site_content(text,jsonb,integer,boolean) from public;
grant execute on function public.save_site_content(text,jsonb,integer,boolean) to authenticated;
-- All content writes use the checked RPC above (including revision conflict protection).
revoke insert,update on public.site_content from authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('academy-media','academy-media',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
drop policy if exists "Public academy media" on storage.objects;
create policy "Public academy media" on storage.objects for select using (bucket_id='academy-media');
drop policy if exists "Admins upload academy media" on storage.objects;
create policy "Admins upload academy media" on storage.objects for insert to authenticated with check (bucket_id='academy-media' and (select public.is_admin()) and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Admins remove own academy media" on storage.objects;
create policy "Admins remove own academy media" on storage.objects for delete to authenticated using (bucket_id='academy-media' and (select public.is_admin()) and (storage.foldername(name))[1]=(select auth.uid())::text);

-- 004_payments.sql
-- Razorpay payments & live course offering config for Professional Video Editing.
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
create trigger course_offerings_updated_at before update on public.course_offerings for each row execute function public.set_updated_at();
alter table public.course_offerings enable row level security;
drop policy if exists "Anyone reads course offerings" on public.course_offerings;
create policy "Anyone reads course offerings" on public.course_offerings for select to anon, authenticated using (true);
drop policy if exists "Admins manage course offerings" on public.course_offerings;
create policy "Admins manage course offerings" on public.course_offerings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select on public.course_offerings to anon, authenticated;
grant insert, update, delete on public.course_offerings to authenticated;
insert into public.course_offerings (slug, title, price_inr, currency, batch_label, duration_label, is_live, enrollments_enabled)
values ('video-editing', 'Professional Video Editing', 14999, 'INR', 'Next batch enrolling now', '8 weeks · Hands-on studio training', true, true)
on conflict (slug) do nothing;

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
create trigger course_payments_updated_at before update on public.course_payments for each row execute function public.set_updated_at();
alter table public.course_payments enable row level security;
drop policy if exists "Admins read course payments" on public.course_payments;
create policy "Admins read course payments" on public.course_payments for select to authenticated using ((select public.is_admin()));
drop policy if exists "Admins update course payments" on public.course_payments;
create policy "Admins update course payments" on public.course_payments for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Admins delete course payments" on public.course_payments;
create policy "Admins delete course payments" on public.course_payments for delete to authenticated using ((select public.is_admin()));
revoke all on public.course_payments from anon, authenticated;
grant select, update(status, notes), delete on public.course_payments to authenticated;

-- 005_enrollment_kyc.sql
-- Adds full student enrollment fields, Aadhaar KYC document storage (private bucket),
-- and admin approval / student account creation columns to public.course_payments.
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

alter table public.course_payments add column if not exists approval_status text not null default 'pending'
  check (approval_status in ('pending', 'approved', 'rejected'));
alter table public.course_payments add column if not exists student_user_id uuid references auth.users(id) on delete set null;
alter table public.course_payments add column if not exists approved_at timestamptz;
alter table public.course_payments add column if not exists approved_by uuid references auth.users(id) on delete set null;

create index if not exists course_payments_approval_idx on public.course_payments (approval_status, created_at desc);

grant update(status, notes, approval_status, student_user_id, approved_at, approved_by) on public.course_payments to authenticated;

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
