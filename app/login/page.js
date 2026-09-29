'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LoginAnimation from "../components/LoginAnimation"


export default function Login() {


  const router = useRouter()


  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)

  const [success,setSuccess] = useState(false)



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

      setSuccess(true)

      setTimeout(()=>{

      router.refresh()



      window.location.href="/admin"

      },4000)



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

        background:
        'radial-gradient(circle at top,#0f172a,#020617)'

      }}

    >



      <div

        style={{

          width:'100%',

          maxWidth:480,

          background:'#e2d5d5',

          padding:"0px 30px 30px",

          borderRadius:16,

          boxShadow:
          '0 10px 30px rgba(249, 231, 231, 0.08)'

        }}

      >



        {/* LOGO */}


        <div
  style={{
    display: "flex",
    justifyContent: "center",
    height: 320,
    overflow: "hidden",
    marginTop: -97,
    marginBottom: -10,
  }}
>
  <div
    style={{
      width: 397,
      height: 320,
      transform: "translateY(10px)",
    }}
  >
    <LoginAnimation success={success} />
  </div>
</div>





        <h1

          style={{

            marginBottom:8,

            textAlign:"center"

          }}

        >

          Naja Store NFC Manager

        </h1>



        <p

          style={{

            color:'#64748b',

            marginBottom:25,

            textAlign:"center"

          }}

        >

          Digital Review Card Management System

          <br/>

          Login Admin / Installer

        </p>






        {
          error &&

          <div

            style={{

              padding:12,

              marginBottom:20,

              borderRadius:8,

              background:'#ffe8e8',

              color:'#b00020'

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

              '#111827',

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