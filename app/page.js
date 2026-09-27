import Image from "next/image";
import Link from "next/link";


export default function HomePage(){

return (

<main
style={{
minHeight:"100vh",
background:
"radial-gradient(circle at top left, #d4af37 0%, transparent 25%), radial-gradient(circle at bottom right, #00c878 0%, transparent 30%), linear-gradient(135deg,#0f172a,#020617)",
padding:"30px",
fontFamily:"Inter, Arial, sans-serif"
}}
>


{/* MAIN CARD */}

<div

style={{

maxWidth:"1400px",

margin:"auto",

background:"rgba(255,255,255,.96)",

borderRadius:"45px",

overflow:"hidden",

backdropFilter:"blur(20px)",

boxShadow:
"0 40px 100px rgba(0,0,0,.45)"

}}

>



{/* NAVBAR */}

<header

style={{

height:"90px",

display:"flex",

alignItems:"center",

justifyContent:"space-between",

padding:"0 60px",

background:
"rgba(159, 158, 158, 0.85)",

backdropFilter:"blur(15px)",

borderBottom:
"1px solid rgba(0,0,0,.05)"

}}

>


<div

style={{

display:"flex",

alignItems:"center",

gap:"15px"

}}

>


<Image

src="/logo-naja.png"

width={65}

height={65}

alt="logo"

/>


<h2

style={{

fontSize:"28px",

margin:0,

fontWeight:800,

color:"#111827"

}}

>

Naja Store

</h2>


</div>




<nav

style={{

display:"flex",

gap:"45px",

fontSize:"17px",

fontWeight:600,

color:"#374151"

}}

>

<Link href="#">
Home
</Link>


<Link href="#service">
Service
</Link>


<Link href="#contact">
Contact
</Link>


</nav>



</header>






{/* HERO */}


<section

style={{

height:"650px",

position:"relative",

backgroundImage:
"url('/naja-company-bg.png')",

backgroundSize:"cover",

backgroundPosition:"center",

display:"flex",

justifyContent:"center",

alignItems:"center"

}}

>



{/* OVERLAY */}

<div

style={{

position:"absolute",

inset:0,

background:"linear-gradient(90deg, rgba(0,0,0,.65), rgba(0,0,0,.25))"

}}

/>






{/* PROFILE IMAGE */}


<Link

href="/login"

style={{

position:"absolute",

top:"55px",

zIndex:3,

width:"190px",

height:"190px",

borderRadius:"50%",

overflow:"hidden",

border:"6px solid #847c26",

background:"rgba(255,255,255,.08)",

boxShadow:
"0 20px 60px rgba(0,0,0,.6)",

cursor:"pointer",

transition:"0.3s",

display:"block"

}}

>


<Image

src="/owner-naja.png"

width={250}

height={350}

alt="Admin Login"

style={{

width:"100%",

height:"120%",

objectFit:"contain",

objectPosition:"center bottom",

marginTop:"-15px"

}}

/>


</Link>








{/* HERO TEXT */}


<div

style={{

position:"relative",

zIndex:2,

textAlign:"center",

color:"white",

marginTop:"210px"

}}

>


<h1

style={{

fontSize:"58px",

fontWeight:800,

margin:"0 0 10px",

letterSpacing:"-1px"

}}

>

Naja Store

</h1>



<h2

style={{

fontSize:"28px",

fontWeight:500,

margin:0

}}

>

Digital NFC Business Solution

</h2>


<div

style={{

display:"inline-block",

marginTop:"20px",

padding:"8px 22px",

borderRadius:"50px",

background:"rgba(212,175,55,.15)",

border:
"1px solid #d4af37",

color:"#d4af37",

fontSize:"15px",

fontWeight:700,

letterSpacing:"3px"

}}

>

SMART DIGITAL TECHNOLOGY

</div>



<p

style={{

maxWidth:"650px",

fontSize:"18px",

lineHeight:"1.8",

margin:"45px auto",

color:"#f1f5f9"

}}

>

Transformasi bisnis modern melalui teknologi NFC,
QR Digital Review, dan sistem manajemen interaksi
pelanggan dalam satu platform terpadu.

</p>


</div>



</section>









{/* STATISTIC */}


<section

style={{

display:"flex",

justifyContent:"center",

gap:"90px",

padding:"45px",

background:"#020617"

}}

>


{[

["500+","Business Partner"],

["10K+","Digital Interaction"],

["98%","Customer Satisfaction"],

["24/7","System Support"]

].map((item,index)=>(


<div

key={index}

style={{

textAlign:"center"

}}

>


<h2

style={{

fontSize:"38px",

margin:0,

color:"#d4af37",

fontWeight:800

}}

>

{item[0]}

</h2>


<p

style={{

marginTop:"8px",

color:"#64748b",

fontWeight:600

}}

>

{item[1]}

</p>


</div>


))}



</section>









{/* SERVICE */}


<section

id="service"

style={{

padding:"90px 80px",

position:"relative",

backgroundImage:
"url('/service-bg.png')",

backgroundSize:"cover",

backgroundPosition:"center",

overflow:"hidden"

}}

>


<div

style={{

position:"absolute",

inset:0,

background:
"linear-gradient(180deg,rgba(2,6,23,.35),rgba(2,6,23,.55))",

zIndex:0

}}

/>


<h2

style={{

fontSize:"42px",

textAlign:"center",

marginBottom:"50px",

fontWeight:800,

position:"relative",

zIndex:2,

color:"#ffffff"

}}

>

Our Services

</h2>



<div

style={{

display:"grid",

gridTemplateColumns:"repeat(3,1fr)",

gap:"30px",

position:"relative",

zIndex:2

}}

>



{[


{

title:"NFC Digital Card",

text:"Smart business card berbasis NFC untuk meningkatkan branding dan kemudahan berbagi informasi."

},


{

title:"QR Review System",

text:"Sistem review digital yang membantu bisnis mendapatkan feedback pelanggan secara cepat."

},


{

title:"Business Dashboard",

text:"Monitoring interaksi pelanggan dan performa bisnis melalui dashboard terpadu."

}



].map((service,index)=>(


<div

key={index}

style={{

background:"rgba(255,255,255,.22)",

backdropFilter:"blur(15px)",

border:
"1px solid rgba(255,255,255,.35)",

padding:"35px",

borderRadius:"25px",

boxShadow:"0 15px 35px rgba(0,0,0,.08)"

}}

>


<h3

style={{

fontSize:"25px",

color:"#d4af37"

}}

>

{service.title}

</h3>


<p

style={{

lineHeight:"1.8",

color:"#e7eff9"

}}

>

{service.text}

</p>


</div>


))}


</div>


</section>









{/* CONTACT */}


<section

id="contact"

style={{

padding:"70px",

background:"#0f172a",

color:"white",

textAlign:"center"

}}

>


<h2

style={{

fontSize:"42px"

}}

>

Grow Your Digital Business with Smart Review Cards
</h2>


<p

style={{

fontSize:"20px",

color:"#cbd5e1"

}}

>

Contact Us

<br/>

📲 WhatsApp: +62 859106765033
📧 Email: najastore4@email.com
🌐 Website: www.najastore.my.id


</p>


</section>






</div>


</main>


)

}