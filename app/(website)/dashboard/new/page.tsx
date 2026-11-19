import { redirect } from 'next/navigation';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import ProjectForm from '@/components/ProjectForm';
import Link from '@/components/SiteLink';
export default async function NewProject(){if(!configured)redirect('/login');const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');return <main className="pm-portal"><div className="pm-portal-bar"><Link href="/dashboard" className="pm-portal-back">← Back to projects</Link></div><h1 className="page-title">Make something <em>great.</em></h1><ProjectForm/></main>;}
