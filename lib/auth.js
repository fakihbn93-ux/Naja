import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'

export async function requireAdmin() {
  const sb = await createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    sb,
    user,
    forbidden: profile?.role !== 'admin',
  }
}