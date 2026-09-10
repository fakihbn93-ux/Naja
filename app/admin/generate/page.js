'use client'
import { useState } from 'react'

export default function Generate() {
  const [count, setCount] = useState(10)
  const [prefix, setPrefix] = useState('NFC')
  const [msg, setMsg] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  async function go(e) {
    e.preventDefault()
    setMsg('')
    setItems([])
    setLoading(true)

    try {
      const r = await fetch('/api/cards/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quantity: Number(count), prefix }),
      })
      const j = await r.json()
      if (!r.ok) {
        setMsg(j.error || 'Gagal membuat kartu.')
        return
      }
      setItems(j.cards || [])
      setMsg(`Berhasil membuat ${(j.cards || []).length} kartu.`)
    } catch {
      setMsg('Gagal terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="wrap">
      <div className="card">
        <h1>Generate Kartu</h1>
        <p className="muted">Buat serial, token setup, URL NFC, dan URL QR sekaligus.</p>

        <form onSubmit={go}>
          <label>Prefix</label>
          <input className="input" value={prefix} onChange={e => setPrefix(e.target.value.toUpperCase())} />

          <label>Jumlah</label>
          <input className="input" type="number" min="1" max="5000" value={count} onChange={e => setCount(e.target.value)} />

          <button className="btn" disabled={loading}>
            {loading ? 'Membuat...' : 'Generate'}
          </button>
        </form>

        {msg && <p className={msg.startsWith('Gagal') ? 'error' : 'success'}>{msg}</p>}

        {items.length > 0 && (
          <div>
            <h2>Hasil Generate</h2>
            <p>Total kartu: <b>{items.length}</b></p>
            {items.map(x => (
              <div key={x.id} className="card" style={{ marginTop: 12 }}>
                <h3>{x.serial}</h3>
                <p>Status: {x.status}</p>
                <p><b>NFC URL</b><br /><code>{x.nfc_url}</code></p>
                <p><b>QR URL</b><br /><code>{x.qr_url}</code></p>
                <p><b>Setup URL</b><br /><code>{x.setup_url}</code></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
