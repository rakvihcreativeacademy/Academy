import type { Metadata } from 'next';
import { LockKeyhole, LayoutDashboard, Inbox, FolderOpen, ArrowUpRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
export const metadata: Metadata = { title: 'Admin login' };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next && /^\/admin(?:\/|$)/.test(params.next) && !params.next.startsWith('/admin/login') ? params.next : '/admin';
  if (configured) { const db = await createClient(); const { data: { user } } = await db.auth.getUser(); if (user) { const { data } = await db.rpc('is_admin'); if (data) redirect(next); } }
  return <main className="al-page">
    <section className="al-visual" aria-hidden="true">
      <img src="/images/academy-studio.webp" alt="" />
      <div className="al-visual-top"><img src="/brand/rakvih-mark-128.png" alt="" /><span className="wb-name"><b>Rakvih <i>Digital</i></b><small>Admin console</small></span></div>
      <div className="al-visual-copy">
        <p className="al-kicker"><i /> Workspace</p>
        <h2>Run RAKVIH Digital<br /><em>from one calm place.</em></h2>
        <ul>
          <li><LayoutDashboard size={16} /> Publish pages for courses, studio, production and careers</li>
          <li><Inbox size={16} /> Follow up on every admission and studio enquiry</li>
          <li><FolderOpen size={16} /> Approve and showcase student work</li>
        </ul>
      </div>
    </section>
    <section className="al-form" aria-labelledby="admin-login-title">
      <div className="al-card">
        <p className="al-kicker dark"><i /> Authorised access</p>
        <h1 id="admin-login-title">Welcome back.</h1>
        <p className="al-desc">Sign in to manage the RAKVIH Digital website, enquiries and student showcase.</p>
        {!configured && <p className="al-notice">Connect Supabase and complete admin setup to enable sign-in.</p>}
        <AuthForm next={next} adminMode />
        <p className="al-note"><LockKeyhole size={13} /> Only authorised RAKVIH Digital administrators can enter.</p>
      </div>
      <a className="al-back" href="/">Back to website <ArrowUpRight size={14} /></a>
    </section>
  </main>;
}
