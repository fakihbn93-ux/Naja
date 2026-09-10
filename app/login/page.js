'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()

    console.log('=== LOGIN DIMULAI ===')

    setError('')
    setLoading(true)

    try {
      const cleanEmail = email.trim()

      console.log('Email:', cleanEmail)

      const result = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      })

      console.log('HASIL LOGIN:', result)

      if (result.error) {
        console.error('LOGIN ERROR:', result.error)

        setError(
          'Login gagal: ' +
          result.error.message
        )

        setLoading(false)
        return
      }

      if (!result.data || !result.data.user) {
        setError('Login gagal: user tidak ditemukan.')
        setLoading(false)
        return
      }

      console.log(
        'LOGIN BERHASIL:',
        result.data.user.email
      )

      setError('Login berhasil. Membuka dashboard...')

      await new Promise((resolve) => setTimeout(resolve, 500))

      window.location.href = '/admin'

    } catch (err) {
      console.error('LOGIN EXCEPTION:', err)

      setError(
        'Terjadi kesalahan: ' +
        (err?.message || 'Kesalahan tidak diketahui')
      )

      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        background: '#f5f5f5',
      }}
    >

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          padding: 30,
          borderRadius: 16,
          boxShadow: '0 5px 25px rgba(0,0,0,0.1)',
        }}
      >

        <h1 style={{ marginBottom: 8 }}>
          NFC Review Manager
        </h1>

        <p style={{ color: '#666', marginBottom: 25 }}>
          Login Admin / Installer
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 20,
              borderRadius: 8,
              background:
                error.startsWith('Login berhasil')
                  ? '#e7f7ed'
                  : '#ffe8e8',
              color:
                error.startsWith('Login berhasil')
                  ? '#147a3d'
                  : '#b00020',
              wordBreak: 'break-word',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          <div style={{ marginBottom: 16 }}>

            <label
              style={{
                display: 'block',
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              autoComplete="email"
              required
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ccc',
                borderRadius: 8,
                boxSizing: 'border-box',
              }}
            />

          </div>

          <div style={{ marginBottom: 20 }}>

            <label
              style={{
                display: 'block',
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ccc',
                borderRadius: 8,
                boxSizing: 'border-box',
              }}
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 13,
              border: 'none',
              borderRadius: 8,
              background: loading ? '#999' : '#111',
              color: 'white',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

        </form>

      </div>

    </main>
  )
}