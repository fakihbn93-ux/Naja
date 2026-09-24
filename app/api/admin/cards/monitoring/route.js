import { NextResponse } from 'next/server'

import { supabaseAdmin } from '../../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../../lib/auth/admin'


export async function GET(){

try{


const auth =
await requireAdmin()


if(auth.error){

return NextResponse.json(
{
error:auth.error
},
{
status:auth.status
}
)

}



const {data:events,error}=

await supabaseAdmin

.from('events')

.select(`

id,

method,

created_at,

cards(

serial,

status,

businesses(

name

)

)

`)

.order(

'created_at',

{
ascending:false
}

)

.limit(50)





if(error){

console.error(error)

return NextResponse.json(
{
error:error.message
},
{
status:500
}
)

}





const monitoring =

(events || [])

.map(item=>({

serial:
item.cards?.serial || '-',

status:
item.cards?.status || '-',

store:
item.cards?.businesses?.name || '-',

method:
item.method,

created_at:
item.created_at


}))





return NextResponse.json({

total:
monitoring.length,

monitoring

})





}catch(error){

console.error(
'MONITORING ERROR',
error
)


return NextResponse.json(
{
error:'Server error'
},
{
status:500
}
)

}


}