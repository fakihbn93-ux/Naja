import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase/admin'


export async function GET(req, { params }) {


  const { public_id } = await params


  const url = new URL(req.url)


  const method =
    url.searchParams.get('method') === 'qr'
      ? 'qr'
      : 'nfc'





  let { data: card, error } = await supabaseAdmin
    .from('cards')
    .select(`
      id,
      public_id,
      serial,
      status,
      setup_token,
      businesses(
        google_review_url
      )
    `)
    .eq('public_id',
        public_id)
    .maybeSingle()



  // =============================
  // LEGACY SERIAL FALLBACK
  // =============================

  if(!card && !error){

    const result =
      await supabaseAdmin
        .from('cards')
        .select(`
          id,
          public_id,
          serial,
          status,
          setup_token,
          businesses(
            google_review_url
          )
        `)
        .eq(
          'serial',
          public_id
        )
        .maybeSingle()


      card = result.data

      error = result.error

    }



  if (error) {

    console.error(
      'CARD REDIRECT ERROR:',
      error
    )

    return new NextResponse(
      'Terjadi kesalahan server.',
      {
        status:500
      }
    )

  }





  if (!card) {

    return new NextResponse(
      'Kartu tidak ditemukan.',
      {
        status:404
      }
    )

  }





  /*
  =================================
  KARTU BELUM AKTIF
  NFC / QR UNTUK SETUP
  =================================
  */


  if(card.status === 'UNASSIGNED'){


    if(!card.setup_token){


      return new NextResponse(

        'Token setup kartu tidak tersedia.',

        {
          status:409
        }

      )

    }






    await supabaseAdmin

      .from('events')

      .insert({

        card_id:card.id,

        method:'setup',

        user_agent:
          req.headers.get('user-agent') || null,


        referer:
          req.headers.get('referer') || null

      })







    const base =

      process.env.NEXT_PUBLIC_APP_URL ||

      url.origin






    return NextResponse.redirect(

      `${base}/setup/${card.public_id}?token=${encodeURIComponent(card.setup_token)}`,

      307

    )


  }









  /*
  =================================
  KARTU ACTIVE
  NFC / QR KE GOOGLE REVIEW
  =================================
  */





  if(

    card.status !== 'ACTIVE'

    ||

    !card.businesses?.google_review_url

  ){


    return new NextResponse(

      'Kartu sedang tidak aktif.',

      {
        status:409
      }

    )

  }







  // =====================================
  // ANTI DUPLICATE EVENT 10 DETIK
  // =====================================


  const currentUserAgent =
    req.headers.get('user-agent') || null



  const { data:lastEvent } =

    await supabaseAdmin

      .from('events')

      .select(
        'id, created_at'
      )

      .eq(
        'card_id',
        card.id
      )

      .eq(
        'method',
        method
      )

      .eq(
        'user_agent',
        currentUserAgent
      )

      .order(
        'created_at',
        {
          ascending:false
        }
      )

      .limit(1)

      .maybeSingle()



  let shouldInsert = true



  if(lastEvent){


    const diff =

      Date.now()

      -

      new Date(
        lastEvent.created_at
      ).getTime()



    if(diff < 10000){

      shouldInsert = false

    }

  }




  if(shouldInsert){


    await supabaseAdmin

      .from('events')

      .insert({

        card_id:card.id,

        method,


        user_agent:
        currentUserAgent,


        referer:
        req.headers.get('referer') || null

      })


  }







  return NextResponse.redirect(

    card.businesses.google_review_url,

    307

  )


}