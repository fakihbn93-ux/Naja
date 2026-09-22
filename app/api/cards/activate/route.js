import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { rateLimit } from '../../../../lib/security/rate-limit'


function validGoogleUrl(value){

  try{

    const u = new URL(value)


    if(u.protocol !== 'https:'){
      return false
    }


    const host =
      u.hostname.toLowerCase()



    return (

      host === 'google.com' ||

      host.endsWith('.google.com') ||

      host === 'g.page' ||

      host === 'maps.app.goo.gl'

    )


  }catch{

    return false

  }

}





export async function POST(req){


try{


  // ======================
  // REDIS RATE LIMIT
  // ======================


  let ip =
    req.headers.get('x-forwarded-for')



  if(ip){

    ip =
    ip.split(',')[0].trim()

  }
  else{

    ip =
    req.headers.get('x-real-ip') ||
    'unknown'

  }





  try{


    const limiter =
      await rateLimit({

        key:
        `activate:${ip}`,

        limit:10,

        windowMs:60000

      })



    if(!limiter.allowed){


      return NextResponse.json(

        {
          error:
          'Terlalu banyak percobaan aktivasi. Silakan coba lagi nanti.'
        },

        {
          status:429
        }

      )


    }


  }catch(redisError){


    console.error(

      'REDIS RATE LIMIT ERROR:',

      redisError

    )


  }






  // ======================
  // BODY
  // ======================


  const body =
    await req.json().catch(
      ()=>null
    )



  if(!body){

    return NextResponse.json(

      {
        error:'Request tidak valid.'
      },

      {
        status:400
      }

    )

  }





  const {

    public_id,

    token,

    name,

    url

  } = body





  if(

    typeof public_id !== 'string' ||

    typeof token !== 'string' ||

    typeof name !== 'string' ||

    typeof url !== 'string'

  ){


    return NextResponse.json(

      {
        error:'Format data tidak valid.'
      },

      {
        status:400
      }

    )

  }






  const cleanPublicId =
    public_id.trim()


  const cleanToken =
    token.trim()


  const cleanName =
    name.trim()


  const cleanUrl =
    url.trim()





  if(

    !cleanPublicId ||

    !cleanToken ||

    !cleanName ||

    !cleanUrl

  ){

    return NextResponse.json(

      {
        error:'Data belum lengkap.'
      },

      {
        status:400
      }

    )

  }





  if(cleanName.length > 100){


    return NextResponse.json(

      {
        error:'Nama bisnis terlalu panjang.'
      },

      {
        status:400
      }

    )

  }





  if(!validGoogleUrl(cleanUrl)){


    return NextResponse.json(

      {
        error:
        'Gunakan URL Google Review HTTPS.'
      },

      {
        status:400
      }

    )

  }





  const db =
    supabaseAdmin





  // ======================
  // CHECK CARD
  // ======================


  const {

    data:card,

    error:cardError

  } = await db

    .from('cards')

    .select(
      'id,public_id,serial,status,setup_token'
    )

    .eq(
      'public_id',
      cleanPublicId
    )

    .eq(
      'setup_token',
      cleanToken
    )

    .maybeSingle()






  if(cardError){


    console.error(cardError)


    return NextResponse.json(

      {
        error:'Database error.'
      },

      {
        status:500
      }

    )

  }






  if(!card){


    return NextResponse.json(

      {
        error:
        'Kartu atau token setup tidak valid.'
      },

      {
        status:404
      }

    )

  }






  if(card.status !== 'UNASSIGNED'){


    return NextResponse.json(

      {
        error:
        'Kartu sudah aktif.'
      },

      {
        status:409
      }

    )

  }

  // ======================
  // CREATE BUSINESS
  // ======================


  const {

    data:business,

    error:businessError

  } = await db

    .from('businesses')

    .insert({

      name:cleanName,

      google_review_url:cleanUrl

    })

    .select('id')

    .single()





  if(businessError){


    console.error(
      businessError
    )


    return NextResponse.json(

      {
        error:
        'Gagal membuat bisnis.'
      },

      {
        status:500
      }

    )

  }





  // ======================
  // ACTIVATE CARD
  // ======================


  const {

    data:update,

    error:updateError

  } = await db

    .from('cards')

    .update({

      business_id:
      business.id,


      status:
      'ACTIVE',


      activated_at:
      new Date().toISOString(),


      setup_token:null

    })

    .eq(
      'id',
      card.id
    )

    .eq(
      'status',
      'UNASSIGNED'
    )

    .select('id')

    .maybeSingle()





  if(updateError || !update){


    await db

      .from('businesses')

      .delete()

      .eq(
        'id',
        business.id
      )



    return NextResponse.json(

      {
        error:
        'Kartu gagal diaktifkan atau sudah digunakan.'
      },

      {
        status:409
      }

    )

  }







  // ======================
  // INSERT AUDIT TRAIL
  // ======================


  const {

    error:logError

  } = await db

    .from('card_logs')

    .insert({

      card_id:
      card.id,


      serial:
      card.serial,


      action:
      'ACTIVATE_CARD',



      old_status:
      'UNASSIGNED',



      new_status:
      'ACTIVE',



      old_business_id:
      null,



      new_business_id:
      business.id,



      old_data:{

        status:
        'UNASSIGNED',

        business_id:
        null,

        name:
        null,

        google_review_url:
        null

      },



      new_data:{

        status:
        'ACTIVE',

        business_id:
        business.id,

        name:
        cleanName,

        google_review_url:
        cleanUrl

      },



      admin_id:
      null,


      admin_email:
      'CUSTOMER_ACTIVATION'


    })





  if(logError){

    console.error(

      'ACTIVATE AUDIT ERROR:',

      logError

    )

  }







  const app =
    process.env.NEXT_PUBLIC_APP_URL ||
    new URL(req.url).origin






  return NextResponse.json({

    message:
    'Kartu berhasil diaktifkan.',


    businessName:
    cleanName,


    customerUrl:
    `${app}/r/${card.public_id}?method=nfc`

  })







}catch(error){


 console.error(

  'ACTIVATE ERROR:',

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