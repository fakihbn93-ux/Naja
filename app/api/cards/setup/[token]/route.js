import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase/admin'


export async function GET(req, context) {

  try {

    const { token } = await context.params


    if (!token) {

      return NextResponse.json(
        {
          error: 'Token tidak ditemukan.'
        },
        {
          status: 400
        }
      )

    }



    const { data: card, error } = await supabaseAdmin
      .from('cards')
      .select(
        `
        public_id,
        serial,
        status,
        setup_token
        `
      )
      .eq('setup_token', token)
      .maybeSingle()



    if (error) {

      console.error(
        'SETUP TOKEN LOOKUP ERROR:',
        error
      )


      return NextResponse.json(
        {
          error: 'Gagal mengambil data kartu.'
        },
        {
          status: 500
        }
      )

    }



    if (!card) {

      return NextResponse.json(
        {
          error:
          'Token setup tidak valid atau sudah digunakan.'
        },
        {
          status: 404
        }
      )

    }



    return NextResponse.json(
      {
        public_id: card.public_id,
        serial: card.serial,
        status: card.status
      },
      {
        status: 200
      }
    )



  } catch (err) {


    console.error(
      'SETUP ROUTE ERROR:',
      err
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