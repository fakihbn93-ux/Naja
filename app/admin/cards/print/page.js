import QRCode from 'qrcode'
import { supabaseAdmin } from '../../../lib/supabase/admin'


export const dynamic = 'force-dynamic'


function getNumber(serial) {
  const match = serial.match(/(\d+)$/)

  if (!match) return serial

  return String(Number(match[1])).padStart(3, '0')
}


export default async function PrintCards() {

  const { data: cards, error } = await supabaseAdmin
    .from('cards')
    .select('serial,status')
    .order('serial', { ascending: true })


  if (error) {

    return (
      <main className="wrap">
        <div className="card">
          Gagal mengambil data kartu.
        </div>
      </main>
    )

  }



  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    ''



  const items = await Promise.all(

    (cards || []).map(async (card)=>{

      const url =
        `${base}/r/${card.serial}?method=qr`


      const qr =
        await QRCode.toDataURL(
          url,
          {
            width:500,
            margin:1,
            errorCorrectionLevel:'H'
          }
        )


      return {
        ...card,
        qr,
        number:getNumber(card.serial)
      }

    })

  )



  return (

    <main className="print-page">


      <h1>
        Cetak Kartu NFC
      </h1>


      <p className="subtitle">
        QR dan NFC berasal dari serial kartu.
      </p>



      <div className="grid">


        {
          items.map(card=>(

            <div
              key={card.serial}
              className="ticket"
            >


              <img
                src={card.qr}
                className="qr"
              />


              <div className="number">
                {card.number}
              </div>


            </div>

          ))
        }


      </div>



<style>{`

.print-page{

  padding:20px;

  font-family:Arial, sans-serif;

}



h1{

  font-size:32px;

  margin-bottom:5px;

}



.subtitle{

  color:#666;

  margin-bottom:25px;

}



.grid{

  display:grid;

  grid-template-columns:
  repeat(4,1fr);

  gap:12px;

}



.ticket{

  height:190px;

  border:1px solid #ddd;

  border-radius:12px;

  display:flex;

  flex-direction:column;

  align-items:center;

  justify-content:center;

  background:white;

}



.qr{

  width:120px;

  height:120px;

}



.number{

  margin-top:12px;

  font-size:24px;

  font-weight:700;

  letter-spacing:2px;

}



@media print {


@page{

  size:A4 portrait;

  margin:10mm;

}



.print-page{

  padding:0;

}



h1,
.subtitle{

  display:none;

}



.grid{

  grid-template-columns:
  repeat(4,1fr);

  gap:8px;

}



.ticket{

  height:62mm;

  border:1px solid #ddd;

  break-inside:avoid;

}



.qr{

  width:38mm;

  height:38mm;

}



.number{

  font-size:18pt;

  margin-top:5mm;

}



}



`}</style>



    </main>

  )

}