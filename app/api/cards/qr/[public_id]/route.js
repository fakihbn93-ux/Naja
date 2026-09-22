import { NextResponse } from 'next/server'


export const runtime='nodejs'


export async function GET(req,{params}){

  try{


    const {public_id} = await params


    if(!public_id){

      return new NextResponse(
        'Public ID tidak ditemukan',
        {
          status:400
        }
      )

    }



    const previewUrl =

      new URL(

        `/api/cards/preview/${public_id}?resolution=hd`,

        req.url

      )



    const response =

      await fetch(

        previewUrl

      )



    if(!response.ok){


      return new NextResponse(

        'Gagal membuat QR card',

        {
          status:500
        }

      )

    }



    const buffer =

      await response.arrayBuffer()



    return new NextResponse(

      buffer,

      {

        status:200,

        headers:{

          'Content-Type':

          'image/png',


          'Cache-Control':

          'no-store'


        }

      }

    )



  }catch(error){


    console.error(

      'QR CARD ERROR:',

      error

    )


    return new NextResponse(

      'Gagal membuat QR PNG',

      {
        status:500
      }

    )


  }


}