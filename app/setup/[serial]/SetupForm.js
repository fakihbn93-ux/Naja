'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupForm({ serial, token }) {

  const router = useRouter()

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)


  async function submit(e) {

    e.preventDefault()

    setMsg('')
    setLoading(true)


    try {

      const r = await fetch('/api/cards/activate', {

        method:'POST',

        headers:{
          'content-type':'application/json'
        },

        body:JSON.stringify({
          serial,
          token,
          name,
          url
        })

      })


      const j = await r.json()


      if (!r.ok) {

        setMsg(
          `Gagal: ${j.error || 'Aktivasi gagal.'}`
        )

        return

      }


      router.push(
        `/setup/success?serial=${serial}`
      )


    } catch {

      setMsg(
        'Gagal terhubung ke server.'
      )


    } finally {

      setLoading(false)

    }

  }



  return (

    <form onSubmit={submit}>


      <label>
        Nama toko / restoran
      </label>


      <input

        className="input"

        value={name}

        onChange={
          e=>setName(e.target.value)
        }

        placeholder="Contoh: Kopi Mantap Jiwo"

        required

      />



      <label>
        URL Google Review
      </label>


      <input

        className="input"

        value={url}

        onChange={
          e=>setUrl(e.target.value)
        }

        placeholder="https://maps.app.goo.gl/..."

        required

      />



      <button

        className="btn"

        disabled={loading}

      >

        {
          loading
          ? 'Mengaktifkan...'
          : 'Aktifkan Kartu'
        }


      </button>



      {
        msg && (

          <p

            className="error"

          >

            {msg}

          </p>

        )
      }


    </form>

  )

}