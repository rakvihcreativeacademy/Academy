import type { Metadata } from 'next';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
export const metadata:Metadata={title:'Admin login'};
export default async function AdminLogin({searchParams}:{searchParams:Promise<{next?:string}>}) {
  const params=await searchParams;
  const next=params.next&&/^\/admin(?:\/|$)/.test(params.next)&&!params.next.startsWith('/admin/login')?params.next:'/admin';
  if(configured){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(user){const {data}=await db.rpc('is_admin');if(data)redirect(next);}}
  return <main className="admin-login-page"><section className="admin-login-card" aria-labelledby="admin-login-title"><span className="admin-login-symbol"><ShieldCheck size={25} strokeWidth={1.5}/></span><p className="v-eyebrow">AUTHORISED ACCESS</p><h1 id="admin-login-title">Your academy.<br/><em>Your workspace.</em></h1><p className="admin-login-description">Sign in to manage courses, studio services, production, student work and careers.</p>{!configured&&<p className="notice">Connect Supabase and complete admin setup to enable sign-in.</p>}<AuthForm next={next} adminMode/><p className="admin-login-note"><LockKeyhole size={13}/>Only authorised academy administrators can enter.</p></section><span className="admin-login-caption">RAKVIH Creative Academy · Administration</span></main>;
}
