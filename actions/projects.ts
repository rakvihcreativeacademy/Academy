"use server";
import { createClient } from '@/lib/supabase/server';
import { projectSchema, type ProjectInput } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
async function session(){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('Please sign in');return {db,user};}
export async function saveProject(input:ProjectInput,id?:string){
 const parsed=projectSchema.safeParse(input);if(!parsed.success)return {error:parsed.error.issues[0].message};
 try {const {db,user}=await session();if(id&&!z.uuid().safeParse(id).success)return {error:'Invalid project'};
 let existing: {user_id:string;logo_url:string|null}|null=null;
 if(id){const {data}=await db.from('projects').select('user_id,logo_url').eq('id',id).single();if(!data)return {error:'Project not found'};existing=data;if(data.user_id!==user.id){const {data:admin}=await db.rpc('is_admin');if(!admin)return {error:'Admin access required'};}}
 if(parsed.data.logo_url&&parsed.data.logo_url!==existing?.logo_url){const prefix=`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-logos/${user.id}/`;if(!parsed.data.logo_url.startsWith(prefix))return {error:'Logo must belong to your storage folder'};}
 const query=id?db.from('projects').update(parsed.data).eq('id',id):db.from('projects').insert({...parsed.data,user_id:user.id});
 const {data,error}=await query.select().single();if(error)return {error:error.message};revalidatePath('/admin');revalidatePath('/dashboard');revalidatePath('/projects');if(id)revalidatePath(`/projects/${id}`);return {project:data};
 }catch(e){return {error:e instanceof Error?e.message:'Unable to save project'};}
}
export async function deleteProject(id:string){try{if(!z.uuid().safeParse(id).success)return {error:'Invalid project'};const {db,user}=await session();const {data:project}=await db.from('projects').select('logo_url').eq('id',id).eq('user_id',user.id).single();const {error}=await db.from('projects').delete().eq('id',id).eq('user_id',user.id);if(error)return {error:error.message};if(project?.logo_url){const prefix=`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-logos/`;const path=project.logo_url.startsWith(prefix)?project.logo_url.slice(prefix.length):'';if(path.startsWith(user.id+'/'))await db.storage.from('project-logos').remove([path]);}revalidatePath('/admin');revalidatePath('/dashboard');revalidatePath('/projects');revalidatePath(`/projects/${id}`);return {success:true};}catch(e){return {error:e instanceof Error?e.message:'Unable to delete'};}}
