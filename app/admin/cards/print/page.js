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

          <p>
            {error.message}
          </p>

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

    <main className="wrap print-area">


      <style>{`

        @media print {

          body {

            background:white !important;

          }


          .no-print {

            display:none !important;

          }


          .print-area {

            padding:0 !important;

            margin:0 !important;

          }


          .card-item {

            break-inside: avoid;

          }

        }


        .card-grid {

          display:grid;

          grid-template-columns:
          repeat(4,1fr);

          gap:16px;

        }


        .card-item {

          height:260px;

          border:1px solid #ddd;

          border-radius:16px;

          display:flex;

          flex-direction:column;

          justify-content:center;

          align-items:center;

          background:white;

        }


        .card-number {

          margin-top:12px;

          font-size:26px;

          font-weight:700;

          letter-spacing:3px;

        }


        @media print {


          .card-grid {

            grid-template-columns:
            repeat(4,1fr);

            gap:8px;

          }


          .card-item {

            height:220px;

            border:1px solid #000;

          }


        }


      `}</style>



      <div className="no-print"

        style={{

          marginBottom:20

        }}

      >

        <button

          className="btn"

          onClick={() => window.print()}

        >

          Cetak Kartu

        </button>

      </div>




      <div className="card-grid">


        {

          cards.map((card)=>{


            const number =
              card.serial.match(/\d+$/)?.[0] || '000'


            const displayNumber =
              number.slice(-3)



            return (

              <div

                key={card.serial}

                className="card-item"

              >


                <img

                  src={`/api/qr/${card.serial}`}

                  width="150"

                  height="150"

                  alt={card.serial}

                />


                <div className="card-number">

                  {displayNumber}

                </div>


              </div>

            )


          })

        }


      </div>


    </main>

  )

}