import { supabaseAdmin } from '../../../../lib/supabase/admin'
import PrintButton from './PrintButton'


export const dynamic = 'force-dynamic'



export default async function PrintCards(){


  const { data: cards, error } =
    await supabaseAdmin
      .from('cards')
      .select('serial')
      .order('serial',{
        ascending:true
      })



  if(error){

    return (

      <main className="wrap">

        <div className="card">

          <h1>Error</h1>

          <p>
            {error.message}
          </p>

        </div>

      </main>

    )

  }



  if(!cards || cards.length===0){

    return (

      <main className="wrap">

        <div className="card">

          Tidak ada kartu.

        </div>

      </main>

    )

  }




  return (

    <main className="wrap">


      <div
        className="no-print"
        style={{
          marginBottom:20
        }}
      >

        <PrintButton />

      </div>



      <div

        className="print-grid"

        style={{

          display:'grid',

          gridTemplateColumns:
          'repeat(4,1fr)',

          gap:12

        }}

      >



      {

        cards.map((card)=>{


          const number =
          card.serial.match(/\d+$/)?.[0] || '000'


          const display =
          number.slice(-3)



          return (

            <div

              key={card.serial}

              className="print-card"

              style={{

                border:'1px solid #ddd',

                borderRadius:12,

                padding:12,

                textAlign:'center',

                background:'#fff',

                height:180,

                display:'flex',

                flexDirection:'column',

                alignItems:'center',

                justifyContent:'center'

              }}

            >



              <img

                src={`/api/qr/${card.serial}`}

                width="120"

                height="120"

                alt={card.serial}

              />



              <div

                style={{

                  marginTop:8,

                  fontSize:24,

                  fontWeight:700,

                  letterSpacing:3

                }}

              >

                {display}

              </div>


            </div>

          )


        })

      }


      </div>



<style>{`

@media print{


@page{

 size:A4 portrait;

 margin:10mm;

}



.no-print{

 display:none!important;

}



.print-grid{

 grid-template-columns:
 repeat(4,1fr)!important;

 gap:8px!important;

}



.print-card{

 height:55mm!important;

 break-inside:avoid;

}



.print-card img{

 width:35mm!important;

 height:35mm!important;

}



.print-card div{

 font-size:18pt!important;

}



}



`}</style>


    </main>

  )


}