import type { Metadata } from 'next';
import Image from 'next/image';
import Link from '@/components/SiteLink';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import { redirect } from 'next/navigation';
import { configured } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Login' };
export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = '' } = await searchParams;
  const adminMode = next.startsWith('/admin');
  if (adminMode) redirect('/admin/login?next='+encodeURIComponent(next));
  return <main className="portal-page">
    <div className="portal-shell">
      <section className="portal-story">
        <Image src="/images/academy-photography.webp" alt="Creative photography illustration" fill priority sizes="(max-width: 800px) 100vw, 50vw" />
        <div className="portal-story-shade" />
        <div className="portal-story-top"><span className="portal-dot" />THE RAKVIH CREATIVE SPACE<span>01 / CREATE</span></div>
        <div className="portal-story-copy"><p>MAKE ROOM FOR YOUR IDEAS.</p><h1>Your next<br />chapter starts<br /><em>with you.</em></h1><p>A space for your projects, your portfolio<br />and everything you’re becoming.</p></div>
        <div className="portal-story-bottom"><span>LEARN. EXPERIMENT. CREATE.</span><ArrowUpRight size={24} /></div>
      </section>
      <section className="portal-access" aria-labelledby="portal-title">
        <div className="portal-brand"><img src="/brand/rakvih-mark-128.png" alt="" /><span>RAKVIH<small>CREATIVE ACADEMY</small></span></div>
        <div className="portal-access-body"><p className="v-eyebrow">YOUR CREATIVE JOURNEY, CONTINUED</p><h2 id="portal-title">{adminMode ? <>Your academy.<br /><em>Your control.</em></> : <>Good to have<br /><em>you back.</em></>}</h2><p className="portal-description">{adminMode ? 'Sign in with your authorised admin account.' : 'Sign in to your student or admin account.'}</p>
          {!configured && <p className="portal-notice" role="status"><LockKeyhole size={17} />The portal is being prepared. Please contact the academy for account access.</p>}
          <AuthForm next={next} adminMode={adminMode} />
          <div className="portal-apply">Ready to learn something new?<Link href="/admissions">Explore admissions <ArrowUpRight size={15} /></Link></div>
        </div>
        <p className="portal-footnote"><LockKeyhole size={13} />Your creative work. Your own secure space.</p>
      </section>
    </div>
  </main>;
}
