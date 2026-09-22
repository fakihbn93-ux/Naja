import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'


export async function GET(req) {

  try {


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





    const { searchParams } =
      new URL(req.url)



    const page =
      Math.max(
        Number(searchParams.get('page') || 1),
        1
      )


    const limit =
      Math.min(
        Number(searchParams.get('limit') || 20),
        100
      )



    const search =
      (
        searchParams.get('search') || ''
      )
      .trim()



    const status =
      (
        searchParams.get('status') || ''
      )
      .trim()



    const action =
      (
        searchParams.get('action') || ''
      )
      .trim()





    const from =
      (page - 1) * limit


    const to =
      from + limit - 1





    let query =
      supabaseAdmin

        .from('card_logs')

        .select(
          `
          id,
          serial,
          action,
          old_status,
          new_status,
          old_business_id,
          new_business_id,
          old_data,
          new_data,
          admin_id,
          admin_email,
          created_at
          `,
          {
            count:'exact'
          }
        )

        .order(
          'created_at',
          {
            ascending:false
          }
        )

        .range(
          from,
          to
        )







    if(search){


      query =
        query.or(
          `
          serial.ilike.%${search}%,
          admin_email.ilike.%${search}%,
          action.ilike.%${search}%
          `
        )


    }





    if(status){


      query =
        query.or(
          `
          old_status.eq.${status},
          new_status.eq.${status}
          `
        )


    }





    if(action){


      query =
        query.eq(
          'action',
          action
        )


    }








    const {

      data:logs,

      error,

      count

    } =
      await query





    if(error){


      console.error(
        'AUDIT LOG ERROR:',
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









    const today =
      new Date()



    today.setHours(
      0,
      0,
      0,
      0
    )







    const {

      count:todayCount

    } =
      await supabaseAdmin

        .from('card_logs')

        .select(
          'id',
          {
            count:'exact',
            head:true
          }
        )

        .gte(
          'created_at',
          today.toISOString()
        )








    const {

      count:updateCount

    } =
      await supabaseAdmin

        .from('card_logs')

        .select(
          'id',
          {
            count:'exact',
            head:true
          }
        )

        .eq(
          'action',
          'UPDATE_CARD'
        )









    const {

      count:activateCount

    } =
      await supabaseAdmin

        .from('card_logs')

        .select(
          'id',
          {
            count:'exact',
            head:true
          }
        )

        .eq(
          'action',
          'ACTIVATE_CARD'
        )









    return NextResponse.json(

      {

        total:
        count || 0,


        page,


        limit,



        stats:{

          today:
          todayCount || 0,


          update:
          updateCount || 0,


          activate:
          activateCount || 0

        },



        logs:
        logs || []

      }

    )






  } catch(error){



    console.error(
      'ADMIN LOG SERVER ERROR:',
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