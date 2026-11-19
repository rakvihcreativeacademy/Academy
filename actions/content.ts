'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/cms/server';
import { contentSchema, pageKeys } from '@/lib/cms/schema';
export async function saveContent(key: string, input: unknown, revision: number, publish: boolean) {
  try {
    const page = z.enum(pageKeys).parse(key);
    const draft = contentSchema.parse(input);
    z.number().int().nonnegative().parse(revision);
    z.boolean().parse(publish);
    if (JSON.stringify(draft).length > 500000) throw new Error('This page is too large.');
    const {db} = await requireAdmin();
    const {data,error} = await db.rpc('save_site_content', {p_key:page,p_draft:draft,p_revision:revision,p_publish:publish});
    if(error) throw new Error(error.message);
    if(publish) { revalidatePath('/'+page); revalidatePath('/admissions'); }
    return {ok:true as const,revision:data as number};
  } catch(e) {return {ok:false as const,error:e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : 'Unable to save content.'};}
}
export async function uploadContentImage(form: FormData) {
  try {
    const {db,user} = await requireAdmin();
    const file = form.get('file');
    if (!(file instanceof File) || file.size===0 || file.size>5242880) throw new Error('Choose an image up to 5 MB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
    const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
    const ext=png?'png':jpg?'jpg':webp?'webp':null;
    if(!ext) throw new Error('Use a PNG, JPG or WEBP image.');
    const path=`${user.id}/${crypto.randomUUID()}.${ext}`;
    const {error}=await db.storage.from('academy-media').upload(path,bytes,{contentType:ext==='jpg'?'image/jpeg':`image/${ext}`,upsert:false});
    if(error) throw new Error('Upload failed. Check the academy-media bucket and migration.');
    return {ok:true as const,url:db.storage.from('academy-media').getPublicUrl(path).data.publicUrl};
  }catch(e){return {ok:false as const,error:e instanceof Error?e.message:'Upload failed.'};}
}
