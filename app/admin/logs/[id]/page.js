import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'
import Link from 'next/link'


export const dynamic = 'force-dynamic'



function formatDate(value){

  if(!value) return '-'

  return new Date(value).toLocaleString(
    'id-ID',
    {
      timeZone:'Asia/Jakarta'
    }
  )

}






export default async function LogDetail({params}){


  const auth =
    await requireAdmin()



  if(auth.error){

    return (

      <main style={wrap}>

        <div style={card}>

          {auth.error}

        </div>

      </main>

    )

  }






  const {id} =
    await params






  const {

    data:log,

    error

  } =
  await supabaseAdmin

    .from('card_logs')

    .select('*')

    .eq(
      'id',
      id
    )

    .maybeSingle()






  if(error || !log){


    return (

      <main style={wrap}>

        <div style={card}>

          Data audit tidak ditemukan.

        </div>

      </main>

    )

  }







  const changes = []






  
  // =======================
  // REASON AUDIT
  // =======================


  if(
  log.new_data?.reason
  ){

    changes.push({

    title:'Alasan Perubahan',

    before:'-',

    after:
    log.new_data.reason

    })

  }






  // =======================
  // CREATE CARD AUDIT
  // =======================


  if(log.action === 'CREATE_CARD'){


    changes.push({

      title:'Jumlah Kartu',

      before:'-',

      after:
      `${log.new_data?.count || 0} kartu`

    })



    changes.push({

      title:'Serial Awal',

      before:'-',

      after:
      log.new_data?.first_serial || '-'

    })



    changes.push({

      title:'Serial Akhir',

      before:'-',

      after:
      log.new_data?.last_serial || '-'

    })


  }







  // =======================
  // UPDATE DATA AUDIT
  // =======================


  if(
    log.old_data?.name !==
    log.new_data?.name
  ){

    changes.push({

      title:'Nama Toko',

      before:
      log.old_data?.name || '-',

      after:
      log.new_data?.name || '-'

    })

  }






  if(
    log.old_data?.google_review_url !==
    log.new_data?.google_review_url
  ){

    changes.push({

      title:'Google Review URL',

      before:
      log.old_data?.google_review_url || '-',

      after:
      log.new_data?.google_review_url || '-'

    })

  }






  if(
    log.old_data?.status !==
    log.new_data?.status
  ){

    changes.push({

      title:'Status',

      before:
      log.old_data?.status || '-',

      after:
      log.new_data?.status || '-'

    })

  }






  if(
    log.old_data?.business_id !==
    log.new_data?.business_id
  ){

    changes.push({

      title:'Business ID',

      before:
      log.old_data?.business_id || '-',

      after:
      log.new_data?.business_id || '-'

    })

  }






  return (

    <main style={wrap}>


      <Link

        href="/admin/logs"

        style={back}

      >

        ← Kembali ke Audit Log

      </Link>





      <div style={card}>


        <h1 style={title}>

          Audit Detail

        </h1>





        <div style={infoGrid}>

          <div>


            <b>
              Waktu
            </b>


            <p>

              {formatDate(
                log.created_at
              )}

            </p>


          </div>





          <div>


            <b>
              Admin
            </b>


            <p>

              {log.admin_email || '-'}

            </p>


          </div>





          <div>


            <b>
              Aksi
            </b>


            <p>


              <span style={badge}>

                {log.action}

              </span>


            </p>


          </div>





          <div>


            <b>
              Status
            </b>


            <p>

              {log.old_status || '-'}

              {' → '}

              {log.new_status || '-'}


            </p>


          </div>



        </div>


      </div>









      <div style={card}>


        <h2 style={heading}>

          Perubahan Data

        </h2>





        {


          changes.length === 0


          ?


          <div style={changeBox}>

            Tidak ada perubahan data.

          </div>



          :



          changes.map(

            (item,index)=>(


              <div

                key={index}

                style={changeBox}

              >


                <h3>

                  {item.title}

                </h3>





                <p>

                  Sebelum:

                  {' '}

                  <span style={before}>

                    {item.before}

                  </span>


                </p>





                <p>

                  Sesudah:

                  {' '}

                  <span style={after}>

                    {item.after}

                  </span>


                </p>



              </div>


            )


          )


        }



      </div>





    </main>


  )


}









const wrap={

  padding:40,

  background:'#f8fafc',

  minHeight:'100vh'

}




const card={

  background:'#fff',

  padding:30,

  borderRadius:20,

  border:'1px solid #e5e7eb',

  marginBottom:25

}




const back={

  display:'inline-block',

  marginBottom:20,

  fontWeight:700,

  color:'#111827',

  textDecoration:'none'

}




const title={

  fontSize:36,

  marginBottom:30

}




const heading={

  fontSize:28,

  fontWeight:800

}




const infoGrid={

  display:'grid',

  gridTemplateColumns:
  'repeat(auto-fit,minmax(220px,1fr))',

  gap:25

}




const badge={

  background:'#dbeafe',

  color:'#1d4ed8',

  padding:'8px 14px',

  borderRadius:999,

  fontWeight:700

}




const changeBox={

  background:'#f1f5f9',

  padding:25,

  borderRadius:16,

  marginTop:20

}




const before={

  color:'#64748b',

  fontWeight:600

}




const after={

  color:'#166534',

  fontWeight:700

}