import QRCode from 'qrcode'
import { createCanvas, loadImage } from 'canvas'


export async function generateCardPNG(serial){


  const number =
    serial.match(/\d+$/)?.[0] || '000'


  const display =
    number.slice(-3)



  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'



  const qrUrl =
    `${base}/r/${serial}?method=qr`



  const qrData =
    await QRCode.toDataURL(
      qrUrl,
      {
        width:800,
        margin:2,
        errorCorrectionLevel:'H'
      }
    )



  const canvas =
    createCanvas(
      1000,
      1200
    )


  const ctx =
    canvas.getContext('2d')



  // background

  ctx.fillStyle =
    '#ffffff'

  ctx.fillRect(
    0,
    0,
    1000,
    1200
  )



  // card border

  ctx.strokeStyle =
    '#dddddd'

  ctx.lineWidth = 4


  ctx.beginPath()

  ctx.roundRect(
    50,
    50,
    900,
    1100,
    40
  )

  ctx.stroke()



  // QR

  const qrImage =
    await loadImage(qrData)



  ctx.drawImage(
    qrImage,
    150,
    150,
    700,
    700
  )



  // nomor kartu

  ctx.fillStyle =
    '#111111'


  ctx.font =
    'bold 90px Arial'


  ctx.textAlign =
    'center'


  ctx.fillText(
    display,
    500,
    1020
  )



  return canvas.toBuffer(
    'image/png'
  )

}