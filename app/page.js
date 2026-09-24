import Link from "next/link";
import Image from "next/image";


export default function HomePage(){

  return (

    <main

      style={{

        minHeight:"100vh",

        width:"100%",

        position:"relative",

        overflow:"hidden",

        backgroundImage:
        "url('/background-naja.png')",

        backgroundSize:"cover",

        backgroundPosition:"center",

      }}

    >


      {/* DARK OVERLAY */}

      <div

        style={{

          position:"absolute",

          inset:0,

          background:
          "linear-gradient(90deg, rgba(0,0,0,0.65), rgba(0,0,0,0.25))",

          zIndex:1

        }}

      />





      {/* LOGO */}

      <div

        style={{

          position:"absolute",

          top:30,

          left:30,

          zIndex:3

        }}

      >

        <Image

          src="/logo-naja.png"

          width={120}

          height={120}

          alt="Naja Store"

          style={{

            objectFit:"contain"

          }}

        />

      </div>







      {/* OWNER IMAGE */}

      <div

        style={{

          position:"absolute",

          right:850,

          bottom:100,

          height:"85vh",

          zIndex:2

        }}

      >

        <Image

          src="/owner-naja.png"

          width={500}

          height={700}

          alt="Owner Naja Store"

          style={{

            height:"130%",

            width:"auto",

            objectFit:"contain",

            objectPosition:"bottom"

          }}

        />

      </div>







      {/* CONTENT */}

      <section

        style={{

          position:"relative",

          zIndex:3,

          minHeight:"100vh",

          display:"flex",

          alignItems:"center",

          paddingLeft:430,

          paddingRight:40

        }}

      >



        <div

          style={{

            maxWidth:700,

            marginTop:-100,

            color:"#ffffff"

          }}

        >





          <h1

            style={{

              fontSize:58,

              fontWeight:800,

              lineHeight:1.15,

              marginBottom:70,

              color:"#a2cffb",

              letterSpacing:"-1px"

            }}

          >

            Naja Store NFC Manager

          </h1>







          <p

            style={{

              fontSize:35,

              fontWeight:500,

              maxWidth:470,

              marginBottom:15,

              color:"#a2cffb"

            }}

          >

            Digital Review Card Management System

          </p>







          <p

            style={{

              fontSize:20,

              lineHeight:1.7,

              maxWidth:470,

              marginBottom:38,

              color:"#a2cffb"

            }}

          >

            Kelola kartu NFC, QR Review, monitoring interaksi,

            dan performa bisnis dalam satu dashboard terpadu.

          </p>







          <Link

            href="/login"

            style={{

              display:"flex",

              alignItems:"center",

              justifyContent:"center",

              marginLeft:100,

              transform:"translateY(40px)",

              width:180,
  
              height:55,

              background:"#5d6d90",

              color:"#ffffff",

              borderRadius:12,

              fontWeight:700,

              fontSize:17,

              textDecoration:"none",

              whiteSpace:"nowrap",

              boxSizing:"border-box",

              boxShadow:
              "0 10px 25px rgba(0,0,0,.35)"

            }}

          >

            Login Admin

          </Link>





        </div>



      </section>





    </main>

  )

}