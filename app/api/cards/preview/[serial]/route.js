import QRCode from 'qrcode'
import { createCanvas } from 'canvas'
import { NextResponse } from 'next/server'

import { requireAdmin } from '../../../../../lib/auth/admin'
import { supabaseAdmin } from '../../../../../lib/supabase/admin'
import { rateLimit } from '../../../../../lib/security/rate-limit'
import redis from '../../../../../lib/redis/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getConfig(resolution) {
  const key =
    String(resolution || 'hd')
      .toLowerCase()

  if (key === 'standard') {
    return {
      width: 1000,
      height: 1200,
      qrSize: 520,
      fontSize: 90,
      border: 4,
    }
  }

  if (key === 'ultra' || key === 'print') {
    return {
      width: 4000,
      height: 4800,
      qrSize: 2080,
      fontSize: 360,
      border: 12,
    }
  }

  return {
    width: 2000,
    height: 2400,
    qrSize: 1040,
    fontSize: 180,
    border: 8,
  }
}

export async function GET(req, { params }) {
  try {
    const auth = await requireAdmin()

    if (auth.error) {
      return new NextResponse(auth.error, {
        status: auth.status,
      })
    }

    // ======================
    // REDIS RATE LIMIT
    // ======================
    try {
      const limiter = await rateLimit({
        key: `preview:${auth.user.id}`,
        limit: 30,
        windowMs: 60000,
      })

      if (!limiter.allowed) {
        return NextResponse.json(
          {
            error: 'Terlalu banyak request preview QR.',
          },
          {
            status: 429,
          }
        )
      }
    } catch (redisError) {
      console.error('REDIS PREVIEW ERROR:', redisError)
    }

    const { serial } = await params

    if (!serial) {
      return new NextResponse('Serial tidak ditemukan', {
        status: 400,
      })
    }

    const cleanSerial =
      serial
        .trim()
        .toUpperCase()

    const {
      data: card,
      error,
    } = await supabaseAdmin
      .from('cards')
      .select('serial, public_id')
      .eq('serial', cleanSerial)
      .maybeSingle()

    if (error) {
      return new NextResponse('Database error', {
        status: 500,
      })
    }

    if (!card) {
      return new NextResponse('Kartu tidak ditemukan.', {
        status: 404,
      })
    }

    if (!card.public_id) {
      return new NextResponse('Public ID kartu tidak ditemukan.', {
        status: 500,
      })
    }

    const { searchParams } = new URL(req.url)

    const resolution =
      (
        searchParams.get('resolution')
        || 'hd'
      )
        .toLowerCase()

    const allowed = [
      'standard',
      'hd',
      'ultra',
      'print',
    ]

    if (!allowed.includes(resolution)) {
      return new NextResponse('Resolusi tidak valid.', {
        status: 400,
      })
    }

    // ======================
    // REDIS IMAGE CACHE READ
    // ======================
    const cacheKey =
      `preview-v4:${cleanSerial}:${resolution}`

    try {
      const cached =
        await redis.getBuffer(cacheKey)

      if (cached) {
        return new NextResponse(cached, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'X-Cache': 'HIT',
            'Cache-Control': 'public,max-age=3600',
          },
        })
      }
    } catch (cacheError) {
      console.error('REDIS CACHE READ ERROR:', cacheError)
    }

    const config = getConfig(resolution)

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(req.url).origin

    // QR publik harus pakai public_id
    const qrUrl =
      `${baseUrl}/r/${card.public_id}?method=qr`

    const canvas =
      createCanvas(
        config.width,
        config.height
      )

    const ctx =
      canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(
      0,
      0,
      config.width,
      config.height
    )

    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = config.border

    ctx.beginPath()
    ctx.roundRect(
      config.width * 0.04,
      config.height * 0.04,
      config.width * 0.92,
      config.height * 0.92,
      config.width * 0.04
    )
    ctx.stroke()

    const qrCanvas =
      createCanvas(
        config.qrSize,
        config.qrSize
      )

    await QRCode.toCanvas(qrCanvas, qrUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: config.qrSize,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    ctx.drawImage(
      qrCanvas,
      (config.width - config.qrSize) / 2,
      config.height * 0.16,
      config.qrSize,
      config.qrSize
    )

    // Label bawah tetap dari serial fisik
    const numberPart =
      card.serial
        .replace('NFC-', '')
        .slice(-3)


    const number =
      `GA-${numberPart}`

    ctx.fillStyle = '#111111'
    ctx.font = `bold ${config.fontSize}px DejaVu Sans`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    ctx.fillText(
      number,
      config.width / 2,
      config.height * 0.82
    )

    const buffer =
      canvas.toBuffer('image/png')

    // ======================
    // REDIS IMAGE CACHE WRITE
    // ======================
    try {
      await redis.set(
        cacheKey,
        buffer,
        'EX',
        60 * 60 * 6
      )
    } catch (cacheError) {
      console.error('REDIS CACHE WRITE ERROR:', cacheError)
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'X-Cache': 'MISS',
        'Cache-Control': 'public,max-age=3600',
      },
    })
  } catch (error) {
    console.error('PREVIEW CARD ERROR:', error)

    return new NextResponse('Gagal membuat preview kartu', {
      status: 500,
    })
  }
}