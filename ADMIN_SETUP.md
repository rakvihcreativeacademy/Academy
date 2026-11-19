# RAKVIH: one-file database and admin setup

## 1. Run one SQL file

Open `supabase/SETUP_ALL.sql`. Copy the entire file into your Supabase project's SQL Editor and click Run.

This is the combined setup for tables, projects, enquiries, admins, page content, RLS, functions and both storage buckets. It supports a fresh project or an existing installation of migrations 001–003 without deleting records. Run this file instead of running the separate migrations. It does not create Auth users or reset passwords.

## 2. Create the admin account

The local `.env.local` file now includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your-existing-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-existing-public-key
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=admin@rakvih.in
ADMIN_PASSWORD=your-generated-password-already-in-env-local
```

Keep the existing URL and public key. Fill `SUPABASE_SERVICE_ROLE_KEY` with the Supabase secret key or legacy service_role key from your project's API keys settings. Never prefix this key with NEXT_PUBLIC, commit it, or paste it into browser code. It is used only by the local setup command.

From the project root, run:

```sh
npm run admin:setup
```

This command creates the configured Auth user with confirmed email and grants admin membership. It uses the official server-only Supabase Auth Admin API, rather than writing directly into Auth's internal tables. See https://supabase.com/docs/reference/javascript/auth-admin-createuser.

If the email already exists, the command verifies its current password before granting access; it never overwrites an existing password. If you created an account with a different password, put that current password in ADMIN_PASSWORD. If admin membership fails after account creation, fix the SQL setup and rerun the command.

The script prints `Admin account ready` only when setup succeeds. Until then, the generated credentials are a configuration, not an active account. After success you may remove SUPABASE_SERVICE_ROLE_KEY and ADMIN_PASSWORD from .env.local; normal login uses Supabase Auth, not a hardcoded password comparison.

## 3. Sign in

Open http://localhost:3000/admin/login. Use ADMIN_EMAIL and ADMIN_PASSWORD from `.env.local`. Restart `npm run dev` after changing the public Supabase environment variables. If the dev server is already running, stop it with Ctrl+C before starting another.

No credentials appear in public browser code. `.env.local` is ignored by Git.

## Admin panel pages

| URL | Features |
| --- | --- |
| `/admin` | Enquiries, filters, notes, statuses, CSV export and project approvals |
| `/admin/content` | Courses, Podcast Studio, Production, Student Work page content and Careers |
| `/admin/projects/new` | Add student work, logo, description, category and visibility |
| `/admin/projects/PROJECT_UUID` | Edit student-submitted or admin-created projects |

Edit banner text/images, sections, cards, curricula, details and links. Add/remove/reorder items. Save draft keeps changes private; Publish page updates the website. View page opens the current published page. Concurrent edits trigger a save conflict instead of silently overwriting another editor's changes.

Use JPG, PNG or WEBP images up to 5 MB. Local /paths, #anchors and HTTPS links are supported. Replaced images remain in Storage to preserve published pages and drafts; review unused media before deleting it.

Courses can include duration, fees and batch timings in their detail lists. Published course titles populate the managed enquiry forms and Apply selector. Genuine student work is added/approved in Projects; page text is edited in Content. Career roles or current opportunities can include descriptions and an application link. Home promotional content is separate from these five editors.

## Verify after setup

- Save a draft and confirm the public page stays unchanged; publish and verify the update.
- Upload an image and verify it displays after publishing.
- Add a course and confirm it appears in Courses and the Apply selector.
- Publish student work and open its detail page; archive it and confirm it disappears.
- Sign out and verify protected admin routes require authentication.
- Verify an ordinary account cannot save content, grant itself admin membership or upload academy media.
- Submit a real enquiry and confirm it reaches the panel and opens WhatsApp as intended.

Local syntax and content checks do not replace these live database checks. Database provisioning and login become usable only after you complete steps 1–2.

## Separate admin folder and layout

All admin routes are in `app/admin/`, with their own `layout.tsx`, `admin.css` and `login/page.tsx`. Authenticated screens share `app/admin/(workspace)/layout.tsx`, which supplies the sidebar and mobile navigation. Public pages are grouped in `app/(website)/`, whose layout contains the website navigation, footer, loader and WhatsApp button. Route groups do not change public URLs. The root layout only supplies shared fonts, CSS and providers.

Use `/admin/login` for admin sign-in and `/login` for student sign-in. Admin sign-out returns to `/admin/login`.

## Dashboard and mobile navigation

`/admin` is now the dashboard, with counts and direct cards for all five content modules. The desktop top header has been removed; navigation lives in one persistent sidebar. On mobile, use **Admin menu** to open the navigation drawer.

- `/admin/content?page=courses`: add/edit courses, photos and curriculum.
- `/admin/content?page=podcast-studio`: studio facilities, services and photos.
- `/admin/content?page=production`: production services and workflow.
- `/admin/content?page=projects`: Student Work page copy and images.
- `/admin/student-work`: create/edit student projects, approve, publish, archive or delete.
- `/admin/content?page=careers`: career paths and opportunities.
- `/admin/enquiries`: search, follow up, edit notes/statuses and export.
- `/admin/setup`: database status plus full SQL copy/download controls.

The same `supabase/SETUP_ALL.sql` supports this dashboard; no additional migration is needed for the navigation changes. The SQL download is available only to authorised admins. Uploading a photo changes a draft field; publish the page to make it live.
