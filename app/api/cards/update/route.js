import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { supabaseAdmin } from '../../../../lib/supabase/admin'

function validUrl(value) {
  try {
    const u = new URL(value)

    return (
      u.protocol === 'https:' &&
      (
        u.hostname === 'google.com' ||
        u.hostname.endsWith('.google.com') ||
        u.hostname === 'g.page'
      )
    )
  } catch {
    return false
  }
}

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

  const { data: p } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (p?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Khusus admin.' },
      { status: 403 }
    )
  }

  const f = await req.formData()

  const serial = String(f.get('serial') || '')
  const name = String(f.get('name') || '').trim()
  const url = String(f.get('url') || '').trim()
  const status = String(f.get('status') || '')

  if (
    ![
      'UNASSIGNED',
      'ACTIVE',
      'INACTIVE',
      'LOST',
      'REPLACED',
    ].includes(status)
  ) {
    return NextResponse.json(
      { error: 'Status tidak valid.' },
      { status: 400 }
    )
  }

  const { data: c } = await supabaseAdmin
    .from('cards')
    .select('id,business_id')
    .eq('serial', serial)
    .maybeSingle()

  if (!c) {
    return NextResponse.json(
      { error: 'Kartu tidak ditemukan.' },
      { status: 404 }
    )
  }

  if (status === 'ACTIVE' && !validUrl(url)) {
    return NextResponse.json(
      { error: 'Google Review URL tidak valid.' },
      { status: 400 }
    )
  }

  let businessId = c.business_id

  if (businessId) {
    const { error } = await supabaseAdmin
      .from('businesses')
      .update({
        name: name || 'Tanpa nama',
        google_review_url: url || 'https://google.com',
        status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      })
      .eq('id', businessId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
  } else if (name && url) {
    const { data: b, error } = await supabaseAdmin
      .from('businesses')
      .insert({
        name,
        google_review_url: url,
        status: 'ACTIVE',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    businessId = b.id
  }

  const { error } = await supabaseAdmin
    .from('cards')
    .update({
      business_id: businessId,
      status,
    })
    .eq('id', c.id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.redirect(
    new URL(`/admin/cards/${serial}`, req.url)
  )
}