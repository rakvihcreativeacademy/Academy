import { redirect } from 'next/navigation';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import ProjectForm from '@/components/ProjectForm';
import Link from '@/components/SiteLink';
export default async function NewProject(){if(!configured)redirect('/login');const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login');return <main className="section"><Link href="/dashboard" className="text-link">← Back to projects</Link><h1 className="page-title my-8">Make something great.</h1><ProjectForm/></main>;}
