import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase/admin'

function validGoogleUrl(value) {
  try {
    const u = new URL(value)
    if (u.protocol !== 'https:') return false

    const host = u.hostname.toLowerCase()
    const allowed =
      host === 'google.com' ||
      host.endsWith('.google.com') ||
      host === 'g.page' ||
      host === 'maps.app.goo.gl'

    return allowed
  } catch {
    return false
  }
}

export async function POST(req) {
  const { serial, token, name, url } = await req.json().catch(() => ({}))

  if (!serial || !token || !name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'Data belum lengkap.' }, { status: 400 })
  }

  const cleanUrl = url.trim()
  if (!validGoogleUrl(cleanUrl)) {
    return NextResponse.json(
      { error: 'Gunakan URL Google Review HTTPS. Link maps.app.goo.gl juga diperbolehkan.' },
      { status: 400 }
    )
  }

  const db = supabaseAdmin

  const { data: c, error: cardError } = await db
    .from('cards')
    .select('id,serial,status,setup_token,business_id')
    .eq('serial', serial)
    .eq('setup_token', token)
    .maybeSingle()

  if (cardError) {
    console.error('Card lookup error:', cardError)
    return NextResponse.json({ error: cardError.message }, { status: 500 })
  }

  if (!c) {
    return NextResponse.json(
      { error: 'Kartu atau token setup tidak valid.' },
      { status: 404 }
    )
  }

  if (c.status !== 'UNASSIGNED') {
    return NextResponse.json(
      { error: 'Kartu sudah tidak dapat diaktifkan dengan token ini.' },
      { status: 409 }
    )
  }

  const { data: b, error: businessError } = await db
    .from('businesses')
    .insert({
      name: name.trim(),
      google_review_url: cleanUrl,
    })
    .select('id')
    .single()

  if (businessError) {
    return NextResponse.json({ error: businessError.message }, { status: 500 })
  }

  const { error: updateError } = await db
    .from('cards')
    .update({
      business_id: b.id,
      status: 'ACTIVE',
      activated_at: new Date().toISOString(),
      setup_token: null,
    })
    .eq('id', c.id)
    .eq('status', 'UNASSIGNED')

  if (updateError) {
    await db.from('businesses').delete().eq('id', b.id)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const app = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

  return NextResponse.json({
    message: 'Kartu berhasil diaktifkan.',
    businessName: name.trim(),
    customerUrl: `${app}/r/${serial}?method=nfc`,
  })
}
