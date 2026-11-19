import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/cms/server';
import ProjectForm from '@/components/ProjectForm';
export const metadata={title:'Add student work',robots:{index:false}};
export default async function NewWork(){try{await requireAdmin();}catch{redirect('/admin/login?next=/admin/projects/new');}return <main className="admin-main"><a href="/admin">← Admin panel</a><h1 className="page-title">Add student work</h1><ProjectForm returnTo="/admin"/></main>;}
