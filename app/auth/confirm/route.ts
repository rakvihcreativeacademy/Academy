import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(request:NextRequest){const token_hash=request.nextUrl.searchParams.get('token_hash');const type=request.nextUrl.searchParams.get('type') as EmailOtpType|null;if(token_hash&&type){const db=await createClient();const {error}=await db.auth.verifyOtp({token_hash,type});if(!error)return NextResponse.redirect(new URL('/dashboard',request.url));}return NextResponse.redirect(new URL('/login',request.url));}
