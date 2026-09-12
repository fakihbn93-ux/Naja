import { supabaseAdmin } from '../../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function PrintCards() {

  const { data: cards, error } =
    await supabaseAdmin
      .from('cards')
      .select('serial')
      .order('serial', {
        ascending: true
      })


  if (error) {

    return (
      <main className="wrap">

        <div className="card">
          <h1>Error</h1>
          <p>{error.message}</p>
        </div>

      </main>
    )

  }



  if (!cards || cards.length === 0) {

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
        className="print-grid"
        style={{
          display:'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          gap:20
        }}
      >


        {
          cards.map((card) => {


            const number =
              card.serial.match(/\d+$/)?.[0] || '000'


            const displayNumber =
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

                  alt={`QR ${card.serial}`}

                  width="180"

                  height="180"

                />


                <div

                  style={{

                    marginTop:12,

                    fontSize:28,

                    fontWeight:700,

                    letterSpacing:2

                  }}

                >

                  #{displayNumber}

                </div>


              </div>

            )


          })

        }


      </div>


    </main>

  )

}