import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'



export async function POST(req){


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






    const body =
      await req.json()



    const {

      mainCardId,

      mergeCardIds

    } = body





    if(

      !mainCardId ||

      !Array.isArray(mergeCardIds) ||

      mergeCardIds.length === 0

    ){


      return NextResponse.json(

        {
          error:
          'Kartu utama dan kartu gabungan wajib dipilih.'
        },

        {
          status:400
        }

      )

    }








    // ======================
    // AMBIL KARTU UTAMA
    // ======================


    const {

      data:mainCard,

      error:mainError

    } = await supabaseAdmin


      .from('cards')


      .select(

        `
        id,
        serial,
        business_id
        `

      )


      .eq(

        'id',

        mainCardId

      )


      .maybeSingle()





    if(mainError || !mainCard){


      return NextResponse.json(

        {
          error:
          'Kartu utama tidak ditemukan.'
        },

        {
          status:404
        }

      )

    }







    if(!mainCard.business_id){


      return NextResponse.json(

        {
          error:
          'Kartu utama belum memiliki toko.'
        },

        {
          status:400
        }

      )

    }








    // ======================
    // AMBIL KARTU TARGET
    // ======================


    const {

      data:mergeCards=[]

    } = await supabaseAdmin


      .from('cards')


      .select(

        `
        id,
        serial,
        business_id
        `

      )


      .in(

        'id',

        mergeCardIds

      )







    if(!mergeCards.length){


      return NextResponse.json(

        {
          error:
          'Tidak ada kartu yang digabungkan.'
        },

        {
          status:400
        }

      )

    }








    // ======================
    // UPDATE BUSINESS ID
    // ======================


    const {

      error:updateError

    } = await supabaseAdmin


      .from('cards')


      .update({

        business_id:
        mainCard.business_id

      })


      .in(

        'id',

        mergeCardIds

      )







    if(updateError){


      return NextResponse.json(

        {
          error:updateError.message
        },

        {
          status:500
        }

      )

    }







    // ======================
    // AUDIT LOG
    // ======================


    await supabaseAdmin


      .from('card_logs')


      .insert({

        card_id:
        mainCard.id,


        serial:
        mainCard.serial,


        action:
        'MERGE_CARD',


        old_status:
        null,


        new_status:
        null,


        old_data:{


          merged_cards:

          mergeCards.map(

            c=>c.serial

          )

        },



        new_data:{


          target_card:
          mainCard.serial,


          business_id:
          mainCard.business_id


        },



        admin_id:
        auth.user.id,


        admin_email:
        auth.user.email


      })







    return NextResponse.json(

      {

        message:
        'Kartu berhasil digabungkan.',


        target:
        mainCard.serial,


        merged:

        mergeCards.map(

          c=>c.serial

        )

      }

    )





  }catch(error){


    console.error(

      'MERGE CARD ERROR:',

      error

    )


    return NextResponse.json(

      {
        error:
        'Terjadi kesalahan server.'
      },

      {
        status:500
      }

    )


  }


}