import QRCode from 'qrcode'
import { createClient } from '../../../lib/supabase/server'
import { supabaseAdmin } from '../../../lib/supabase/admin'


export const dynamic = 'force-dynamic'


function getNumber(serial){

  const match = serial.match(/(\d+)$/)

  if(!match){
    return serial
  }

  return String(Number(match[1])).padStart(3,'0')

}



export default async function PrintCards(){


  // cek user login

  const sb = await createClient()


  const {
    data:{
      user
    }
  } = await sb.auth.getUser()



  if(!user){

    return (
      <main className="wrap">
        <div className="card">
          Akses admin diperlukan.
        </div>
      </main>
    )

  }



  // cek role admin

  const {
    data:profile
  } = await sb
    .from('profiles')
    .select('role')
    .eq('id',user.id)
    .maybeSingle()



  if(profile?.role !== 'admin'){

    return (
      <main className="wrap">
        <div className="card">
          Akses admin diperlukan.
        </div>
      </main>
    )

  }



  // ambil kartu

  const {
    data:cards,
    error
  } = await supabaseAdmin
    .from('cards')
    .select('serial,status')
    .order('serial',{ascending:true})



  if(error){

    return (
      <main className="wrap">
        <div className="card">
          Gagal mengambil kartu.
        </div>
      </main>
    )

  }




  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://nfc-project-new.vercel.app'



  const items =
    await Promise.all(

      cards.map(async(card)=>{


        const qrUrl =
          `${base}/r/${card.serial}?method=qr`



        const qr =
          await QRCode.toDataURL(
            qrUrl,
            {
              width:500,
              margin:1,
              errorCorrectionLevel:'H'
            }
          )



        return {

          serial:card.serial,

          status:card.status,

          number:getNumber(card.serial),

          qr

        }


      })

    )





  return (

    <main className="print-page">


      <h1>
        Cetak Kartu NFC
      </h1>


      <p>
        QR berasal dari serial kartu.
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

font-family:Arial;

}



.grid{

display:grid;

grid-template-columns:repeat(4,1fr);

gap:12px;

}



.ticket{

border:1px solid #ddd;

border-radius:12px;

height:180px;

display:flex;

flex-direction:column;

align-items:center;

justify-content:center;

}



.qr{

width:120px;

height:120px;

}



.number{

margin-top:10px;

font-size:24px;

font-weight:bold;

letter-spacing:3px;

}



@media print{


@page{

size:A4 portrait;

margin:10mm;

}



h1,
p{

display:none;

}



.grid{

grid-template-columns:repeat(4,1fr);

gap:8px;

}



.ticket{

height:60mm;

break-inside:avoid;

}



.qr{

width:38mm;

height:38mm;

}



.number{

font-size:18pt;

}



}



`}</style>


    </main>

  )


}