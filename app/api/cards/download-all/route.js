import JSZip from 'jszip'
import QRCode from 'qrcode'
import { createCanvas } from 'canvas'
import { NextResponse } from 'next/server'

import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'
import { rateLimit } from '../../../../lib/security/rate-limit'


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'



function getSizeConfig(size) {

  const key =
    String(size || 'hd')
      .toLowerCase()



  if(key === 'standard'){

    return {

      width:1000,
      height:1200,
      qrSize:520,
      fontSize:90,
      radius:40,
      strokeWidth:4,

    }

  }



  if(
    key === 'ultra' ||
    key === 'print'
  ){

    return {

      width:4000,
      height:4800,
      qrSize:2080,
      fontSize:360,
      radius:160,
      strokeWidth:12,

    }

  }



  return {

    width:2000,
    height:2400,
    qrSize:1040,
    fontSize:180,
    radius:80,
    strokeWidth:8,

  }

}






function drawRoundedRect(
  ctx,
  x,
  y,
  width,
  height,
  radius
){

  ctx.beginPath()

  ctx.moveTo(
    x + radius,
    y
  )

  ctx.lineTo(
    x + width - radius,
    y
  )

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + radius
  )

  ctx.lineTo(
    x + width,
    y + height - radius
  )

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  )

  ctx.lineTo(
    x + radius,
    y + height
  )

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - radius
  )

  ctx.lineTo(
    x,
    y + radius
  )

  ctx.quadraticCurveTo(
    x,
    y,
    x + radius,
    y
  )

  ctx.closePath()

}







function getCardNumber(serial){

  const match =
    String(serial || '')
      .match(/(\d+)$/)


  const number =
    match
    ?
    Number(match[1])
    :
    0


  return `GA-${String(number)
    .padStart(3,'0')}`

}







function getSerialNumberValue(serial){

  const match =
    String(serial || '')
      .match(/(\d+)$/)


  return match
    ?
    Number(match[1])
    :
    0

}








