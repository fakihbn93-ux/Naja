import Redis from 'ioredis'


const globalForRedis = globalThis



function createRedisClient(){


  if(!process.env.REDIS_URL){

    throw new Error(
      'REDIS_URL belum tersedia.'
    )

  }



  const client =
    new Redis(

      process.env.REDIS_URL,

      {

        tls:{},


        maxRetriesPerRequest:3,


        enableReadyCheck:true,


        lazyConnect:false,


        retryStrategy(times){

          if(times > 5){

            return null

          }


          return Math.min(
            times * 500,
            3000
          )

        }

      }

    )





  client.on(
    'connect',
    ()=>{

      console.log(
        'REDIS CONNECTING'
      )

    }
  )




  client.on(
    'ready',
    ()=>{

      console.log(
        'REDIS READY'
      )

    }
  )




  client.on(
    'error',
    (error)=>{

      console.error(
        'REDIS ERROR:',
        error.message
      )

    }
  )




  return client

}





const redis =
  globalForRedis.redis ||
  createRedisClient()




if(process.env.NODE_ENV !== 'production'){

  globalForRedis.redis =
    redis

}




export default redis