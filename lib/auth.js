import {redirect} from 'next/navigation'
import {supabaseServer} from './supabase/server'
export async function requireAdmin(){
 const sb=await supabaseServer();
 const {data:{user}}=await sb.auth.getUser();
 if(!user) redirect('/login')
 const {data:profile}=await sb.from('profiles').select('role').eq('id',user.id).maybeSingle();
 if(profile?.role!=='admin') return {sb,user,forbidden:true};
 return {sb,user,forbidden:false}
}
