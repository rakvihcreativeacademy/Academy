-- Run after 001_initial.sql and 002_admin.sql.
begin;
create table public.site_content (
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
create policy "Read published or admin content" on public.site_content for select using (published is not null or (select public.is_admin()));
create policy "Only admins insert content" on public.site_content for insert to authenticated with check ((select public.is_admin()));
create policy "Only admins update content" on public.site_content for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.site_content from anon, authenticated;
grant select (key,published) on public.site_content to anon, authenticated;
grant select,insert,update on public.site_content to authenticated;
-- Read full records (including drafts) only through an admin-checked RPC.
revoke select on public.site_content from authenticated;
grant select(key,published) on public.site_content to authenticated;
create function public.admin_content() returns setof public.site_content
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  return query select * from public.site_content order by key;
end;
$$;
revoke all on function public.admin_content() from public;
grant execute on function public.admin_content() to authenticated;
create function public.save_site_content(p_key text, p_draft jsonb, p_revision integer, p_publish boolean)
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
create policy "Public academy media" on storage.objects for select using (bucket_id='academy-media');
create policy "Admins upload academy media" on storage.objects for insert to authenticated with check (bucket_id='academy-media' and (select public.is_admin()) and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Admins remove own academy media" on storage.objects for delete to authenticated using (bucket_id='academy-media' and (select public.is_admin()) and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
