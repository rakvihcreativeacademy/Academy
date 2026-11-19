import { redirect, notFound } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/cms/server';
import ProjectForm from '@/components/ProjectForm';
export const metadata={title:'Edit student work',robots:{index:false}};
export default async function EditWork({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();let admin;try{admin=await requireAdmin();}catch{redirect('/admin/login?next=/admin');}const {data,error}=await admin.db.from('projects').select('*').eq('id',id).single();if(error||!data)notFound();return <main className="admin-main"><a href="/admin">← Admin panel</a><h1 className="page-title">Edit student work</h1><ProjectForm project={data} returnTo="/admin"/></main>;}
