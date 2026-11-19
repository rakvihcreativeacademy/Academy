import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { configured } from '@/lib/supabase/config';
import Dashboard from '@/components/Dashboard';
import { signOut } from '@/actions/auth';
export default async function DashboardPage(){if(!configured)redirect('/login');const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');const {data,error}=await db.from('projects').select('*').eq('user_id',user.id).order('created_at',{ascending:false});if(error)throw new Error('Unable to load your projects. Verify the SQL migration has been applied.');return <main className="section"><div className="flex justify-end mb-8"><form action={signOut}><button className="text-link">Sign out · {user.email}</button></form></div><Dashboard projects={data||[]}/></main>;}
