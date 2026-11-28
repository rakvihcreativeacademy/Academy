import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import { ArrowUpRight, LockKeyhole, FolderOpen, Sparkles, Eye } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import { redirect } from 'next/navigation';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Login' };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = '' } = await searchParams;
  if (next.startsWith('/admin')) redirect('/admin/login?next=' + encodeURIComponent(next));

  if (configured) {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (user) {
      redirect(/^\/(dashboard|courses)(\/|#|$)/.test(next) ? next : '/dashboard');
    }
  }

  return <main className="lg-page">
    <section className="lg-visual" aria-hidden="true">
      <img src="/images/banners/neon-login.jpg" alt="" />
      <div className="lg-visual-copy">
        <p className="pm-label on-dark"><span className="pm-dot" /> The RAKVIH Digital creative space</p>
        <h2>Your next chapter<br /><em>starts with you.</em></h2>
        <ul>
          <li><FolderOpen size={16} /> Keep your projects and portfolio in one place</li>
          <li><Sparkles size={16} /> Submit work for the student showcase</li>
          <li><Eye size={16} /> Preview everything before it goes live</li>
        </ul>
      </div>
    </section>
    <section className="lg-form" aria-labelledby="lg-title">
      <div className="lg-card">
        <p className="pm-label"><span className="pm-dot" /> Student login</p>
        <h1 id="lg-title">Good to have you back.</h1>
        <p className="lg-desc">Sign in with your student account email and password.</p>
        {!configured && <p className="lg-notice" role="status"><LockKeyhole size={15} /> The portal is being prepared. Please contact RAKVIH Digital for account access.</p>}
        <AuthForm next={next} />
        <div className="lg-foot">
          <span>New to the student portal?</span>
          <Link href="/register" className="pm-link">Create an account <ArrowUpRight size={13} /></Link>
        </div>
        <p className="lg-secure"><LockKeyhole size={13} /> Student portal · RAKVIH Digital</p>
      </div>
    </section>
  </main>;
}
