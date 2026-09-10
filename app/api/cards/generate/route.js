import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '../../../../lib/supabase/server'
import { supabaseAdmin } from '../../../../lib/supabase/admin'

export async function POST(req) {
  const sb = await createClient()

  const {
    data: { user },
  } = await sb.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data: profile } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Khusus admin.' },
      { status: 403 }
    )
  }

  const { count = 1, prefix = 'NFC', start = null } =
    await req.json().catch(() => ({}))

  if (!Number.isInteger(count) || count < 1 || count > 5000) {
    return NextResponse.json(
      { error: 'Jumlah 1-5000.' },
      { status: 400 }
    )
  }

  const base =
    (prefix || 'NFC')
      .replace(/[^A-Z0-9_-]/gi, '')
      .toUpperCase()
      .slice(0, 10) || 'NFC'

  let n = Number(start) || 0

  if (n < 1) {
    const { data: last } = await supabaseAdmin
      .from('cards')
      .select('serial')
      .like('serial', `${base}-%`)
      .order('serial', { ascending: false })
      .limit(1)
      .maybeSingle()

    const m = last?.serial?.match(/(\d+)$/)
    n = m ? Number(m[1]) + 1 : 1
  }

  const rows = Array.from(
    { length: count },
    (_, i) => ({
      serial: `${base}-${String(n + i).padStart(6, '0')}`,
      setup_token: crypto.randomBytes(18).toString('hex'),
      status: 'UNASSIGNED',
    })
  )

  const { data, error } = await supabaseAdmin
    .from('cards')
    .insert(rows)
    .select('serial,setup_token')

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  const app =
    process.env.NEXT_PUBLIC_APP_URL ||
    new URL(req.url).origin

  return NextResponse.json({
    created: data.length,
    firstSerial: data[0].serial,
    lastSerial: data[data.length - 1].serial,
    cards: data.map((x) => ({
      serial: x.serial,
      setup_url: `${app}/setup/${x.serial}?token=${x.setup_token}`,
      qr_url: `${app}/r/${x.serial}?method=qr`,
      nfc_customer_url: `${app}/r/${x.serial}?method=nfc`,
    })),
  })
}