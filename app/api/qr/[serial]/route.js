import QRCode from 'qrcode'
import {NextResponse} from 'next/server'
import {supabaseAdmin} from '../../../../lib/supabase/admin'
export async function GET(req,{params}){
 const {serial}=await params;const {data:c}=await supabaseAdmin.from('cards').select('serial').eq('serial',serial).maybeSingle();if(!c)return new NextResponse('Not found',{status:404})
 const base=process.env.NEXT_PUBLIC_APP_URL||new URL(req.url).origin;const url=`${base}/r/${serial}?method=qr`;const png=await QRCode.toBuffer(url,{width:1200,margin:2,errorCorrectionLevel:'H'})
 return new NextResponse(png,{headers:{'Content-Type':'image/png','Cache-Control':'public,max-age=3600'}})
}
