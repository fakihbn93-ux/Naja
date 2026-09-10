import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'
import { supabaseAdmin } from '../../lib/supabase/admin'

export default async function Admin() {
  const supabase = await createClient()

  // Cek login
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Belum login</h1>
        <p>
          <Link href="/login">Login</Link>
        </p>
      </main>
    )
  }

  // Cek role admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return (
      <main style={{ padding: 40 }}>
        <h1>Akses Ditolak</h1>
        <p>Akun ini bukan admin.</p>
      </main>
    )
  }

  // Statistik kartu
  const { count: totalCards } = await supabaseAdmin
    .from('cards')
    .select('*', { count: 'exact', head: true })

  const { count: activeCards } = await supabaseAdmin
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ACTIVE')

  const { count: unassignedCards } = await supabaseAdmin
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'UNASSIGNED')

  // Statistik event
  const { count: totalEvents } = await supabaseAdmin
    .from('events')
    .select('*', { count: 'exact', head: true })

  // Kartu terbaru
  const { data: cards } = await supabaseAdmin
    .from('cards')
    .select('serial, status, business_id, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main style={{ padding: 30 }}>
      <h1>NFC Review Manager</h1>

      <p>
        Dashboard Admin
      </p>

      <hr />

      <h2>Selamat datang, {profile.full_name || user.email}</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 15,
          marginTop: 25,
          marginBottom: 30,
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
          <h3>Belum Diaktifkan</h3>
          <strong>{unassignedCards || 0}</strong>
        </div>

        <div className="card">
          <h3>Total Tap / Scan</h3>
          <strong>{totalEvents || 0}</strong>
        </div>
      </div>

      <div style={{ marginBottom: 25 }}>
        <Link href="/admin/generate">
          <button>Buat Kartu Baru</button>
        </Link>
      </div>

      <h2>Daftar Kartu</h2>

      {!cards || cards.length === 0 ? (
        <p>Belum ada kartu.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 15,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 10 }}>
                  Serial
                </th>

                <th style={{ textAlign: 'left', padding: 10 }}>
                  Status
                </th>

                <th style={{ textAlign: 'left', padding: 10 }}>
                  Business ID
                </th>

                <th style={{ textAlign: 'left', padding: 10 }}>
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {cards.map((card) => (
                <tr key={card.serial}>
                  <td style={{ padding: 10 }}>
                    {card.serial}
                  </td>

                  <td style={{ padding: 10 }}>
                    {card.status}
                  </td>

                  <td style={{ padding: 10 }}>
                    {card.business_id || '-'}
                  </td>

                  <td style={{ padding: 10 }}>
                    <Link href={`/admin/cards/${card.serial}`}>
                      Lihat Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}