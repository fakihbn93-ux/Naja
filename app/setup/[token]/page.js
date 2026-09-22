'use client'

import { 
  useState, 
  useEffect 
} from 'react'

import { 
  useSearchParams,
  useRouter
} from 'next/navigation'



export default function SetupCardPage(){


  const searchParams = useSearchParams()

  const router = useRouter()


  const setupToken =
    searchParams.get('token')

  const [publicId,setPublicId] = useState('')

  const [cardNumber,setCardNumber] = useState('')

  const [name,setName] = useState('')

  const [url,setUrl] = useState('')


  const [loading,setLoading] = useState(false)

  const [loadingCard,setLoadingCard] = useState(true)

  const [message,setMessage] = useState('')





  // =========================
  // AMBIL DATA KARTU DARI TOKEN
  // =========================

  useEffect(()=>{


    async function loadCard(){


      try{


        const res = await fetch(

          `/api/cards/setup/${setupToken}`,

          {
            cache:'no-store'
          }

        )



        const data = await res.json()



        if(!res.ok){

          throw new Error(
            data.error ||
            'Kartu tidak ditemukan'
          )

        }

        setPublicId(data.public_id)

        setCardNumber(
          data.serial
          .replace('NFC-','')
          .slice(-3)
        )



      }catch(err){


        setMessage(
          err.message
        )


      }finally{


        setLoadingCard(false)


      }


    }



    if(setupToken){

      loadCard()

    }



  },[setupToken])







  // =========================
  // AKTIVASI KARTU
  // =========================

  async function activate(e){


    e.preventDefault()



    setLoading(true)

    setMessage('')



    try{


      const res = await fetch(

        '/api/cards/activate',

        {

          method:'POST',


          headers:{

            'Content-Type':
            'application/json'

          },


          body:JSON.stringify({

            public_id: publicId,

            token:setupToken,

            name,

            url

          })


        }

      )




      const data =
      await res.json()





      if(!res.ok){


        throw new Error(

          data.error ||
          'Aktivasi gagal'

        )


      }






      router.push(

        `/setup/success?card=${cardNumber}&name=${encodeURIComponent(data.businessName)}`

      )





    }catch(err){


      setMessage(
        err.message
      )


    }finally{


      setLoading(false)


    }


  }







  return (


    <main

      style={pageStyle}

    >



      <div

        style={containerStyle}

      >



        <h1

          style={titleStyle}

        >

          Aktivasi Kartu NFC

        </h1>




        <p

          style={subtitleStyle}

        >

          Hubungkan kartu NFC dengan bisnis Anda.

        </p>






        {
          loadingCard &&

          <p>

            Membaca data kartu...

          </p>

        }






        {
          cardNumber &&


          <form

            onSubmit={activate}

          >




            <label

              style={labelStyle}

            >

              No Kartu

            </label>




            <div

              style={serialStyle}

            >

              {cardNumber}

            </div>







            <label

              style={labelStyle}

            >

              Nama Bisnis

            </label>




            <input


              value={name}


              onChange={

                e=>
                setName(e.target.value)

              }


              placeholder="Contoh: Kopi Senja"


              style={inputStyle}


              required


            />







            <label

              style={labelStyle}

            >

              Google Review URL

            </label>





            <input


              value={url}


              onChange={

                e=>
                setUrl(e.target.value)

              }



              placeholder="https://maps.app.goo.gl/..."



              style={inputStyle}



              required



            />







            <button


              disabled={loading}



              style={buttonStyle}



            >



              {

                loading

                ?

                'Mengaktifkan...'


                :

                'Aktifkan Kartu'


              }



            </button>





          </form>



        }







        {

          message &&



          <div

            style={messageStyle}

          >

            {message}


          </div>



        }







      </div>





    </main>



  )

}







const pageStyle={


  minHeight:'100vh',

  background:'#f8fafc',

  padding:40,

  display:'flex',

  alignItems:'center',

  justifyContent:'center'


}





const containerStyle={


  width:'100%',

  maxWidth:650,

  background:'#fff',

  padding:45,

  borderRadius:28,

  border:'1px solid #e5e7eb',

  boxShadow:'0 10px 30px rgba(0,0,0,0.05)'


}





const titleStyle={


  fontSize:42,

  fontWeight:800,

  marginBottom:12,

  color:'#0f172a'


}




const subtitleStyle={


  fontSize:18,

  color:'#64748b',

  marginBottom:35


}




const labelStyle={


  display:'block',

  fontSize:17,

  fontWeight:600,

  marginBottom:8,

  color:'#0f172a'


}




const inputStyle={


  width:'100%',

  padding:16,

  marginBottom:24,

  border:'1px solid #cbd5e1',

  borderRadius:14,

  fontSize:17


}




const serialStyle={


  width:'100%',

  padding:16,

  marginBottom:24,

  border:'1px solid #cbd5e1',

  borderRadius:14,

  fontSize:20,

  fontWeight:700,

  background:'#f8fafc'


}





const buttonStyle={


  width:'100%',

  padding:17,

  background:'#111827',

  color:'#fff',

  border:0,

  borderRadius:14,

  fontSize:18,

  fontWeight:700,

  cursor:'pointer'


}





const messageStyle={


  marginTop:25,

  padding:18,

  background:'#fee2e2',

  borderRadius:14,

  color:'#991b1b',

  fontSize:16


}