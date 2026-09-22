import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'
import { rateLimit } from '../../../../lib/security/rate-limit'


function validUrl(value) {

  try {

    const u = new URL(value)

    return (

      u.protocol === 'https:' &&

      (
        u.hostname === 'google.com' ||
        u.hostname.endsWith('.google.com') ||
        u.hostname === 'g.page' ||
        u.hostname === 'maps.app.goo.gl'
      )

    )

  } catch {

    return false

  }

}





export async function POST(req) {


  try {


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





    const limiter =
      await rateLimit({

        key:
        `card-update:${auth.user.id}`,

        limit:10,

        windowMs:300000

      })



    if(!limiter.allowed){


      return NextResponse.json(

        {
          error:
          'Terlalu banyak perubahan kartu. Coba lagi dalam beberapa menit.'
        },

        {
          status:429
        }

      )

    }







    const f =
      await req.formData()



    const serial =
      String(
        f.get('serial') || ''
      )
      .trim()
      .toUpperCase()



    const name =
      String(
        f.get('name') || ''
      )
      .trim()



    const url =
      String(
        f.get('url') || ''
      )
      .trim()



    const status =
      String(
        f.get('status') || ''
      )



    const reason =
      String(
        f.get('reason') || ''
      )
      .trim()






    if(
      ![
        'UNASSIGNED',
        'ACTIVE',
        'LOST'
      ].includes(status)
    ){

      return NextResponse.json(

        {
          error:'Status tidak valid.'
        },

        {
          status:400
        }

      )

    }

    const {
      data:c,
      error:cardError

    } =
    await supabaseAdmin

      .from('cards')

      .select(
        `
        id,
        serial,
        status,
        business_id
        `
      )

      .eq(
        'serial',
        serial
      )

      .maybeSingle()





    if(cardError){


      return NextResponse.json(

        {
          error:cardError.message
        },

        {
          status:500
        }

      )

    }





    if(!c){


      return NextResponse.json(

        {
          error:'Kartu tidak ditemukan.'
        },

        {
          status:404
        }

      )

    }



    // =========================
    // CEGAH KARTU LAMA KEMBALI UNASSIGNED
    // =========================

    if(
      status === 'UNASSIGNED'
      &&
      c.status !== 'UNASSIGNED'
    ){

      return NextResponse.redirect(

        new URL(

          `/admin/cards/${serial}?error=Kartu%20yang%20sudah%20digunakan%20tidak%20dapat%20dikembalikan%20menjadi%20UNASSIGNED.`,

          req.url

        )

      )

    }







    // =========================
    // AMBIL DATA BISNIS LAMA
    // =========================


    let oldBusiness = null



    if(c.business_id){


      const {

        data:b

      } = await supabaseAdmin


        .from('businesses')


        .select(
          'name,google_review_url'
        )


        .eq(
          'id',
          c.business_id
        )


        .maybeSingle()



      oldBusiness = b


    }








    // =========================
    // VALIDASI PERUBAHAN
    // =========================


    const statusChanged =
      c.status !== status



    const nameChanged =
      oldBusiness?.name !== name



    const urlChanged =
      oldBusiness?.google_review_url !== url






    if(

      reason

      &&

      !statusChanged

      &&

      !nameChanged

      &&

      !urlChanged

    ){


      return NextResponse.redirect(

        new URL(

          `/admin/cards/${serial}?error=Tidak%20ada%20perubahan%20data.%20Alasan%20tidak%20dapat%20disimpan.`,

          req.url

        )

      )

    }







    if(

     
      status === 'LOST'

      &&

      statusChanged

      &&

      !reason

    ){


      return NextResponse.redirect(

        new URL(

          `/admin/cards/${serial}?error=Alasan%20wajib%20diisi%20untuk%20status%20LOST.`,

          req.url

        )

      )

    }








    if(

      status === 'ACTIVE'

      &&

      !validUrl(url)

    ){


      return NextResponse.redirect(

        new URL(

          `/admin/cards/${serial}?error=Google%20Review%20URL%20tidak%20valid.`,

          req.url

        )

      )

    }








    let businessId =
      c.business_id








    // =========================
    // UPDATE BUSINESS
    // =========================


    if(businessId){


      const {

        error

      } = await supabaseAdmin


        .from('businesses')


        .update({

          name:
          name || 'Tanpa nama',


          google_review_url:
          url || 'https://google.com',

        })


        .eq(
          'id',
          businessId
        )





      if(error){


        return NextResponse.json(

          {
            error:error.message
          },

          {
            status:400
          }

        )

      }



    }

    else if(
      name &&
      url
    ){



      const {

        data:b,

        error

      } = await supabaseAdmin


        .from('businesses')


        .insert({

          name,

          google_review_url:url,

          status:'ACTIVE'

        })


        .select('id')


        .single()





      if(error){


        return NextResponse.json(

          {
            error:error.message
          },

          {
            status:400
          }

        )

      }



      businessId =
      b.id



    }









    // =========================
    // UPDATE CARD
    // =========================


    const {

      error:updateError

    } = await supabaseAdmin


      .from('cards')


      .update({

        business_id:
        businessId,


        status


      })


      .eq(

        'id',

        c.id

      )







    if(updateError){


      return NextResponse.json(

        {
          error:updateError.message
        },

        {
          status:400
        }

      )

    }

    // =========================
    // INSERT AUDIT LOG
    // =========================



    let auditAction =
      'UPDATE_CARD'



    if(status === 'LOST'){

      auditAction =
      'LOST_CARD'

    }





    const {

      error:logError

    } = await supabaseAdmin


      .from('card_logs')


      .insert({

        card_id:
        c.id,


        serial:
        c.serial,



        action:
        auditAction,



        old_status:
        c.status,



        new_status:
        status,



        old_business_id:
        c.business_id,



        new_business_id:
        businessId,



        old_data:{


          status:
          c.status,


          business_id:
          c.business_id,


          name:
          oldBusiness?.name || null,


          google_review_url:
          oldBusiness?.google_review_url || null


        },



        new_data:{


          status,


          business_id:
          businessId,


          name:
          name || null,


          google_review_url:
          url || null,


          reason:
          reason || null


        },



        admin_id:
        auth.user.id,



        admin_email:
        auth.user.email


      })






    if(logError){

      console.error(

        'AUDIT LOG ERROR:',

        logError

      )

    }








    return NextResponse.redirect(

      new URL(

        `/admin/cards/${serial}`,

        req.url

      )

    )







  }catch(error){



    console.error(

      'UPDATE CARD ERROR:',

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