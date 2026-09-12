import Link from 'next/link'
import { supabaseAdmin } from '../../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function PrintCards() {

  const { data: cards, error } =
    await supabaseAdmin
      .from('cards')
      .select('serial,status')
      .order('serial', {
        ascending: true
      })


  if (error) {
    return (
      <main className="wrap">
        <div className="card">
          Error: {error.message}
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

      <div className="card">

        <h1>
          Cetak Kartu NFC
        </h1>


        <p className="muted">
          QR dan NFC berasal dari serial kartu.
        </p>


        <div
          style={{
            display:'grid',
            gridTemplateColumns:
            'repeat(auto-fit,minmax(250px,1fr))',
            gap:20
          }}
        >

        {
          cards.map(card => (

            <div
              key={card.serial}
              className="card"
              style={{
                textAlign:'center'
              }}
            >

              <h2>
                {card.serial}
              </h2>


              <img
                src={`/api/qr/${card.serial}`}
                width="180"
                height="180"
                alt={card.serial}
              />


              <p>
                Status:
                <b> {card.status}</b>
              </p>


            </div>

          ))
        }

        </div>


      </div>

    </main>

  )
}