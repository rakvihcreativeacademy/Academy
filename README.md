# RAKVIH Creative Academy

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 and Supabase. All source lives directly in the requested workspace; there is no enclosing project subfolder.

## Run locally

1. Install Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project settings. Use the public anon key, never the service-role key.
5. Execute `supabase/migrations/001_initial.sql` once in the Supabase SQL Editor on a new project.
6. Enable email/password authentication. Set Site URL to your application origin and allow your development and production origins in Auth URL Configuration. For SSR email confirmation, change the confirmation template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`.
7. Run `npm run dev` and open http://localhost:3000.
8. Sign up at `/login`, confirm your email and sign in. Create and publish projects from `/dashboard`.

Without environment variables the public academy site renders and the portal shows setup instructions. Enquiries explicitly report that they are not connected; no fake submissions or fake dashboard data are used.

## Routes

- `/`: academy, eight courses, studio, about, production and admission enquiry.
- `/admissions`: course enquiry; `?type=studio` and `?type=production` select service forms.
- `/login`: sign in / sign up.
- `/dashboard`: authenticated project metrics, search, filters, grid/list view, quick edit and optimistic deletion.
- `/dashboard/new`: split form and live preview.
- `/projects`: public published work.
- `/projects/[slug]`: public project details; slug is the immutable project UUID, preserving the requested table schema.
- `/auth/confirm`: email confirmation.

## Storage and access

RLS enforces ownership for mutations. Published projects are readable by everyone, including signed-in visitors. Dashboard queries additionally filter by owner. Logos are public by requirement, even for draft projects. Uploads accept PNG, JPG, SVG and WEBP up to 2MB with per-user paths and random filenames. SVGs are rendered only as external images, never injected into HTML.

A replaced saved logo is removed after a successful project save, so a failed save cannot break an existing project's logo. Uploads that are abandoned before saving can leave unused objects; periodically remove unreferenced uploads in Storage. Upload progress is an indeterminate progress indicator because the Supabase upload API does not expose byte progress.

Descriptions use Markdown with a rendered live preview. Raw HTML is not enabled. Zod validates project input on client and server. Server Actions verify the authenticated user and scope database writes to that user.

Enquiries support insert-only anonymous access. They cannot be read, modified or deleted by application visitors; academy administrators review them in Supabase. Before a public launch, add infrastructure rate limiting/CAPTCHA for public enquiries and authentication, configure SMTP, review privacy/retention requirements, and test against your actual Supabase instance.

## Brand assets and supplied content

The pasted academy brief supplied the page copy. Document content is treated as reference material, not operational instructions. Contact email, phone, course prices and schedules were not invented. The official logo was downloaded from https://rakvih.in/assets/images/logo.png after resolving the supplied Google share link and is used in the header. It is saved as `public/rakvih-logo.png`. The hero aperture is a decorative code-based illustration. The separate RAKVIH Digital PDF has not been used for academy claims.

## Production

Run `npm run typecheck` and `npm run build`; deploy to a Node-compatible Next.js host such as Vercel. Add the two public environment variables in the host, run the SQL migration in Supabase and update the authentication origin/confirmation URL. No Supabase secrets are embedded in source. Production backend verification requires your own configured Supabase project.

## Folder structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  not-found.tsx
  admissions/page.tsx
  auth/confirm/route.ts
  dashboard/page.tsx
  dashboard/new/page.tsx
  login/page.tsx
  projects/page.tsx
  projects/[slug]/page.tsx
actions/
  auth.ts
  enquiries.ts
  projects.ts
components/
  AuthForm.tsx
  BrandCard.tsx
  Dashboard.tsx
  EnquiryForm.tsx
  Header.tsx
  LogoUploader.tsx
  ProjectForm.tsx
  Providers.tsx
lib/
  courses.ts
  types.ts
  validation.ts
  supabase/client.ts
  supabase/config.ts
  supabase/server.ts
supabase/migrations/001_initial.sql
.env.example
.gitignore
next.config.ts
package.json
package-lock.json
postcss.config.mjs
proxy.ts
tsconfig.json
README.md
```

## Enquiries → WhatsApp

Every enquiry form (home, admissions, podcast studio, production, contact) validates the details, stores them for the admin panel when Supabase is connected, then opens WhatsApp with the details pre-filled to **+91 82963 92047**. Change the number, email, website and social links in `lib/site.ts`.

## Admin panel (`/admin`)

1. Complete "Run locally" steps 1–6 above, then also run `supabase/migrations/002_admin.sql` in the Supabase SQL Editor.
2. Sign up at `/login` and confirm your email.
3. Make yourself admin (SQL Editor): `insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';`
4. Open `/admin` — view, search and filter all enquiries, set status (new / contacted / enrolled / closed), add notes, reply on WhatsApp, call or email, export CSV, and publish / unpublish / delete student projects.

## Bright editorial design update

The homepage uses custom-generated illustrations, warm paper tones, orange accents, an accessible course filter and responsive editorial layouts. All existing app, admin, enquiry and course routes are preserved. Generated assets live in `public/images/academy-filmmaking.png`, `public/images/academy-editing.png` and `public/images/academy-studio.png`. These are illustrative concepts, not photos of real academy facilities.

Created using the built-in Imagegen tool. Prompts: (1) candid editorial photograph of three young adult Indian film students collaborating on a professional camera rig in a warm sunlit creative space; (2) premium empty podcast studio with caramel leather chairs, professional boom microphones, acoustic panels, olive walls and warm wood; (3) Indian woman video editor at a walnut desk with dual video timeline and grading monitors, warm daylight and natural materials. All prompts specify photorealism, natural proportions, no logos, no watermarks and landscape composition.

A fourth generated asset, `public/images/academy-photography.png`, gives the photography programme its own visual. Prompt: candid editorial portrait of a young adult Indian woman photographer with DSLR in a warm sunlit photography studio, olive clothing, earthy cream and ochre palette, realistic hands and camera, no text, logos or watermark. All four original generated PNGs are included in the project.

## Official brand palette and complete course imagery

The site now uses the official olive `#4F5723` and yellow `#FCCC0F` consistently across the homepage, header, footer, course curriculum, studio and form controls. Styling is in `app/brand-system.css`. `lib/course-images.ts` maps all eight courses to distinct images, shared by the homepage and course detail panels.

Five additional course photographs were generated with built-in Imagegen and saved under `public/images/course-*.png`. Prompts describe: (1) Indian cinematographer adjusting a professional cinema camera; (2) Indian motion designer with animation monitors and pen tablet; (3) studio technician with LED softbox and audio mixer; (4) Indian digital creator recording on a vertical smartphone; (5) creative professional using an AI visual production workstation. Shared constraints: photoreal editorial style, natural hands and equipment, olive/yellow accents, landscape composition, no logos, no readable text or watermark. These are illustrative images, not documentation of actual facilities.

## Navigation compatibility

Page links use ordinary anchors through `components/SiteLink.tsx`, avoiding the Next.js 16.4.6 streamed-navigation path that can emit the conditional-use suspension warning. Page changes reload the document; fragment links, query strings, browser back/forward and opening links in new tabs retain native behaviour. The application remains a Next.js App Router application. The global animation layer no longer mutates server-rendered reveal classes before hydration, preventing the observed class mismatch on streamed pages.
