import { NextResponse } from 'next/server'

import { supabaseAdmin } from '../../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../../lib/auth/admin'



export async function GET(){


  try{


    const auth =
      await requireAdmin()



    if(auth.error){

      return NextResponse.json(

        {
          error:auth.error
        },

        {
          status:auth.status
        }

      )

    }





    const {data:cards,error}=

    await supabaseAdmin

    .from('cards')

    .select(`

      id,

      serial,

      status,

      businesses(

        name

      ),

      events(

        id,

        method,

        created_at

      )

    `)

    .order(

      'serial',

      {
        ascending:true
      }

    )






    if(error){

      console.error(error)


      return NextResponse.json(

        {
          error:error.message
        },

        {
          status:500
        }

      )

    }





    const result = cards.map(card=>{


      const events =
        (card.events || [])
        .filter(
          e =>
          e.method === 'nfc'
          ||
          e.method === 'qr'
        )



      const sortedEvents =

        [...events]

        .sort(

          (a,b)=>

          new Date(b.created_at)
          -
          new Date(a.created_at)

        )





      return {

        serial:
        card.serial,


        status:
        card.status,



        store:

        card.businesses?.name || '-',



        total:

        events.length,



        lastScan:

        sortedEvents[0]?.created_at || null,



        nfc:

        events.filter(

          e=>e.method==='nfc'

        ).length,



        qr:

        events.filter(

          e=>e.method==='qr'

        ).length


      }


    })






    return NextResponse.json(

      {

        total:
        result.length,


        cards:
        result

      }

    )





  }catch(error){


    console.error(

      'MONITORING ERROR',

      error

    )



    return NextResponse.json(

      {
        error:'Server error'
      },

      {
        status:500
      }

    )


  }


}