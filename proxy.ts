import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseFetch } from '@/lib/supabase/fetch';
import { configured } from '@/lib/supabase/config';
import { ADMIN_AUTH_COOKIE } from '@/lib/supabase/admin-cookie';
export async function proxy(request:NextRequest) {
 let response=NextResponse.next({request});
 if(!configured) return response;
 const isAdminPath=request.nextUrl.pathname.startsWith('/admin');
 const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{fetch:supabaseFetch},...(isAdminPath?{cookieOptions:{name:ADMIN_AUTH_COOKIE}}:{}),cookies:{getAll:()=>request.cookies.getAll(),setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 await client.auth.getUser();return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)']};
