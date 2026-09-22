import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'
import MergeClient from './MergeClient'


export const dynamic = 'force-dynamic'



export default async function MergeCards(){


  const auth =
    await requireAdmin()



  if(auth.error){

    return (

      <main style={wrap}>

        <div style={card}>

          {auth.error}

        </div>

      </main>

    )

  }






  const {

    data:cards=[]

  } = await supabaseAdmin


    .from('cards')


    .select(`

      id,

      serial,

      status,


      businesses(

        name

      )

    `)


    .order(

      'serial',

      {
        ascending:true
      }

    )







  return (

    <MergeClient

      cards={cards}

    />

  )


}







const wrap={

  padding:40,

  background:'#f8fafc',

  minHeight:'100vh'

}



const card={

  background:'#fff',

  padding:30,

  borderRadius:20,

  border:'1px solid #e5e7eb',

  marginBottom:25

}