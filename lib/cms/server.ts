import 'server-only';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import { contentSchema, type PageKey } from './schema';
import { defaultContent } from './defaults';
export async function getPageContent(key: PageKey) {
  if (!configured) return defaultContent[key];
  const db = createPublicClient();
  const { data, error } = await db.from('site_content').select('published').eq('key', key).maybeSingle();
  if (error) { if (error.code === '42P01' || error.code === 'PGRST205') return defaultContent[key]; throw new Error('Page content could not be loaded.'); }
  const result = contentSchema.safeParse(data?.published);
  return result.success ? result.data : defaultContent[key];
}
export async function requireAdmin() {
  if (!configured) throw new Error('Add Supabase credentials to .env.local first.');
  const db = await createClient();
  const {data:{user}} = await db.auth.getUser();
  if (!user) throw new Error('Please sign in with your admin account.');
  const {data,error} = await db.rpc('is_admin');
  if (error || !data) throw new Error('Admin access is required.');
  return { db, user };
}
