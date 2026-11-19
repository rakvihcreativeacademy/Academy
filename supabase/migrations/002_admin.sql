-- Admin panel support: admin users, enquiry status tracking, and admin access to projects.
-- Run once in the Supabase SQL editor after 001_initial.sql.
begin;

-- 1. Who is an admin
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
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
create trigger enquiries_updated_at before update on public.enquiries for each row execute function public.set_updated_at();
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);

grant insert(learning_mode) on public.enquiries to anon, authenticated;
grant select, update(status, notes), delete on public.enquiries to authenticated;
create policy "Admins read enquiries" on public.enquiries for select to authenticated using ((select public.is_admin()));
create policy "Admins update enquiries" on public.enquiries for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated using ((select public.is_admin()));

-- 3. Admins can review and publish/unpublish every student project
create policy "Admins read all projects" on public.projects for select to authenticated using ((select public.is_admin()));
create policy "Admins update all projects" on public.projects for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete all projects" on public.projects for delete to authenticated using ((select public.is_admin()));

commit;

-- 4. Make yourself an admin (replace the email, run after you have signed up on /login):
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
