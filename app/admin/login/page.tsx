import type { Metadata } from 'next';
import { ShieldCheck, LayoutDashboard, Inbox, FolderOpen, ArrowUpRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/AdminLoginForm';
import AdminClock from '@/components/AdminClock';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
export const metadata: Metadata = { title: 'Admin login' };

const desks = [
  { icon: LayoutDashboard, t: 'Website', d: 'Pages, courses & banners' },
  { icon: Inbox, t: 'Enquiries', d: 'Admissions, studio & production' },
  { icon: FolderOpen, t: 'Showcase', d: 'Review and publish student work' },
];

/** Admin sign-in as a broadcast "control room": viewfinder backdrop, live status bar, focus-locked glass card. */
export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next && /^\/admin(?:\/|$)/.test(params.next) && !params.next.startsWith('/admin/login') ? params.next : '/admin';
  if (configured) { const db = await createClient(); const { data: { user } } = await db.auth.getUser(); if (user) { const { data } = await db.rpc('is_admin'); if (data) redirect(next); } }
  return <main className="al2">
    <div className="al2-bg" aria-hidden="true"><img src="/images/hero-viewfinder.webp" alt="" /><i className="al2-orb a" /><i className="al2-orb b" /><i className="al2-grid" /></div>

    <header className="al2-bar">
      <a href="/" className="al2-brand" aria-label="RAKVIH Digital website">
        <img src="/brand/rakvih-mark-128.png" alt="" width={36} height={36} />
        <span><b>Rakvih <i>Digital</i></b><small>Admin console</small></span>
      </a>
      <div className="al2-status">
        <span className="al2-live"><i />{configured ? 'Systems online' : 'Setup required'}</span>
        <AdminClock />
      </div>
    </header>

    <section className="al2-main">
      <div className="al2-copy">
        <p className="al2-kicker"><i /> Control room</p>
        <h1 className="al2-title">Run the whole studio<br /><em>from one calm place.</em></h1>
        <p className="al2-lede">Publish pages, answer every enquiry and spotlight student work — the RAKVIH Digital website, managed in one secure workspace.</p>
        <ul className="al2-desks">
          {desks.map(({ icon: Icon, t, d }, i) => <li key={t} style={{ '--i': i } as React.CSSProperties}><span className="ic"><Icon size={18} /></span><span><b>{t}</b><small>{d}</small></span></li>)}
        </ul>
      </div>

      <div className="al2-cardwrap">
        <i className="al2-af tl" /><i className="al2-af tr" /><i className="al2-af bl" /><i className="al2-af br" />
        <div className="al2-card" aria-labelledby="al2-h">
          <div className="al2-card-head">
            <span className="al2-seal"><img src="/brand/rakvih-mark-128.png" alt="RAKVIH" width={34} height={34} /></span>
            <div>
              <p className="al2-kicker dim"><i /> Authorised access</p>
              <h2 id="al2-h">Admin sign in</h2>
            </div>
          </div>
          <p className="al2-desc">Use your administrator email and password to enter the console.</p>
          {!configured && <p className="al2-notice">Connect Supabase and complete the admin setup to enable sign-in.</p>}
          <AdminLoginForm next={next} disabled={!configured} />
          <p className="al2-secure"><ShieldCheck size={14} /> Encrypted session · Authorised administrators only</p>
        </div>
      </div>
    </section>

    <footer className="al2-foot">
      <span>© {new Date().getFullYear()} RAKVIH Solutions Pvt. Ltd.</span>
      <a href="/">Back to website <ArrowUpRight size={14} /></a>
    </footer>
  </main>;
}
