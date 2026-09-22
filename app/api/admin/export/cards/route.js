import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../../lib/auth/admin'



function escapeCSV(value){

  if(value === null || value === undefined){

    return ''

  }


  return `"${String(value).replace(/"/g,'""')}"`

}




export async function GET(req){


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





  const {

    data:cards,

    error

  } = await supabaseAdmin


    .from('cards')


    .select(`

      serial,

      status,

      activated_at,

      created_at,


      businesses(

        name,

        google_review_url

      )

    `)


    .order(

      'created_at',

      {
        ascending:false
      }

    )







  if(error){


    return NextResponse.json(

      {
        error:error.message
      },

      {
        status:500
      }

    )

  }







  const header = [

    'Serial',

    'Status',

    'Nama Toko',

    'Google Review URL',

    'Tanggal Aktivasi',

    'Dibuat'

  ]






  const rows = cards.map(card=>{


    return [

      card.serial,

      card.status,

      card.businesses?.name || '',

      card.businesses?.google_review_url || '',

      card.activated_at || '',

      card.created_at || ''

    ]

  })







  const csv = [

    header,

    ...rows

  ]

  .map(row=>

    row
    .map(escapeCSV)
    .join(',')

  )

  .join('\n')







  return new NextResponse(

    csv,

    {

      status:200,


      headers:{

        'Content-Type':
        'text/csv; charset=utf-8',


        'Content-Disposition':
        'attachment; filename="cards-export.csv"'

      }

    }

  )


}