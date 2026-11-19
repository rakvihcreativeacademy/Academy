// Local setup command only. Never import this file into the Next.js application.
import { existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const { NEXT_PUBLIC_SUPABASE_URL:url, NEXT_PUBLIC_SUPABASE_ANON_KEY:anon, SUPABASE_SERVICE_ROLE_KEY:secret, ADMIN_EMAIL:email, ADMIN_PASSWORD:password }=process.env;
async function setup(){
  if(!url||!anon||!secret||!email||!password)throw new Error('Fill SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local, then rerun npm run admin:setup.');
  if(password.length<12)throw new Error('Use an admin password with at least 12 characters.');
  const options={auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}};
  const db=createClient(url,secret,options);
  const {error:schemaError}=await db.from('admins').select('user_id').limit(1);
  if(schemaError)throw new Error('Run supabase/SETUP_ALL.sql first and verify the server-only service-role/secret key.');
  let user=null;
  for(let page=1;!user;page++){
    const {data,error}=await db.auth.admin.listUsers({page,perPage:1000});
    if(error)throw new Error('Cannot access Auth Admin API. Check SUPABASE_SERVICE_ROLE_KEY.');
    user=data.users.find(u=>u.email?.toLowerCase()===email.toLowerCase())??null;
    if(data.users.length<1000)break;
  }
  if(user){
    // Verify ownership without replacing an existing account's password.
    const verifier=createClient(url,anon,options);
    const {error}=await verifier.auth.signInWithPassword({email,password});
    if(error)throw new Error('This email already exists with different credentials or needs confirmation. Use its current password in ADMIN_PASSWORD; this script will not reset it.');
    await verifier.auth.signOut();
  }else{
    const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true});
    if(error)throw new Error(`Admin account could not be created: ${error.message}`);
    user=data.user;
  }
  if(!user)throw new Error('No admin account returned.');
  const {error}=await db.from('admins').upsert({user_id:user.id},{onConflict:'user_id'});
  if(error)throw new Error('Account exists, but admin membership failed. Run SETUP_ALL.sql and retry this command.');
  console.log(`Admin account ready: ${email}`);
  console.log('Login: http://localhost:3000/admin/login');
  console.log('Use ADMIN_PASSWORD from .env.local. No password was written to public code.');
}
setup().catch(error=>{console.error(error.message);process.exitCode=1;});
