import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

import { supabaseAdmin } from '../../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../../lib/auth/admin'



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

        name

      )

    `)


    .order(

      'serial',

      {
        ascending:true
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







  // =========================
  // RINGKASAN KARTU
  // =========================


  const summary = {


    total:
    cards.length,



    active:

    cards.filter(

      c=>c.status === 'ACTIVE'

    ).length,



    unassigned:

    cards.filter(

      c=>c.status === 'UNASSIGNED'

    ).length,



    lost:

    cards.filter(

      c=>c.status === 'LOST'

    ).length,


  }







  const doc =

    new PDFDocument({

      margin:50

    })






  const chunks = []



  doc.on(

    'data',

    chunk=>chunks.push(chunk)

  )



  const finished =

    new Promise(resolve=>{


      doc.on(

        'end',

        ()=>resolve(

          Buffer.concat(chunks)

        )

      )


    })









  // =========================
  // HEADER
  // =========================


  doc

    .fontSize(22)

    .text(

      'NFC Review Manager'

    )



  doc.moveDown()



  doc

    .fontSize(16)

    .text(

      'Laporan Data Kartu'

    )



  doc.moveDown()



  doc

    .fontSize(11)

    .text(

      `Tanggal Export: ${
        new Date()
        .toLocaleDateString('id-ID')
      }`

    )






  doc.moveDown(2)







  // =========================
  // SUMMARY
  // =========================



  doc

    .fontSize(14)

    .text(

      'Ringkasan Kartu'

    )



  doc.moveDown()



  doc

    .fontSize(11)

    .text(

`Total Kartu : ${summary.total}

ACTIVE      : ${summary.active}

UNASSIGNED  : ${summary.unassigned}

LOST        : ${summary.lost}`

    )






  doc.moveDown(2)






  // =========================
  // LIST CARD
  // =========================


  doc

    .fontSize(14)

    .text(

      'Daftar Kartu'

    )



  doc.moveDown()






  cards.forEach(

    (card,index)=>{


      doc

        .fontSize(11)

        .text(

`No       : ${index + 1}

Serial   : ${card.serial}

Status   : ${card.status}

Toko     : ${card.businesses?.name || '-'}

Aktif    : ${
card.activated_at
?
new Date(card.activated_at)
.toLocaleString(
'id-ID',
{
timeZone:'Asia/Jakarta'
}
)
:
'-'
}

Dibuat   : ${
card.created_at
?
new Date(card.created_at)
.toLocaleString(
'id-ID',
{
timeZone:'Asia/Jakarta'
}
)
:
'-'
}

--------------------------------`

        )



      doc.moveDown()



    }

  )







  doc.end()






  const pdf =

    await finished







  return new NextResponse(

    pdf,

    {

      headers:{


        'Content-Type':

        'application/pdf',



        'Content-Disposition':

        'attachment; filename="laporan-kartu-nfc.pdf"'


      }

    }

  )


}