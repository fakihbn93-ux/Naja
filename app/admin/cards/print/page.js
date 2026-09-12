import Link from 'next/link'
import { supabaseAdmin } from '../../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'


export default async function PrintCards() {

  const { data: cards, error } = await supabaseAdmin
    .from('cards')
    .select('serial,status,businesses(*)')
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


  return (

    <main className="wrap">


      <div className="nav">

        <Link href="/admin">
          ← Dashboard
        </Link>


      </div>



      <div className="card">


        <h1>
          Cetak Kartu NFC
        </h1>


        <p className="muted">
          QR dan NFC sudah tertanam pada kartu fisik.
        </p>



        <div
          style={{
            display:'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(260px,1fr))',
            gap:20
          }}
        >


          {
            cards?.map((card)=>(

              <div
                key={card.serial}
                style={{
                  border:'1px solid #ddd',
                  borderRadius:16,
                  padding:20,
                  textAlign:'center'
                }}
              >

                <h2>
                  {card.serial}
                </h2>


                <p>
                  {
                    card.businesses?.name ||
                    'Belum aktif'
                  }
                </p>


                <img
                  src={`/api/qr/${card.serial}`}
                  width="180"
                  height="180"
                  alt={card.serial}
                />


                <p>
                  Status:
                  <b>
                    {' '}
                    {card.status}
                  </b>
                </p>


              </div>

            ))
          }


        </div>


      </div>


    </main>

  )
}