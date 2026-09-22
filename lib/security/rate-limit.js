import redis from '../redis/client'


export async function rateLimit({
  key,
  limit = 10,
  windowMs = 60000
}) {

  const redisKey =
    `nfc-review:rate-limit:${key}`


  try {


    const current =
      await redis.incr(redisKey)



    if(current === 1){

      await redis.pexpire(
        redisKey,
        windowMs
      )

    }



    const ttl =
      await redis.pttl(redisKey)



    return {


      allowed:
        current <= limit,


      remaining:
        Math.max(
          limit - current,
          0
        ),


      reset:

        ttl > 0

        ?

        Date.now() + ttl

        :

        Date.now() + windowMs


    }



  } catch(error){


    console.error(
      'REDIS RATE LIMIT ERROR:',
      error
    )



    /*
      Fail open:
      Jika Redis gagal,
      request tetap boleh berjalan.
      Jangan matikan sistem aktivasi.
    */


    return {


      allowed:true,


      remaining:
        limit,


      reset:
        Date.now() + windowMs


    }


  }


}