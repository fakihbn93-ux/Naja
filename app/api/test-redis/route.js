import { NextResponse } from 'next/server'
import redis from '../../../lib/redis/client'


export async function GET(){

  await redis.set(
    'nfc:test',
    'connected'
  )


  const value =
    await redis.get(
      'nfc:test'
    )


  return NextResponse.json({

    redis:value

  })

}