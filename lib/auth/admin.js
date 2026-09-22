import { createClient } from '../supabase/server'
import { supabaseAdmin } from '../supabase/admin'


export async function requireAdmin(){

  const supabase = await createClient()


  const {
    data:{
      user
    }
  } = await supabase.auth.getUser()



  if(!user){

    return {

      error:'Unauthorized',

      status:401

    }

  }



  const {
    data:profile,
    error
  } = await supabaseAdmin

    .from('profiles')

    .select(
      'id,role,full_name'
    )

    .eq(
      'id',
      user.id
    )

    .maybeSingle()



  if(error){

    console.error(
      'ADMIN PROFILE ERROR:',
      error
    )


    return {

      error:'Terjadi kesalahan server.',

      status:500

    }

  }



  if(!profile){

    return {

      error:'Profile tidak ditemukan.',

      status:403

    }

  }




  if(profile.role !== 'admin'){

    return {

      error:'Khusus admin.',

      status:403

    }

  }



  return {

    user,

    profile

  }


}