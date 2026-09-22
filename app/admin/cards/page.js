import { requireAdmin } from '../../../lib/auth/admin'
import CardsDashboard from './CardsDashboard'


export const dynamic = 'force-dynamic'


export default async function CardsPage(){


  const auth = await requireAdmin()



  if(auth.error){

    return (

      <main className="wrap">

        <div className="card">

          {auth.error}

        </div>

      </main>

    )

  }



  return (

    <CardsDashboard />

  )

}