export async function GET(req){


  const auth =
    await requireAdmin()



  if(auth.error){

    return new NextResponse(

      auth.error,

      {
        status:auth.status
      }

    )

  }




  try {


    // ============================
    // REDIS RATE LIMIT
    // 10 REQUEST / 5 MENIT
    // ============================


    const limiter =
      await rateLimit({

        key:
        `download:${auth.user.id}`,

        limit:10,

        windowMs:
        5 * 60 * 1000

      })




    if(!limiter.allowed){


      return NextResponse.json(

        {

          error:
          'Terlalu banyak request download. Maksimal 10 kali dalam 5 menit.'

        },

        {

          status:429

        }

      )

    }







    const {searchParams} =
      new URL(req.url)



    const start =
      Number(
        searchParams.get('start') || '1'
      )



    const end =
      Number(
        searchParams.get('end') || '10'
      )




    const resolution =

      (

        searchParams.get('resolution') ||

        searchParams.get('size') ||

        'hd'

      )

      .toLowerCase()






    if(
      !Number.isInteger(start) ||
      !Number.isInteger(end)
    ){

      return new NextResponse(

        'Nomor awal dan akhir harus berupa angka.',

        {
          status:400
        }

      )

    }






    if(
      start < 1 ||
      end < 1 ||
      end < start
    ){

      return new NextResponse(

        'Range nomor tidak valid.',

        {
          status:400
        }

      )

    }






    const total =
      end - start + 1





    if(total > 500){


      return new NextResponse(

        'Maksimal download 500 kartu per request.',

        {
          status:400
        }

      )

    }







    const allowedResolutions = [

      'standard',
      'hd',
      'ultra',
      'print'

    ]




    if(
      !allowedResolutions.includes(
        resolution
      )
    ){

      return new NextResponse(

        'Resolusi tidak valid.',

        {
          status:400
        }

      )

    }








    const {
      data:allCards,
      error

    } = await supabaseAdmin

      .from('cards')

      .select('serial, public_id')

      .order(
        'serial',
        {
          ascending:true
        }
      )






    if(error){

      return new NextResponse(

        error.message,

        {
          status:500
        }

      )

    }








    const selectedCards =

      (allCards || [])

      .filter(card=>{


        const num =
          getSerialNumberValue(
            card.serial
          )


        return (

          num >= start &&

          num <= end

        )


      })

      .sort(

        (a,b)=>

          getSerialNumberValue(a.serial)

          -

          getSerialNumberValue(b.serial)

      )







    if(selectedCards.length === 0){


      return new NextResponse(

        'Kartu tidak ditemukan pada range tersebut.',

        {
          status:404
        }

      )

    }








    const {

      width,
      height,
      qrSize,
      fontSize,
      radius,
      strokeWidth

    } = getSizeConfig(
      resolution
    )







    const appUrl =

      process.env.NEXT_PUBLIC_APP_URL ||

      new URL(req.url).origin






    const zipFile =
      new JSZip()






    const folderName =

      `cards-${String(start).padStart(3,'0')}-${String(end).padStart(3,'0')}`






    const zipFolder =
      zipFile.folder(folderName)






    if(!zipFolder){


      return new NextResponse(

        'Gagal membuat folder ZIP.',

        {
          status:500
        }

      )

    }








    for(const card of selectedCards){



      const serial =
        card.serial


      const publicId =
        card.public_id



      const label =
        getCardNumber(serial)



      const qrUrl =
        `${appUrl}/r/${publicId}?method=qr`





      const canvas =
        createCanvas(

          width,

          height

        )




      const ctx =
        canvas.getContext('2d')





      ctx.fillStyle =
        '#ffffff'


      ctx.fillRect(

        0,

        0,

        width,

        height

      )






      const cardX =
        Math.round(width * 0.06)


      const cardY =
        Math.round(height * 0.04)


      const cardW =
        Math.round(width * 0.88)


      const cardH =
        Math.round(height * 0.92)






      drawRoundedRect(

        ctx,

        cardX,

        cardY,

        cardW,

        cardH,

        radius

      )





      ctx.fill()





      ctx.lineWidth =
        strokeWidth



      ctx.strokeStyle =
        '#e5e7eb'



      ctx.stroke()






      const qrCanvas =
        createCanvas(

          qrSize,

          qrSize

        )







      await QRCode.toCanvas(

        qrCanvas,

        qrUrl,

        {

          errorCorrectionLevel:'H',

          margin:1,

          width:qrSize,

          color:{

            dark:'#000000',

            light:'#ffffff'

          }

        }

      )







      ctx.drawImage(

        qrCanvas,

        (width - qrSize) / 2,

        height * 0.16,

        qrSize,

        qrSize

      )







      ctx.fillStyle =
        '#111111'



      ctx.font =
        `700 ${fontSize}px DejaVu Sans`



      ctx.textAlign =
        'center'



      ctx.textBaseline =
        'alphabetic'





      ctx.fillText(

        label,

        width / 2,

        height * 0.82

      )







      zipFolder.file(

        `${label}.png`,

        canvas.toBuffer('image/png')

      )


    }







    const zipBuffer =

      await zipFile.generateAsync({

        type:'nodebuffer',

        compression:'DEFLATE',

        compressionOptions:{

          level:9

        }

      })







    return new NextResponse(

      zipBuffer,

      {

        status:200,


        headers:{


          'Content-Type':

          'application/zip',



          'Content-Disposition':

          `attachment; filename="${folderName}.zip"`,



          'Content-Length':

          String(zipBuffer.length),



          'Cache-Control':

          'no-store'


        }

      }

    )







  }catch(err){


    console.error(

      'DOWNLOAD ALL PNG ERROR:',

      err

    )



    return new NextResponse(

      'Terjadi kesalahan saat membuat ZIP PNG.',

      {

        status:500

      }

    )


  }


}