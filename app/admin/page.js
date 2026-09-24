import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'
import { supabaseAdmin } from '../../lib/supabase/admin'
import MonitoringCards from './components/MonitoringCards'
import InteractionAnalytics from './components/InteractionAnalytics'
import CardList from './components/CardList'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="wrap">
        <div className="card">
          <h1>Belum login</h1>
          <Link href="/login">Login</Link>
        </div>
      </main>
    )
  }


  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()


  if (!profile || profile.role !== 'admin') {
    return (
      <main className="wrap">
        <div className="card">
          <h1>Akses Ditolak</h1>
          <p>Akun ini bukan admin.</p>
        </div>
      </main>
    )
  }


  // ======================
  // STATISTIK KARTU
  // ======================

  const { count: totalCards } = await supabaseAdmin
    .from('cards')
    .select('*', {
      count: 'exact',
      head: true
    })


  const { count: activeCards } = await supabaseAdmin
    .from('cards')
    .select('*', {
      count: 'exact',
      head: true
    })
    .eq('status','ACTIVE')


  const { count: unassignedCards } = await supabaseAdmin
    .from('cards')
    .select('*',{
      count:'exact',
      head:true
    })
    .eq('status','UNASSIGNED')


  const { count: lostCards } = await supabaseAdmin
    .from('cards')
    .select('*',{
      count:'exact',
      head:true
    })
    .eq('status','LOST')




  // ======================
  // STATISTIK EVENT
  // ======================

  const { count: totalEvents } = await supabaseAdmin
    .from('events')
    .select('*',{
      count:'exact',
      head:true
    })

    .in(
      'method',
      [
        'nfc',
        'qr'
      ]
    )


  const { count: nfcEvents } = await supabaseAdmin
    .from('events')
    .select('*',{
      count:'exact',
      head:true
    })
    .eq('method','nfc')


  const { count: qrEvents } = await supabaseAdmin
    .from('events')
    .select('*',{
      count:'exact',
      head:true
    })
    .eq('method','qr')



  // ======================
  // ANALITIK METODE SCAN
  // ======================


  const {

    data:scanAnalytics=[]

  } = await supabaseAdmin


    .from('events')


    .select(`

      method,

      cards(

        serial,

        business_id,

        businesses(

          name

        )

      )

    `)


    console.log(
      "SCAN ANALYTICS",
      JSON.stringify(scanAnalytics.slice(0,3),null,2)
    )

  const methodSummary = {

    nfc:0,

    qr:0

  }



  const storeAnalytics = {}



    scanAnalytics.forEach(event=>{


      if(
        event.method !== 'nfc'
        &&
        event.method !== 'qr'
      ){

        return

      }



      if(event.method === 'nfc'){

        methodSummary.nfc++

      }


      if(event.method === 'qr'){

        methodSummary.qr++

      }





      const businessId =

        event.cards?.business_id

      const business =

        event.cards?.businesses

      const serial =

        event.cards?.serial



      if(
        businessId &&
        business
      ){


        
         if(!storeAnalytics[businessId]){


          storeAnalytics[businessId]={

            name:

            business.name || '-',


            cards:[],

            nfc:0,

            qr:0,

            total:0

          }

        }




        if(
          serial &&
          !storeAnalytics[businessId]
          .cards
          .includes(serial)

        ){

          storeAnalytics[businessId]
          .cards
          .push(serial)

        }




        if(event.method === 'nfc'){

          storeAnalytics[businessId].nfc++

        }



        if(event.method === 'qr'){

          storeAnalytics[businessId].qr++
 
        }



        storeAnalytics[businessId].total++


      }


    })



  const storeAnalyticsList =

    Object.values(storeAnalytics)

    .sort(

      (a,b)=>

      b.total-a.total

    )



  // ======================
  // EVENT HARI INI WIB
  // ======================

  const startToday = new Date()

  startToday.setHours(0,0,0,0)


  const { count: todayEvents } = await supabaseAdmin
    .from('events')
    .select('*',{
      count:'exact',
      head:true
    })
    .in(
      'method',
      [
        'nfc',
        'qr'
      ]
    )
    .gte(
      'created_at',
      startToday.toISOString()
    )



  // ======================
  // AKTIVITAS TERBARU
  // ======================

  const { data: latestEvents=[] } = await supabaseAdmin
    
    .from('events')

    .select(`
      method,
      created_at,
      card_id,

      cards(

        serial,

        businesses(

          name

        )

      )

    `)

    .in(
      'method',
      [
        'nfc',
        'qr'
      ]
    )

    .order(

      'created_at',

      {
        ascending:false
      }

    )

    .limit(10)



  // ======================
  // TOP PERFORMING CARD
  // ======================


  const {data:topEvents=[]} = await supabaseAdmin

    .from('events')

    .select(`

      card_id,

      cards(

        serial,
        business_id,
        businesses(
          name
        )
      )
    `)


  const safeTopEvents =
    topEvents || []

  const cardScore = {}

  safeTopEvents.forEach(event=>{


    if(!cardScore[event.card_id]){

      cardScore[event.card_id] = 0

    }


    cardScore[event.card_id]++

  })



  const topCardId =

    Object.keys(cardScore)

      .sort(

        (a,b)=>

        cardScore[b] -

        cardScore[a]

      )[0]



  

    let topCard = null





    if(topCardId){


      const {

        data:c

      } = await supabaseAdmin


        .from('cards')


        .select(`
          serial,
          businesses(
            name
          )
        `)


        .eq(
          'id',
          topCardId
        )


        .maybeSingle()



      if(c){

        topCard = {

          storeName:
          c.businesses?.name || '-',

          serial:c.serial,

          scans:
          cardScore[topCardId]

        }

      }

    }



  // ======================
  // PERFORMA TOKO
  // ======================


  const {
    data:storeEvents=[]
  } = await supabaseAdmin

    .from('events')

    .select(`

      card_id,

      method,

      cards(

        serial,

        business_id,

        businesses(

          name

        )

      )

    `)

    .in(
      'method',
      [
        'nfc',
        'qr'
      ]
    )





  const storeScore = {}



    storeEvents.forEach(event=>{

      if(
        event.method !== 'nfc'
        &&
       event.method !== 'qr'
      ){

        return

      }


      const businessId =
        event.cards?.business_id


      if(!businessId){

       return

      }



      if(!storeScore[businessId]){


        storeScore[businessId]={

          name:
          event.cards?.businesses?.name || '-',


          scans:0,


          cards:new Set()

        }


      }



      storeScore[businessId].scans++



      storeScore[businessId]
        
      .cards
        
      .add(
          
        event.cards.serial
        
      )


    })





  const topStores =

    Object.values(storeScore)

    .sort(

      (a,b)=>

      b.scans-a.scans

    )

    .slice(0,5)



  // ======================
  // AUDIT TERBARU
  // ======================


  const { data: latestAudit=[] } = await supabaseAdmin

    .from('card_logs')

    .select(
      `
      id,
      action,
      serial,
      admin_email,
      created_at
      `
    )

    .order(

      'created_at',

      {
        ascending:false
      }

    )

    .limit(10)



  // ======================
  // MONITORING LAST SCAN
  // ======================


  const {

    data:monitorCards=[]

  } = await supabaseAdmin

    .from('cards')

    .select(`

      id,

      serial,

      status,

      businesses(

        name

      ),

      events(

        created_at

      )

    `)

    .order(

      'serial',

      {

        ascending:true

      }

    )

  const monitoringCards =

    monitorCards.map(card=>{


      const scans =

        card.events || []



      const lastScan =

        scans.length

        ?

        scans.sort(

          (a,b)=>

          new Date(b.created_at)

          -

          new Date(a.created_at)

        )[0].created_at


        :

        null




      return {

        serial:
        card.serial,


        status:
        card.status,


        store:
        card.businesses?.name || '-',


        total:
        scans.length,


        lastScan

      }


    })


  const activationRate =
    totalCards
    ?
    Math.round(
      (activeCards / totalCards) * 100
    )
    :
    0


  const interactionTotal =
    (totalEvents || 0)


  const qrPercentage =
    interactionTotal
    ?
    Math.round(
      (qrEvents / interactionTotal) * 100
    )
    :
    0



  // ======================
  // KARTU TERBARU
  // ======================

  const { data: cards=[] } = await supabaseAdmin
    .from('cards')
    .select(`
      serial,
      status,
      business_id,
      created_at,

      businesses(
        name
      )
    `)
    .order(
      'serial',
      {
        ascending:true
      }
    )
    



  return (
    <main className="wrap">

      <div className="nav">
        <div>
          <h1>
            Naja Store NFC Manager
          </h1>

          <p className="muted">
            Digital Review Card Management System
          </p>
        </div>

        <span className="status">
          ADMIN
        </span>
      </div>


      <div className="card">

        <h2>
          Selamat datang, {profile.full_name || user.email}
        </h2>

        <p className="muted">
          Kelola kartu NFC, QR Review, monitoring interaksi,
          dan laporan performa bisnis dalam satu dashboard.
        </p>

      </div>



      <div className="grid grid2"
        style={{
          marginTop:20
        }}
      >

        <div className="card">
          <h3>Total Kartu</h3>
          <strong>{totalCards || 0}</strong>
        </div>


        <div className="card">

          <h3>Kartu Aktif</h3>

          <strong>
            {activeCards || 0}
          </strong>


          <p className="muted">
            {activationRate}% dari total kartu
          </p>


        </div>

        <div className="card">
          <h3>Belum Aktif</h3>
          <strong>{unassignedCards || 0}</strong>
        </div>


        <div className="card">
          <h3>Kartu Hilang</h3>
          <strong>{lostCards || 0}</strong>
        </div>


        <div className="card">
          <h3>Total Interaksi</h3>
          <strong>{totalEvents || 0}</strong>
        </div>


        <div className="card">
          <h3>NFC Tap</h3>
          <strong>{nfcEvents || 0}</strong>
        </div>


        <div className="card">

          <h3>QR Scan</h3>

          <strong>
            {qrEvents || 0}
          </strong>


          <p className="muted">
            {qrPercentage}% dari seluruh interaksi
          </p>


        </div>


        <div className="card">
          <h3>Interaksi Hari Ini</h3>
          <strong>{todayEvents || 0}</strong>
        </div>

      </div>



      <div
        style={{
          marginTop:25,
          display:'flex',
          gap:12,
          flexWrap:'wrap'
        }}
      >


        <Link href="/admin/generate">
          <button className="btn">
            Buat Kartu Baru
          </button>
        </Link>



        <Link href="/admin/cards/print">
          <button className="btn">
            🖨 Print / Preview QR
          </button>
        </Link>



        <Link href="/admin/cards">
          <button className="btn">
            📊 Monitoring Kartu
          </button>
        </Link>



        <Link href="/admin/logs">
          <button className="btn">
            📜 Audit Log
          </button>
        </Link>



        <Link href="/api/admin/export/cards">
          <button className="btn">
            Export Kartu CSV
          </button>
        </Link>



        <Link href="/api/admin/export/cards-pdf">
          <button className="btn">
            Export Kartu PDF
          </button>
        </Link>



        <Link href="/admin/cards/merge">
          <button className="btn">
            Gabungkan Kartu
          </button>
        </Link>


      </div>




      <div className="card"
        style={{
          marginTop:25
        }}
      >

        <h2>
          Top Performing Card
        </h2>


        {

          topCard

          ?

          <div>

            <h3>
              {topCard.storeName}
            </h3>


            <p>

              Kartu:

              <strong>

                {' '}

                {topCard.serial}

              </strong>

            </p>



            <p>

              Total Scan:

              <strong>

                {' '}

                {topCard.scans}

              </strong>

            </p>


            <p>

              <Link
                href={`/admin/cards/${topCard.serial}`}
              >

                Detail Kartu

              </Link>

            </p>


          </div>


          :

          <p>
            Belum ada data scan.
          </p>

        }


      </div>




      <div className="card"

        style={{
          marginTop:25
        }}

      >


        <h2>
          Performa Toko
        </h2>



        <table className="table">


          <thead>

            <tr>

              <th>
                Ranking
              </th>


              <th>
                Nama Toko
              </th>


              <th>
                Kartu
              </th>


              <th>
                Total Scan
              </th>


              <th>
                Detail
              </th>


            </tr>

          </thead>



          <tbody>


            {

              topStores.map(

                (store,index)=>(


                  <tr key={index}>


                    <td>

                      {index+1}

                    </td>


                    <td>

                      {store.name}

                    </td>


                    <td>

                      {

                        Array.from(
                          store.cards
                        )

                        .sort()

                        .map(card=>(

                          
                          <div
                            key={card}
                            style={{
                              marginBottom:5
                            }}
                          >
                            {card}
                          </div>
                          

                        ))

                      }

                    </td>


                    <td>

                      {store.scans} Scan

                    </td>


                    <td>

                      {
                        store.cards.size > 0

                        ?

                        <Link

                          href={
                            `/admin/cards/${
                              Array.from(store.cards)
                              .sort()[0]
                            }`
                          }

                        >

                          Detail

                        </Link>

                        :

                        '-'
                      }


                    </td>


                  </tr>


                )

              )


            }



          </tbody>


        </table>


      </div>




      <div className="card"

        style={{
          marginTop:25
        }}

      >


        <h2>
          Audit Terbaru
        </h2>



        <table className="table">


          <thead>

            <tr>

              <th>
                Waktu
              </th>


              <th>
                Aksi
              </th>


              <th>
                Kartu
              </th>


              <th>
                Admin
              </th>


              <th>
                Detail
              </th>


            </tr>

          </thead>



          <tbody>


            {

              latestAudit.map((log,index)=>(

                <tr key={log.id || index}>


                  <td>

                    {
                      new Date(
                        log.created_at
                      )
                      .toLocaleString(
                        'id-ID',
                        {
                          timeZone:'Asia/Jakarta',
                          dateStyle:'short',
                          timeStyle:'medium'
                        }
                      )
                    }

                  </td>


                  <td>

                    {
                      log.action === 'CREATE_CARD'
                      ? 'Buat Kartu'

                      : log.action === 'ACTIVATE_CARD'
                      ? 'Aktivasi'

                      : log.action === 'UPDATE_CARD'
                      ? 'Update'

                      : log.action === 'LOST_CARD'
                      ? 'Kartu Hilang'

                      : log.action === 'REPLACE_CARD'
                      ? 'Penggantian'

                      : log.action === 'MERGE_CARD'
                      ? 'Gabungkan Kartu'

                      : log.action
                    }

                  </td>


                  <td>

                    {
                      log.serial || '-'
                    }

                  </td>


                  <td>

                    {
                      log.admin_email || '-'
                    }

                  </td>


                  <td>

                    {
                      log.id

                      ?

                      <Link
                        href={`/admin/logs/${log.id}`}
                      >
                        Detail
                      </Link>

                      :

                      '-'
                    }

                  </td>


                </tr>

              ))

            }


          </tbody>


        </table>


      </div>




      <MonitoringCards

        cards={monitoringCards}

      />




      <InteractionAnalytics

        summary={methodSummary}

        stores={storeAnalyticsList}

      />




      <div className="card"
        style={{
          marginTop:25
        }}
      >

        <h2>
          Aktivitas Terbaru
        </h2>


        <table className="table">

          <thead>
            <tr>
              <th>
                Metode
              </th>

              <th>
                Nama Toko
              </th>

              <th>
                Kartu
              </th>

              <th>
                Waktu
              </th>

              <th>
                Detail
              </th>
              
            </tr>
          </thead>


          <tbody>

          {
            latestEvents.map((event,index)=>(

              <tr key={index}>

                <td>
                  {
                    event.method === 'nfc'
                    ? 'NFC'
                    : event.method === 'qr'
                    ? 'QR'
                    : event.method
                  }
                </td>


                <td>

                  {
                    event.cards?.businesses?.name ||

                    'Belum aktif'
                  }

                </td>



                <td>

                  {
                    event.cards?.serial ||
                    '-'
                  }

                </td>



                <td>

                  {
                    new Date(
                      event.created_at
                    ).toLocaleString(
                      'id-ID',
                      {
                        timeZone:'Asia/Jakarta',
                        dateStyle:'short',
                        timeStyle:'medium'
                      }
                    )
                  }

                </td>



                <td>

                  {
                    event.cards?.serial

                    ?

                    <Link
                      href={`/admin/cards/${event.cards.serial}`}
                    >
                      Detail
                    </Link>

                    :

                    '-'
                  }

                </td>


              </tr>

            ))
          }

          </tbody>

        </table>

      </div>




      <CardList

        cards={cards}

      />


    </main>
  )
}