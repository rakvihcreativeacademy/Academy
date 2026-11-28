import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import Link from '@/components/SiteLink';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Register' };

export default async function RegisterPage() {
  if (configured) {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (user) redirect('/dashboard');
  }

  return <main className="lg-page">
    <section className="lg-visual" aria-hidden="true">
      <img src="/images/banners/neon-register.jpg" alt="" />
    </section>
    <section className="lg-form" aria-labelledby="register-title">
      <div className="lg-card">
        <p className="pm-label">Student registration</p>
        <h1 id="register-title">Create your student account.</h1>
        <p className="lg-desc">Register with your email to access the student dashboard. Course enrollment is separate.</p>
        {configured ? <AuthForm registerMode /> : <p className="lg-notice" role="status">Student registration is currently unavailable.</p>}
        <div className="lg-foot">
          <span>Already have an account?</span>
          <Link href="/login" className="pm-link">Sign in</Link>
        </div>
      </div>
    </section>
  </main>;
}
