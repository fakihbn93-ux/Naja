import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../../lib/auth/admin'



export async function GET(req,{params}){


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



const serial =
(params.serial || '')
.toUpperCase()






const {data:card,error}=

await supabaseAdmin

.from('cards')

.select(`

id,
serial,
status,
activated_at,
created_at,

businesses(
id,
name,
google_review_url
)

`)

.eq(
'serial',
serial
)

.single()





if(error){


return NextResponse.json(

{
error:error.message
},

{
status:404
}

)


}





const {data:logs,error:logError}=

await supabaseAdmin

.from('card_logs')

.select('*')

.eq(
'serial',
serial
)

.order(

'created_at',

{
ascending:false
}

)






if(logError){

console.error(logError)

}






return NextResponse.json({


card:{


...card,


business:

Array.isArray(card.businesses)

?

card.businesses[0]

:

card.businesses


},


logs:logs || []


})





}catch(error){


console.error(
'CARD DETAIL ERROR:',
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