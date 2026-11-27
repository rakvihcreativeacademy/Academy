import {redirect} from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import {configured} from '@/lib/supabase/config';
import {createAdminClient} from '@/lib/supabase/admin-server';
import {adminSignOut} from '@/actions/auth';
export const dynamic='force-dynamic';
export default async function WorkspaceLayout({children}:{children:React.ReactNode}){
 if(!configured)return <main className="section narrow admin-gate"><h1>Connect your admin workspace.</h1><p>Add the Supabase URL and public key in .env.local, run supabase/SETUP_ALL.sql, then run npm run admin:setup.</p><a href="/admin/login">Return to sign in</a></main>;
 const db=await createAdminClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/admin/login');
 const {data,error}=await db.rpc('is_admin');if(error||!data)return <main className="section narrow admin-gate"><h1>Admin access required.</h1><p>This account has not been given administrator access. Complete the SQL setup and account setup command.</p><form action={adminSignOut}><button className="button">Sign out</button></form></main>;
 return <AdminShell email={user.email??''}>{children}</AdminShell>;
}
