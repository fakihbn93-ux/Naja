import QRCode from 'qrcode'
import path from 'path'

import {
  createCanvas,
  registerFont
} from 'canvas'

import { NextResponse } from 'next/server'

import { requireAdmin } from '../../../../../lib/auth/admin'
import { supabaseAdmin } from '../../../../../lib/supabase/admin'


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'



// =====================================
// REGISTER FONT
// =====================================

registerFont(
  path.join(
    process.cwd(),
    'public/fonts/SpaceGrotesk-Medium.ttf'
  ),
  {
    family:'SpaceGrotesk'
  }
)







function getConfig(resolution) {

  const key =
    String(resolution || 'hd')
    .toLowerCase()



  if (key === 'standard') {

    return {

      width:1000,
      height:1200,

      qrSize:520,

      fontSize:55

    }

  }





  if (
    key === 'ultra' ||
    key === 'print'
  ) {

    return {

      width:4000,
      height:4800,

      qrSize:2080,

      fontSize:120

    }

  }





  return {

    width:2000,
    height:2400,

    qrSize:1040,

    fontSize:60

  }

}









export async function GET(req,{params}) {


try {


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







const {serial} =
await params







if(!serial){

return new NextResponse(
'Serial tidak ditemukan.',
{
status:400
}
)

}







const cleanSerial =
serial
.trim()
.toUpperCase()







const {
data:card,
error
}=

await supabaseAdmin

.from('cards')

.select(
'serial, public_id'
)

.eq(
'serial',
cleanSerial
)

.maybeSingle()







if(error){

return new NextResponse(
'Database error.',
{
status:500
}
)

}







if(!card){

return new NextResponse(
'Kartu tidak ditemukan.',
{
status:404
}
)

}







if(!card.public_id){

return new NextResponse(
'Public ID kartu belum tersedia.',
{
status:400
}
)

}







const {searchParams}
=
new URL(req.url)






const resolution =
(
searchParams.get('resolution')
||
'hd'
)
.toLowerCase()






const config =
getConfig(resolution)








const baseUrl =

process.env.NEXT_PUBLIC_APP_URL
||
new URL(req.url).origin







const qrUrl =

`${baseUrl}/r/${card.public_id}?method=qr`







const canvas =
createCanvas(
config.width,
config.height
)






const ctx =
canvas.getContext('2d')








// =============================
// BACKGROUND
// =============================


ctx.fillStyle='#ffffff'


ctx.fillRect(

0,

0,

config.width,

config.height

)








// =============================
// BORDER
// =============================


ctx.strokeStyle='#e5e7eb'


ctx.lineWidth =
config.width * 0.004




ctx.beginPath()



ctx.roundRect(

config.width * 0.04,

config.height * 0.04,

config.width * 0.92,

config.height * 0.92,

config.width * 0.04

)



ctx.stroke()








// =============================
// QR CODE
// =============================


const qrCanvas =
createCanvas(

config.qrSize,

config.qrSize

)







await QRCode.toCanvas(

qrCanvas,

qrUrl,

{

errorCorrectionLevel:'H',

margin:1,

width:config.qrSize,

color:{

dark:'#000000',

light:'#ffffff'

}

}

)







ctx.drawImage(

qrCanvas,

(config.width-config.qrSize)/2,

config.height * 0.16,

config.qrSize,

config.qrSize

)









// =============================
// CARD ID LABEL
// =============================


const label =

`GA-${card.serial
.replace('NFC-','')
.slice(-3)}`








ctx.fillStyle='#374151'






ctx.font =

`italic ${config.fontSize}px SpaceGrotesk`






ctx.textAlign='center'


ctx.textBaseline='middle'







ctx.fillText(

label,

config.width / 2,

config.height * 0.60

)








const buffer =

canvas.toBuffer(
'image/png'
)








return new NextResponse(

buffer,

{

headers:{

'Content-Type':
'image/png',


'Content-Disposition':
`attachment; filename="${label}.png"`,


'Cache-Control':
'no-store'

}

}

)







}catch(error){


console.error(

'DOWNLOAD ONE ERROR:',

error

)





return new NextResponse(

'Gagal membuat PNG',

{

status:500

}

)


}


}