-- 006_course_status.sql
-- Backfills explicit `status` ('live' | 'upcoming') and `enabled` (true | false)
-- on every course item stored in public.site_content (key = 'courses'),
-- and relaxes course_offerings.slug so any live course can optionally have an offering row.
-- Paste into Supabase > SQL Editor and run (safe to re-run).

begin;

-- 1. Backfill status ('live' for video-editing, 'upcoming' for others) and enabled = true
--    into both draft and published JSONB for the 'courses' CMS record.
with updated as (
  select
    key,
    jsonb_set(
      draft,
      '{sections}',
      coalesce((
        select jsonb_agg(
          jsonb_set(
            sec,
            '{items}',
            coalesce((
              select jsonb_agg(
                it
                || jsonb_build_object(
                  'status',
                  coalesce(
                    it->>'status',
                    case
                      when (it->>'slug') = 'video-editing' or lower(coalesce(it->>'title', '')) like '%video editing%'
                      then 'live'
                      else 'upcoming'
                    end
                  ),
                  'enabled',
                  coalesce((it->'enabled')::boolean, true)
                )
              )
              from jsonb_array_elements(coalesce(sec->'items', '[]'::jsonb)) as it
            ), '[]'::jsonb)
          )
        )
        from jsonb_array_elements(coalesce(draft->'sections', '[]'::jsonb)) as sec
      ), '[]'::jsonb)
    ) as next_draft,
    case
      when published is null then null
      else jsonb_set(
        published,
        '{sections}',
        coalesce((
          select jsonb_agg(
            jsonb_set(
              sec,
              '{items}',
              coalesce((
                select jsonb_agg(
                  it
                  || jsonb_build_object(
                    'status',
                    coalesce(
                      it->>'status',
                      case
                        when (it->>'slug') = 'video-editing' or lower(coalesce(it->>'title', '')) like '%video editing%'
                        then 'live'
                        else 'upcoming'
                      end
                    ),
                    'enabled',
                    coalesce((it->'enabled')::boolean, true)
                  )
                )
                from jsonb_array_elements(coalesce(sec->'items', '[]'::jsonb)) as it
              ), '[]'::jsonb)
            )
          )
          from jsonb_array_elements(coalesce(published->'sections', '[]'::jsonb)) as sec
        ), '[]'::jsonb)
      )
    end as next_published
  from public.site_content
  where key = 'courses'
)
update public.site_content sc
set
  draft = u.next_draft,
  published = u.next_published,
  updated_at = now()
from updated u
where sc.key = u.key;

-- 2. (Optional) Allow course_offerings to store offerings for any course slug, not only 'video-editing'.
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'course_offerings'
      and constraint_name = 'course_offerings_slug_check'
  ) then
    alter table public.course_offerings drop constraint course_offerings_slug_check;
  end if;
end $$;

commit;
