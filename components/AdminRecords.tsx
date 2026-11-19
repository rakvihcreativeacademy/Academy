import AdminPanel,{type Enquiry} from '@/components/AdminPanel';
import {requireAdmin} from '@/lib/cms/server';
import {adminSignOut} from '@/actions/auth';
import type {Project} from '@/lib/types';
export default async function AdminRecords({tab}:{tab:'enquiries'|'projects'}){
 const {db,user}=await requireAdmin();const [enquiries,projects]=await Promise.all([db.from('enquiries').select('*').order('created_at',{ascending:false}).limit(2000),db.from('projects').select('*').order('created_at',{ascending:false})]);
 if(enquiries.error||projects.error)return <main className="section"><h1>Complete database setup</h1><p>Run supabase/SETUP_ALL.sql to enable enquiries and student projects.</p><a href="/admin/setup">Open setup</a></main>;
 return <main className="admin-main"><AdminPanel embedded initialTab={tab} email={user.email??''} enquiries={(enquiries.data??[]) as Enquiry[]} projects={(projects.data??[]) as Project[]} signOut={adminSignOut}/></main>;
}
