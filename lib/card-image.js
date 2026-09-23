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



  // =========================
  // BACKGROUND
  // =========================

  ctx.fillStyle =
    '#ffffff'


  ctx.fillRect(
    0,
    0,
    1000,
    1200
  )



  // =========================
  // CARD BORDER
  // =========================

  ctx.strokeStyle =
    '#dddddd'


  ctx.lineWidth =
    4


  ctx.beginPath()


  ctx.roundRect(
    50,
    50,
    900,
    1100,
    40
  )


  ctx.stroke()



  // =========================
  // QR CODE
  // =========================

  const qrImage =
    await loadImage(qrData)



  ctx.drawImage(
    qrImage,
    150,
    150,
    700,
    700
  )





  // =========================
  // SERIAL FULL
  // =========================

  ctx.fillStyle =
    '#666666'


  ctx.font =
    'bold 38px sans-serif'


  ctx.textAlign =
    'center'



  ctx.fillText(
    serial,
    500,
    970
  )





  // =========================
  // SHORT CODE
  // =========================

  ctx.fillStyle =
    '#111111'


  ctx.font =
    'bold 90px sans-serif'



  ctx.fillText(
    `GA-${display}`,
    500,
    1080
  )






  return canvas.toBuffer(
    'image/png'
  )


}