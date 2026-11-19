import { redirect } from 'next/navigation';
import ContentEditor from '@/components/ContentEditor';
import { configured } from '@/lib/supabase/config';
import { requireAdmin } from '@/lib/cms/server';
import { contentSchema, pageKeys, type PageKey, type ContentRecord } from '@/lib/cms/schema';
export const dynamic='force-dynamic';
export const metadata={title:'Website content manager',robots:{index:false,follow:false}};
export default async function ContentPage({searchParams}:{searchParams:Promise<{page?:string}>}){
  const {page}=await searchParams;
  const initialPage=pageKeys.includes(page as PageKey)?page as PageKey:'courses';
  let records:ContentRecord[]=[];
  if(configured){
    let admin;try{admin=await requireAdmin();}catch{redirect('/admin/login?next=/admin/content');}
    const {data,error}=await admin.db.rpc('admin_content');
    if(error)return <main className="section narrow admin-gate"><h1>Content setup required</h1><p>Run supabase/SETUP_ALL.sql in the Supabase SQL editor, then reload.</p><a href="/admin">Back to admin</a></main>;
    records=(data??[]) as ContentRecord[];
    for(const row of records) contentSchema.parse(row.draft);
  }
  return <main className="cms-main"><ContentEditor key={initialPage} records={records} connected={configured} initialPage={initialPage} embedded/></main>;
}
