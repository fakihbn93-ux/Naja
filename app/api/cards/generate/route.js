import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'
import { rateLimit } from '../../../../lib/security/rate-limit'


export async function POST(req) {


  const auth =
    await requireAdmin()



  if (auth.error) {

    return NextResponse.json(

      {
        error: auth.error
      },

      {
        status: auth.status
      }

    )

  }





  // ============================
  // REDIS RATE LIMIT GENERATE
  // 10 REQUEST / 5 MENIT
  // ============================


  try {


    const limiter =

      await rateLimit({

        key:
        `generate:${auth.user.id}`,

        limit:10,

        windowMs:300000

      })



    if(!limiter.allowed){


      return NextResponse.json(

        {

          error:
          'Terlalu banyak request generate kartu. Coba lagi setelah 5 menit.'

        },

        {

          status:429

        }

      )


    }


  }catch(redisError){


    console.error(

      'REDIS GENERATE ERROR:',

      redisError

    )


  }







  try {



    const body =

      await req.json()

      .catch(

        ()=>({})

      )





    const {

      count = 1,

      prefix = 'NFC',

      start = null,

    } = body








    // ============================
    // VALIDASI JUMLAH
    // ============================


    if(

      !Number.isInteger(count)

      ||

      count < 1

      ||

      count > 1000

    ){


      return NextResponse.json(

        {

          error:
          'Jumlah kartu harus antara 1-1000.'

        },

        {

          status:400

        }

      )


    }








    const base =


      (

        (prefix || 'NFC')

        .replace(

          /[^A-Z0-9_-]/gi,

          ''

        )

        .toUpperCase()

        .slice(0,10)

      )

      ||

      'NFC'







    let n =

      Number(start) || 0








    // ============================
    // AUTO SERIAL NUMBER
    // ============================


    if(n < 1){



      const {

        data:existing = [],

        error:existingError

      } = await supabaseAdmin


        .from('cards')


        .select('serial')


        .like(

          'serial',

          `${base}-%`

        )







      if(existingError){


        return NextResponse.json(

          {

            error:
            existingError.message

          },

          {

            status:500

          }

        )


      }







      const numbers =


        existing.map(

          item=>{


            const match =

              item.serial.match(/(\d+)$/)



            return match

              ?

              Number(match[1])

              :

              0


          }

        )







      n =

        numbers.length

        ?

        Math.max(...numbers) + 1

        :

        1



    }









    // ============================
    // CREATE CARD ROWS
    // ============================


    const rows =


      Array.from(

        {

          length:count

        },


        (_,i)=>({


          serial:

          `${base}-${String(n+i).padStart(6,'0')}`,

          public_id:

          crypto.randomBytes(12).toString('hex'),



          setup_token:

          crypto

          .randomBytes(18)

          .toString('hex'),



          status:

          'UNASSIGNED'


        })

      )








    const {

      data,

      error

    } = await supabaseAdmin



      .from('cards')


      .insert(rows)


      .select(

        'serial,public_id,setup_token,status'

      )

    if(error){


      console.error(

        'GENERATE CARD ERROR:',

        error

      )


      return NextResponse.json(

        {

          error:error.message

        },

        {

          status:400

        }

      )


    }








    // ============================
    // INSERT AUDIT TRAIL
    // CREATE CARD
    // ============================


    const {

      error:logError

    } = await supabaseAdmin


      .from('card_logs')


      .insert({

        serial:

        `${data[0]?.serial} - ${data[data.length - 1]?.serial}`,


        action:

        'CREATE_CARD',



        old_status:

        null,



        new_status:

        'UNASSIGNED',



        old_business_id:

        null,



        new_business_id:

        null,



        old_data:{

          count:0

        },



        new_data:{

          count:data.length,


          first_serial:

          data[0]?.serial,


          last_serial:

          data[data.length - 1]?.serial,


          prefix:base

        },



        admin_id:

        auth.user.id,



        admin_email:

        auth.user.email


      })






    if(logError){


      console.error(

        'CREATE CARD AUDIT ERROR:',

        logError

      )


    }








    const app =

      process.env.NEXT_PUBLIC_APP_URL

      ||

      new URL(req.url).origin








    return NextResponse.json(

      {


        created:

        data.length,



        firstSerial:

        data[0]?.serial,



        lastSerial:

        data[data.length-1]?.serial,



        cards:

        data.map(

          x=>({


            serial:

            x.serial,



            status:

            x.status,



            setup_url:

            `${app}/setup/${x.serial}?token=${x.setup_token}`,



            qr_url:

            `${app}/r/${x.public_id}?method=qr`,



            nfc_customer_url:

            `${app}/r/${x.public_id}?method=nfc`


          })

        )


      }

    )






  }catch(error){



    console.error(

      'GENERATE SERVER ERROR:',

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