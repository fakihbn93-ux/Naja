import {createClient} from '../../../../lib/supabase/server'
import {supabaseAdmin} from '../../../../lib/supabase/admin'
import Link from 'next/link'

export const dynamic='force-dynamic'

export default async function Detail({params}) {
 const sb=await createClient()
 const {data:{user}}=await sb.auth.getUser()

 if(!user) {
  return <main className="wrap"><Link href="/login">Login</Link></main>
 }

 const {data:p}=await sb
  .from('profiles')
  .select('role')
  .eq('id',user.id)
  .maybeSingle()

 if(p?.role!=='admin') {
  return <main className="wrap">
   <div className="card">Akses admin diperlukan.</div>
  </main>
 }

 const {serial}=await params

 const {data:c}=await supabaseAdmin
  .from('cards')
  .select('*,businesses(*)')
  .eq('serial',serial)
  .maybeSingle()

 if(!c) {
  return <main className="wrap">
   <div className="card">Kartu tidak ditemukan.</div>
  </main>
 }

 const {data:events=[]}=await supabaseAdmin
  .from('events')
  .select('method,created_at')
  .eq('card_id',c.id)
  .order('created_at',{ascending:false})
  .limit(50)

 const app=process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000'

 const qr=`${app}/r/${c.serial}?method=qr`
 const nfc=`${app}/r/${c.serial}?method=nfc`

 return (
  <main className="wrap">

   <div className="nav">
    <Link href="/admin">← Dashboard</Link>
    <span className="status">{c.status}</span>
   </div>

   <div className="card">

    <h1>{c.serial}</h1>

    <p>
     Toko: <b>{c.businesses?.name||'Belum diaktifkan'}</b>
    </p>

    <div className="grid grid2">

     <div>

      <h2>URL customer</h2>

      <p className="muted">NFC</p>
      <code>{nfc}</code>

      <p className="muted">QR</p>
      <code>{qr}</code>

      <div style={{marginTop:16}}>
       <img 
        src={`/api/qr/${c.serial}`} 
        width="220" 
        alt="QR"
       />
      </div>

     </div>


     <div>

      <h2>Ubah data</h2>

      <form action="/api/cards/update" method="post">

       <input 
        type="hidden" 
        name="serial" 
        value={c.serial}
       />

       <label>Nama toko</label>

       <input 
        className="input" 
        name="name" 
        defaultValue={c.businesses?.name||''}
       />


       <label>Google Review URL</label>

       <input 
        className="input" 
        name="url" 
        defaultValue={c.businesses?.google_review_url||''}
       />


       <label>Status</label>

       <select 
        className="input" 
        name="status" 
        defaultValue={c.status}
       >
        <option>UNASSIGNED</option>
        <option>ACTIVE</option>
        <option>INACTIVE</option>
        <option>LOST</option>
        <option>REPLACED</option>
       </select>


       <button className="btn">
        Simpan
       </button>

      </form>

     </div>

    </div>

   </div>


   <div 
    className="card" 
    style={{marginTop:16}}
   >

    <h2>Aktivitas</h2>

    <table className="table">

     <thead>
      <tr>
       <th>Metode</th>
       <th>Waktu</th>
      </tr>
     </thead>


     <tbody>

      {events.map((e,i)=>(

       <tr key={i}>

        <td>{e.method}</td>

        <td>
         {new Date(e.created_at).toLocaleString('id-ID',{
          timeZone:'Asia/Jakarta',
          dateStyle:'short',
          timeStyle:'medium'
         })}
        </td>

       </tr>

      ))}

     </tbody>

    </table>

   </div>


  </main>
 )
}