import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase/admin'

export async function GET(req, { params }) {

  const { serial } = await params

  const method =
    new URL(req.url).searchParams.get('method') === 'qr'
      ? 'qr'
      : 'nfc'


  const { data: c, error } = await supabaseAdmin
    .from('cards')
    .select(`
      id,
      serial,
      status,
      setup_token,
      businesses(
        google_review_url
      )
    `)
    .eq('serial', serial)
    .maybeSingle()


  if (error) {
    console.error(error)

    return new NextResponse(
      'Terjadi kesalahan server.',
      { status:500 }
    )
  }


  if (!c) {
    return new NextResponse(
      'Kartu tidak ditemukan.',
      { status:404 }
    )
  }



  // ==========================
  // KARTU BELUM AKTIF
  // HANYA NFC UNTUK SETUP
  // ==========================

  if (c.status === 'UNASSIGNED') {


    if (
      method === 'nfc' &&
      c.setup_token
    ) {


      await supabaseAdmin
        .from('events')
        .insert({

          card_id:c.id,

          method:'setup',

          user_agent:
            req.headers.get('user-agent') || null,

          referer:
            req.headers.get('referer') || null

        })


      const base =
        process.env.NEXT_PUBLIC_APP_URL ||
        new URL(req.url).origin


      return NextResponse.redirect(

        `${base}/setup/${c.serial}?token=${encodeURIComponent(c.setup_token)}`,

        307

      )

    }


    return new NextResponse(

      'Kartu belum aktif. Silakan tap menggunakan NFC untuk instalasi.',

      {status:409}

    )

  }





  // ==========================
  // KARTU ACTIVE
  // NFC / QR KE GOOGLE REVIEW
  // ==========================


  if (
    c.status !== 'ACTIVE' ||
    !c.businesses?.google_review_url
  ){

    return new NextResponse(
      'Kartu sedang tidak aktif.',
      {status:409}
    )

  }



  await supabaseAdmin
    .from('events')
    .insert({

      card_id:c.id,

      method,

      user_agent:
        req.headers.get('user-agent') || null,

      referer:
        req.headers.get('referer') || null

    })



  return NextResponse.redirect(

    c.businesses.google_review_url,

    307

  )

}