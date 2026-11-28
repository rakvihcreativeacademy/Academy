-- Run in the Supabase SQL Editor after creating a test student account.
-- This read-only query checks recent portal accounts and their access.
select u.email,
       u.created_at,
       u.email_confirmed_at,
       exists (
         select 1 from public.admins a where a.user_id = u.id
       ) as has_admin_access
from auth.users u
where u.raw_user_meta_data ->> 'registration_source' = 'student_portal'
order by u.created_at desc
limit 20;
