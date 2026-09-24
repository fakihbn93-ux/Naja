import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'


export async function GET() {


  try {


    const auth = await requireAdmin()



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






    const { data: cards, error } =

      await supabaseAdmin

      .from('cards')

      .select(`

        id,

        public_id,

        serial,

        status,

        activated_at,

        created_at,

        businesses(

          id,

          name,

          google_review_url

        ),

        events(

          id,

          method,

          created_at

        )

      `)

      .order(

        'created_at',

        {

          ascending:false

        }

      )








    if(error){


      console.error(

        'CARD LIST ERROR:',

        error

      )



      return NextResponse.json(

        {

          error:error.message

        },

        {

          status:500

        }

      )


    }









    const result = (cards || []).map(card => {



      const business =

        Array.isArray(card.businesses)

        ?

        card.businesses[0]

        :

        card.businesses







      return {


        id:
        card.id,


        public_id:
        card.public_id,


        serial:
        card.serial,


        status:
        card.status,


        activated_at:
        card.activated_at,


        created_at:
        card.created_at,




        business:


          business


          ?


          {


            id:
            business.id,


            name:
            business.name,


            google_review_url:
            business.google_review_url



          }



          :



          null



      }



    })



    const monitoring =
      (cards || [])
      .flatMap(card =>
        (card.events || []).map(event=>({

          id:event.id,

          serial:card.serial,

          event:
            event.method === 'nfc'
            ? 'NFC Tap'
            : 'QR Scan',

          created_at:event.created_at

        }))
      )
      .sort(
        (a,b)=>
        new Date(b.created_at)
        -
        new Date(a.created_at)
      )
      .slice(0,10)









    return NextResponse.json(


      {


        total:
        result.length,


        cards:
        result,

        monitoring: monitoring


      }


    )







  } catch(err){



    console.error(

      'LIST CARD SERVER ERROR:',

      err

    )



    return NextResponse.json(

      {

        error:'Terjadi kesalahan server.'

      },

      {

        status:500

      }

    )


  }


}