import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'
import { supabaseAdmin } from '../../lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="wrap">
        <div className="card">
          <h1>Belum login</h1>
          <Link href="/login">Login</Link>
        </div>
      </main>
    )
  }


  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()


  if (!profile || profile.role !== 'admin') {
    return (
      <main className="wrap">
        <div className="card">
          <h1>Akses Ditolak</h1>
          <p>Akun ini bukan admin.</p>
        </div>
      </main>
    )
  }


  // ======================
  // STATISTIK KARTU
  // ======================

  const { count: totalCards } = await supabaseAdmin
    .from('cards')
    .select('*', {
      count: 'exact',
      head: true
    })


  const { count: activeCards } = await supabaseAdmin
    .from('cards')
    .select('*', {
      count: 'exact',
      head: true
    })
    .eq('status','ACTIVE')


  const { count: unassignedCards } = await supabaseAdmin
    .from('cards')
    .select('*',{
      count:'exact',
      head:true
    })
    .eq('status','UNASSIGNED')



  // ======================
  // STATISTIK EVENT
  // ======================

  const { count: totalEvents } = await supabaseAdmin
    .from('events')
    .select('*',{
      count:'exact',
      head:true
    })


  const { count: nfcEvents } = await supabaseAdmin
    .from('events')
    .select('*',{
      count:'exact',
      head:true
    })
    .eq('method','nfc')


  const { count: qrEvents } = await supabaseAdmin
    .from('events')
    .select('*',{
      count:'exact',
      head:true
    })
    .eq('method','qr')



  // ======================
  // EVENT HARI INI WIB
  // ======================

  const startToday = new Date()

  startToday.setHours(0,0,0,0)


  const { count: todayEvents } = await supabaseAdmin
    .from('events')
    .select('*',{
      count:'exact',
      head:true
    })
    .gte(
      'created_at',
      startToday.toISOString()
    )



  // ======================
  // AKTIVITAS TERBARU
  // ======================

  const { data: latestEvents=[] } = await supabaseAdmin
    .from('events')
    .select('method,created_at,card_id')
    .order(
      'created_at',
      {
        ascending:false
      }
    )
    .limit(10)



  // ======================
  // KARTU TERBARU
  // ======================

  const { data: cards=[] } = await supabaseAdmin
    .from('cards')
    .select(
      'serial,status,business_id,created_at'
    )
    .order(
      'created_at',
      {
        ascending:false
      }
    )
    .limit(20)



  return (
    <main className="wrap">

      <div className="nav">
        <h1>NFC Review Manager</h1>

        <span className="status">
          ADMIN
        </span>
      </div>


      <div className="card">

        <h2>
          Selamat datang, {profile.full_name || user.email}
        </h2>

      </div>



      <div className="grid grid2"
        style={{
          marginTop:20
        }}
      >

        <div className="card">
          <h3>Total Kartu</h3>
          <strong>{totalCards || 0}</strong>
        </div>


        <div className="card">
          <h3>Kartu Aktif</h3>
          <strong>{activeCards || 0}</strong>
        </div>


        <div className="card">
          <h3>Belum Aktif</h3>
          <strong>{unassignedCards || 0}</strong>
        </div>


        <div className="card">
          <h3>Total Interaksi</h3>
          <strong>{totalEvents || 0}</strong>
        </div>


        <div className="card">
          <h3>NFC Tap</h3>
          <strong>{nfcEvents || 0}</strong>
        </div>


        <div className="card">
          <h3>QR Scan</h3>
          <strong>{qrEvents || 0}</strong>
        </div>


        <div className="card">
          <h3>Interaksi Hari Ini</h3>
          <strong>{todayEvents || 0}</strong>
        </div>

      </div>



      <div style={{
        marginTop:25
      }}>

        <Link href="/admin/generate">

          <button className="btn">
            Buat Kartu Baru
          </button>

        </Link>

      </div>




      <div className="card"
        style={{
          marginTop:25
        }}
      >

        <h2>
          Aktivitas Terbaru
        </h2>


        <table className="table">

          <thead>
            <tr>
              <th>Metode</th>
              <th>Waktu</th>
            </tr>
          </thead>


          <tbody>

          {
            latestEvents.map((event,index)=>(

              <tr key={index}>

                <td>
                  {event.method}
                </td>


                <td>

                  {
                    new Date(
                      event.created_at
                    ).toLocaleString(
                      'id-ID',
                      {
                        timeZone:'Asia/Jakarta',
                        dateStyle:'short',
                        timeStyle:'medium'
                      }
                    )
                  }

                </td>

              </tr>

            ))
          }

          </tbody>

        </table>

      </div>




      <div className="card"
        style={{
          marginTop:25
        }}
      >

        <h2>
          Daftar Kartu
        </h2>


        <table className="table">

          <thead>

            <tr>
              <th>Serial</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>

          </thead>


          <tbody>

          {
            cards.map(card=>(

              <tr key={card.serial}>

                <td>
                  {card.serial}
                </td>

                <td>
                  {card.status}
                </td>

                <td>
                  <Link href={`/admin/cards/${card.serial}`}>
                    Detail
                  </Link>
                </td>

              </tr>

            ))
          }

          </tbody>


        </table>


      </div>


    </main>
  )
}