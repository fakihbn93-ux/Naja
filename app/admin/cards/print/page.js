'use client'

import { useState } from 'react'

export default function PrintCards() {
  const [start, setStart] = useState('001')
  const [end, setEnd] = useState('010')
  const [resolution, setResolution] = useState('hd')
  const [preview, setPreview] = useState([])

  function normalizeNumber(value) {
    const num = Number(value)

    if (!Number.isFinite(num) || num < 1) {
      return 1
    }

    return Math.floor(num)
  }

  function createSerial(number) {
    return `NFC-${String(number).padStart(6, '0')}`
  }

  function createLabel(number) {
    return `GA-${String(number).padStart(3, '0')}`
  }

  function getResolutionLabel(value) {
    if (value === 'standard') {
      return 'Standard - 1000 x 1200 px'
    }

    if (value === 'ultra') {
      return 'Ultra HD - 4000 x 4800 px'
    }

    if (value === 'print') {
      return 'Print - 4000 x 4800 px'
    }

    return 'HD - 2000 x 2400 px'
  }

  function generatePreview() {
    const startNum = normalizeNumber(start)
    const endNum = normalizeNumber(end)

    if (startNum > endNum) {
      alert('Nomor awal tidak boleh lebih besar dari nomor akhir')
      return
    }

    if (endNum - startNum + 1 > 100) {
      alert('Preview maksimal 100 kartu')
      return
    }

    const cards = []

    for (let i = startNum; i <= endNum; i++) {
      cards.push({
        serial: createSerial(i),
        label: createLabel(i),
      })
    }

    setPreview(cards)
  }

  function clearPreview() {
    setPreview([])
  }

  function downloadZip() {
    const startNum = normalizeNumber(start)
    const endNum = normalizeNumber(end)

    if (startNum > endNum) {
      alert('Range nomor tidak valid')
      return
    }

    window.location.href =
      `/api/cards/download-all?start=${startNum}&end=${endNum}&resolution=${resolution}`
  }

  function downloadOne(serial) {
    window.location.href =
      `/api/cards/download-one/${serial}?resolution=${resolution}`
  }

  return (
    <main
      style={{
        padding: 40,
        maxWidth: 1400,
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontSize: 48,
          marginBottom: 10,
        }}
      >
        Download Kartu PNG
      </h1>

      <p
        style={{
          color: '#64748b',
          fontSize: 18,
          marginBottom: 30,
        }}
      >
        Generate QR kartu NFC dalam format PNG untuk kebutuhan desain dan cetak.
      </p>

      <div
        style={{
          background: '#fff',
          padding: 25,
          borderRadius: 20,
          border: '1px solid #e5e7eb',
        }}
      >
        <label>Nomor awal</label>
        <input
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={inputStyle}
        />

        <label>Nomor akhir</label>
        <input
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={inputStyle}
        />

        <label>Resolusi PNG</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          style={inputStyle}
        >
          <option value="standard">
            Standard - 1000 x 1200 px
          </option>

          <option value="hd">
            HD - 2000 x 2400 px
          </option>

          <option value="ultra">
            Ultra HD - 4000 x 4800 px
          </option>

          <option value="print">
            Print - 4000 x 4800 px
          </option>
        </select>

        <div
          style={{
            display: 'flex',
            gap: 15,
            marginTop: 20,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={generatePreview}
            style={buttonStyle}
          >
            Preview Kartu
          </button>

          <button
            onClick={downloadZip}
            style={buttonStyle}
          >
            Download ZIP PNG
          </button>

          {preview.length > 0 && (
            <button
              onClick={clearPreview}
              style={{
                ...buttonStyle,
                background: '#dc2626',
              }}
            >
              Hapus Preview
            </button>
          )}
        </div>
      </div>

      {preview.length > 0 && (
        <section>
          <h2
            style={{
              marginTop: 40,
              marginBottom: 8,
            }}
          >
            Preview ({preview.length} kartu)
          </h2>

          <p
            style={{
              color: '#64748b',
              marginBottom: 20,
            }}
          >
            Resolusi aktif:{' '}
            <b>{getResolutionLabel(resolution)}</b>
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
              gap: 20,
            }}
          >
            {preview.map((card) => (
              <div
                key={`${card.serial}-${resolution}`}
                style={{
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 20,
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <img
                  src={`/api/cards/preview/${encodeURIComponent(card.serial)}?resolution=${resolution}`}
                  alt={card.serial}
                  style={{
                    width: '100%',
                    maxWidth: 300,
                    height: 'auto',
                    borderRadius: 12,
                    display: 'block',
                    margin: '0 auto',
                  }}
                />

                <div
                  style={{
                    marginTop: 10,
                    color: '#64748b',
                  }}
                >
                  {card.serial}
                </div>

                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: 3,
                  }}
                >
                  {card.label}
                </div>

                <button
                  onClick={() => downloadOne(card.serial)}
                  style={{
                    marginTop: 15,
                    padding: '10px 18px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 0,
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Download PNG
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

const inputStyle = {
  width: '100%',
  padding: 14,
  margin: '10px 0 20px',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  fontSize: 18,
}

const buttonStyle = {
  padding: '14px 24px',
  background: '#111827',
  color: '#fff',
  border: 0,
  borderRadius: 12,
  fontSize: 18,
  fontWeight: 600,
  cursor: 'pointer',
}