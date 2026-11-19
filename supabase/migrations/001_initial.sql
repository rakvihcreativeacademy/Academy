begin;
create extension if not exists pgcrypto;
create table public.projects (
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
create index projects_user_idx on public.projects(user_id,created_at desc);
create index projects_published_idx on public.projects(created_at desc) where status='published';
create function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end; $$;
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
alter table public.projects enable row level security;
create policy "Owners read projects" on public.projects for select to authenticated using ((select auth.uid())=user_id);
create policy "Anyone reads published projects" on public.projects for select to anon,authenticated using(status='published');
create policy "Owners insert projects" on public.projects for insert to authenticated with check((select auth.uid())=user_id);
create policy "Owners update projects" on public.projects for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "Owners delete projects" on public.projects for delete to authenticated using((select auth.uid())=user_id);
grant select on public.projects to anon;
grant select,insert,update,delete on public.projects to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('project-logos','project-logos',true,2097152,array['image/png','image/jpeg','image/svg+xml','image/webp']);
create policy "Public logo access" on storage.objects for select to anon,authenticated using(bucket_id='project-logos');
create policy "Own folder uploads" on storage.objects for insert to authenticated with check(bucket_id='project-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Own folder updates" on storage.objects for update to authenticated using(bucket_id='project-logos' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='project-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Own folder deletes" on storage.objects for delete to authenticated using(bucket_id='project-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create table public.enquiries (
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
create policy "Visitors submit enquiries" on public.enquiries for insert to anon,authenticated with check(true);
revoke all on public.enquiries from anon,authenticated;
grant insert(name,email,phone,interest,preferred,message,type) on public.enquiries to anon,authenticated;
commit;
