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

        style={{

          display:'grid',

          gridTemplateColumns:
          'repeat(4,1fr)',

          gap:16

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

              style={{

                border:'1px solid #ddd',

                borderRadius:16,

                padding:20,

                textAlign:'center',

                background:'#fff'

              }}

            >


              <img

                src={`/api/qr/${card.serial}`}

                width="160"

                height="160"

                alt={card.serial}

              />


              <div

                style={{

                  marginTop:12,

                  fontSize:28,

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


    </main>

  )


}