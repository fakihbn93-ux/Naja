import SetupForm from './SetupForm'
import {supabaseAdmin} from '../../../lib/supabase/admin'
export const dynamic='force-dynamic'
export default async function Setup({params,searchParams}){
 const {serial}=await params; const sp=await searchParams; const token=sp?.token||''
 if(!token)return <main className="wrap" style={{maxWidth:650}}><div className="card"><h1>Setup kartu</h1><p className="error">Token setup tidak ditemukan. Tap NFC kartu untuk membuka link instalasi yang benar.</p></div></main>
 const {data:c}=await supabaseAdmin.from('cards').select('serial,status').eq('serial',serial).eq('setup_token',token).maybeSingle()
 if(!c)return <main className="wrap" style={{maxWidth:650}}><div className="card"><h1>Link setup tidak valid</h1><p>Token salah atau kartu sudah diaktifkan.</p></div></main>
 if(c.status!=='UNASSIGNED')return <main className="wrap" style={{maxWidth:650}}><div className="card"><h1>Kartu sudah digunakan</h1><p>Status: {c.status}</p></div></main>
 return <main className="wrap" style={{maxWidth:650}}><div className="card"><h1>Aktivasi Kartu {c.serial}</h1><p className="muted">Masukkan data toko. Setelah aktif, NFC dan QR tidak perlu dicetak ulang jika link Google Review berubah.</p><SetupForm serial={c.serial} token={token}/></div></main>
}
