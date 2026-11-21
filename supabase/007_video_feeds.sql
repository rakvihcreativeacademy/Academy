-- 007_video_feeds.sql
-- Homepage Video Feeds (YouTube + Instagram) managed from Admin > Video Feeds.
-- Paste into Supabase > SQL Editor and run (safe to re-run).

begin;

-- 1. Section-level visibility & headings (singleton row id = 1)
create table if not exists public.video_feed_settings (
  id integer primary key default 1 check (id = 1),
  section_enabled boolean not null default true,
  youtube_enabled boolean not null default true,
  instagram_enabled boolean not null default true,
  section_title text not null default 'Video Feeds',
  section_subtitle text not null default 'Watch studio reels, student edits, and behind-the-scenes work from RAKVIH Digital.',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

drop trigger if exists video_feed_settings_updated_at on public.video_feed_settings;
create trigger video_feed_settings_updated_at
  before update on public.video_feed_settings
  for each row execute function public.set_updated_at();

alter table public.video_feed_settings enable row level security;

drop policy if exists "Anyone reads video feed settings" on public.video_feed_settings;
create policy "Anyone reads video feed settings"
  on public.video_feed_settings for select to anon, authenticated using (true);

drop policy if exists "Admins manage video feed settings" on public.video_feed_settings;
create policy "Admins manage video feed settings"
  on public.video_feed_settings for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.video_feed_settings to anon, authenticated;
grant insert, update, delete on public.video_feed_settings to authenticated;

insert into public.video_feed_settings (id, section_enabled, youtube_enabled, instagram_enabled)
values (1, true, true, true)
on conflict (id) do nothing;

-- 2. Individual YouTube & Instagram video items
create table if not exists public.video_feeds (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('youtube', 'instagram')),
  title text not null check (char_length(title) between 1 and 160),
  url text not null check (char_length(url) between 8 and 1000),
  caption text not null default '' check (char_length(caption) <= 300),
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists video_feeds_platform_sort_idx
  on public.video_feeds (platform, sort_order asc, created_at desc);

drop trigger if exists video_feeds_updated_at on public.video_feeds;
create trigger video_feeds_updated_at
  before update on public.video_feeds
  for each row execute function public.set_updated_at();

alter table public.video_feeds enable row level security;

drop policy if exists "Anyone reads enabled video feeds" on public.video_feeds;
create policy "Anyone reads enabled video feeds"
  on public.video_feeds for select to anon, authenticated
  using (enabled = true or (select public.is_admin()));

drop policy if exists "Admins manage video feeds" on public.video_feeds;
create policy "Admins manage video feeds"
  on public.video_feeds for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.video_feeds to anon, authenticated;
grant insert, update, delete on public.video_feeds to authenticated;

commit;
