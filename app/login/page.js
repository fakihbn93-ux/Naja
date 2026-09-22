'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'


export default function Login() {


  const router = useRouter()


  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)



  async function submit(e){

    e.preventDefault()


    setError('')
    setLoading(true)



    try{


      const supabase = createBrowserClient(

        process.env.NEXT_PUBLIC_SUPABASE_URL,

        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      )



      const cleanEmail =
        email.trim()



      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({

        email:cleanEmail,

        password

      })





      console.log(
        'LOGIN:',
        data,
        error
      )





      if(error){


        setError(

          'Login gagal: ' +
          error.message

        )


        setLoading(false)

        return

      }





      if(!data.user){


        setError(
          'User tidak ditemukan.'
        )


        setLoading(false)

        return

      }






      // pastikan session tersimpan

      await supabase.auth.getSession()






      setError(

        'Login berhasil. Membuka dashboard...'

      )





      router.refresh()






      setTimeout(()=>{


        window.location.href =
          '/admin'


      },500)







    }catch(err){



      console.error(
        'LOGIN ERROR:',
        err
      )



      setError(

        'Terjadi kesalahan: ' +
        err.message

      )



      setLoading(false)


    }


  }







  return (

    <main

      style={{

        minHeight:'100vh',

        display:'flex',

        justifyContent:'center',

        alignItems:'center',

        padding:20,

        background:'#f5f5f5'

      }}

    >



      <div

        style={{

          width:'100%',

          maxWidth:420,

          background:'#fff',

          padding:30,

          borderRadius:16,

          boxShadow:
          '0 5px 25px rgba(0,0,0,.1)'

        }}

      >



        <h1

          style={{

            marginBottom:8

          }}

        >

          NFC Review Manager

        </h1>




        <p

          style={{

            color:'#666',

            marginBottom:25

          }}

        >

          Login Admin / Installer

        </p>






        {
          error &&

          <div

            style={{

              padding:12,

              marginBottom:20,

              borderRadius:8,

              background:

              error.startsWith('Login berhasil')

              ?

              '#e7f7ed'

              :

              '#ffe8e8',


              color:

              error.startsWith('Login berhasil')

              ?

              '#147a3d'

              :

              '#b00020'

            }}

          >

            {error}


          </div>

        }







        <form onSubmit={submit}>



          <label

            style={{

              display:'block',

              fontWeight:600,

              marginBottom:6

            }}

          >

            Email

          </label>




          <input

            type="email"

            value={email}

            onChange={
              e=>setEmail(e.target.value)
            }

            required

            autoComplete="email"

            style={{

              width:'100%',

              padding:12,

              marginBottom:18,

              border:'1px solid #ccc',

              borderRadius:8,

              boxSizing:'border-box'

            }}

          />






          <label

            style={{

              display:'block',

              fontWeight:600,

              marginBottom:6

            }}

          >

            Password

          </label>





          <input

            type="password"

            value={password}

            onChange={
              e=>setPassword(e.target.value)
            }

            required

            autoComplete="current-password"

            style={{

              width:'100%',

              padding:12,

              marginBottom:20,

              border:'1px solid #ccc',

              borderRadius:8,

              boxSizing:'border-box'

            }}

          />







          <button

            type="submit"

            disabled={loading}

            style={{

              width:'100%',

              padding:13,

              border:0,

              borderRadius:8,

              background:

              loading

              ?

              '#999'

              :

              '#111',

              color:'#fff',

              fontSize:16,

              fontWeight:600,

              cursor:

              loading

              ?

              'not-allowed'

              :

              'pointer'

            }}

          >

            {
              loading

              ?

              'Memproses...'

              :

              'Masuk'
            }


          </button>



        </form>




      </div>



    </main>

  )

}