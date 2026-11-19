import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {requireAdmin} from '@/lib/cms/server';
export const dynamic='force-dynamic';
export async function GET(){try{await requireAdmin();}catch{return new Response('Admin access required',{status:401});}const sql=await readFile(path.join(process.cwd(),'supabase/SETUP_ALL.sql'),'utf8');return new Response(sql,{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="RAKVIH_SETUP_ALL.sql"','Cache-Control':'no-store'}});}
