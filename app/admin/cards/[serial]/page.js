import { supabaseAdmin } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/auth/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'


function getBusiness(data){

  if(!data) return null

  if(Array.isArray(data)){

    return data[0] || null

  }

  return data

}



function formatDate(value){

  if(!value) return '-'

  try{

    return new Date(value).toLocaleString(

      'id-ID',

      {

        timeZone:'Asia/Jakarta'

      }

    )

  }catch{

    return '-'

  }

}







function statusStyle(status){

  const styles={


    ACTIVE:{

      bg:'#dcfce7',

      color:'#166534'

    },


    LOST:{

      bg:'#fee2e2',

      color:'#991b1b'

    },


    UNASSIGNED:{

      bg:'#fef3c7',

      color:'#92400e'

    },


  }





  const s =

    styles[status] ||

    styles.UNASSIGNED





  return {


    display:'inline-block',

    padding:'8px 14px',

    borderRadius:999,

    background:s.bg,

    color:s.color,

    fontWeight:700,

    fontSize:14


  }


}








export default async function Detail({params,searchParams}){


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





  const {serial} =

    await params

    const query =
    await searchParams


    const errorMessage =
    query?.error || null






  const {

    data:c,

    error

  } = await supabaseAdmin


    .from('cards')


    .select(`

      *,

      businesses(*)

    `)


    .eq(

      'serial',

      serial

    )


    .maybeSingle()






  if(error){


    return (

      <main style={wrap}>

        <div style={card}>

          Gagal mengambil data kartu.

        </div>

      </main>

    )

  }






  if(!c){


    return (

      <main style={wrap}>

        <div style={card}>

          Kartu tidak ditemukan.

        </div>

      </main>

    )

  }







  const business =

    getBusiness(

      c.businesses

    )


  // ======================
  // KARTU UTAMA MERGE
  // ======================


  let mainMergeCard = null



  const {

    data:mergeLogs=[]

  } = await supabaseAdmin


    .from('card_logs')


    .select(`

      old_data,

      new_data

    `)


    .eq(

      'action',

      'MERGE_CARD'

    )




    for(const log of mergeLogs){


      const target =

        log.new_data?.target_card



      const merged =

        log.old_data?.merged_cards || []



      if(

        target === serial

        ||

        merged.includes(serial)

      ){

        mainMergeCard = target

        break

      }


    }

    if(!mainMergeCard){

      mainMergeCard = serial

    }


  // ======================
  // KARTU TERHUBUNG
  // ======================


  const {

    data:linkedCards=[]

  } = await supabaseAdmin


    .from('cards')


    .select(`

      id,

      serial,

      status

    `)


    .eq(

      'business_id',

      c.business_id

    )


    .order(

      'serial',

      {

        ascending:true

      }

    )







  const {

    data:events=[]

  } = await supabaseAdmin


    .from('events')


    .select(

      'method,created_at'

    )


    .eq(

      'card_id',

      c.id

    )


    .order(

      'created_at',

      {

        ascending:false

      }

    )






  const {

    data:auditLogs=[]

  } = await supabaseAdmin


    .from('card_logs')


    .select(`

      id,

      action,

      old_status,

      new_status,

      old_data,

      new_data,

      admin_email,

      created_at

    `)


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







  const app =

    process.env.NEXT_PUBLIC_APP_URL ||

    'http://localhost:3000'






  const nfcUrl =

    `${app}/r/${c.public_id}?method=nfc`





  const qrUrl =

    `${app}/r/${c.public_id}?method=qr`






  return (

    <main style={wrap}>


      <div style={nav}>


        <Link

          href="/admin"

          style={backLink}

        >

          ← Dashboard

        </Link>



        <span

          style={
            statusStyle(c.status)
          }

        >

          {c.status}

        </span>


      </div>

      <div style={card}>


        <h1 style={title}>

          {serial}

        </h1>





        <p style={subtitle}>

          Toko:

          <b>

            {' '}

            {business?.name || '-'}

          </b>

        </p>





        <p style={muted}>

          Aktif sejak:

          {' '}

          {formatDate(c.activated_at)}

        </p>








        <div style={grid}>


          <div>


            <h2 style={heading}>

              URL Customer

            </h2>





            <p>

              NFC

            </p>




            <code style={code}>

              {nfcUrl}

            </code>






            <p>

              QR

            </p>




            <code style={code}>

              {qrUrl}

            </code>







            <img


              src={

                `/api/cards/preview/${encodeURIComponent(c.serial)}?resolution=standard`

              }


              alt="QR Preview"


              style={previewImage}


            />




          </div>









          <div>


            <h2 style={heading}>

              Data Bisnis

            </h2>






            {
            errorMessage &&

              <div

              style={{
                
                background:'#fee2e2',

                color:'#991b1b',

                padding:'12px',

                borderRadius:12,

                marginBottom:20,

                fontWeight:600

              }}

              >
            
              {errorMessage}

              </div>

            }

            
            <form

              action="/api/cards/update"

              method="post"

            >





              <input

                type="hidden"

                name="serial"

                value={serial}

              />







              <label>

                Nama toko

              </label>




              <input

                name="name"

                defaultValue={

                  business?.name || ''

                }

                style={input}

              />







              <label>

                Google Review URL

              </label>




              <input

                name="url"

                defaultValue={

                  business?.google_review_url || ''

                }

                style={input}

              />








              <label>

                Status

              </label>




              <select

                name="status"

                defaultValue={c.status}

                style={input}

              >



                <option value="UNASSIGNED">

                  UNASSIGNED

                </option>



                <option value="ACTIVE">

                  ACTIVE

                </option>



                <option value="LOST">

                  LOST

                </option>



              </select>







              <label>

                Alasan Perubahan
                (wajib untuk LOST)

              </label>




              <select

                name="reason"

                defaultValue=""

                style={input}

              >



              <option value="">

              Pilih alasan

              </option>



              <option value="Kartu hilang">

              Kartu hilang

              </option>



              <option value="Kartu rusak">

              Kartu rusak

              </option>



              </select>



              <button
                style={button}

              >

                Simpan

              </button>






            </form>






          </div>






        </div>





      </div>







      <div style={card}>


        <h2 style={heading}>

          Kartu Terhubung

        </h2>




        {
          Array.isArray(linkedCards) &&

          linkedCards.map(card=>(


            <div

              key={card.id}

              style={{

                padding:12,

                borderBottom:'1px solid #eee'

              }}

            >


              <b>

                {card.serial}

              </b>



            <br/>



              Status:

              {' '}

              {card.status}



              {


                card.serial === mainMergeCard &&


                <span

                  style={{

                    color:'#166534',

                    fontWeight:700

                  }}

                >

                  {' '}

                  (Kartu Utama)

                </span>


              }

            <br/>



              <Link

                href={`/admin/cards/${card.serial}`}

                style={{

                  display:'inline-block',

                  marginTop:8,

                  color:'#1d4ed8',

                  fontWeight:700,

                  textDecoration:'none'

                }}

              >

                Detail

              </Link>

            </div>


          ))

        }


      </div>







      <div style={card}>


        <h2 style={heading}>

          Aktivitas

        </h2>





        <table style={table}>


          <thead>


            <tr>


              <th style={th}>

                Metode

              </th>



              <th style={th}>

                Waktu

              </th>


            </tr>


          </thead>





          <tbody>


          {


            events.length ?


            events.map(

              (e,i)=>(


                <tr key={i}>


                  <td style={td}>

                    {e.method}

                  </td>




                  <td style={td}>

                    {formatDate(

                      e.created_at

                    )}

                  </td>



                </tr>


              )


            )


            :


            <tr>


              <td

                colSpan="2"

                style={td}

              >

                Belum ada aktivitas.

              </td>


            </tr>


          }



          </tbody>


        </table>


      </div>

      <div style={card}>


        <h2 style={heading}>

          Audit History

        </h2>






        <table style={table}>


          <thead>


            <tr>


              <th style={th}>
                Waktu
              </th>


              <th style={th}>
                Admin
              </th>


              <th style={th}>
                Aksi
              </th>


              <th style={th}>
                Status
              </th>


              <th style={th}>
                Perubahan
              </th>


            </tr>


          </thead>






          <tbody>


          {


            auditLogs.length ?


            auditLogs.map(

              (log)=>(


                <tr key={log.id}>


                  <td style={td}>

                    {formatDate(
                      log.created_at
                    )}

                  </td>





                  <td style={td}>

                    {log.admin_email}

                  </td>





                  <td style={td}>


                    {

                    log.action === 'UPDATE_CARD'

                    ?

                    <Link

                      href={`/admin/logs/${log.id}`}

                      style={actionBadge}

                    >

                      {log.action}

                    </Link>


                    :


                    <span

                      style={actionBadge}

                    >

                      {log.action}

                    </span>


                    }


                  </td>






                  <td style={td}>


                    {log.old_status}


                    {' → '}


                    {log.new_status}



                  </td>






                  <td style={td}>


                    <div

                      style={{

                        display:'flex',

                        flexDirection:'column',

                        gap:10

                      }}

                    >





                    {


                      log.new_data?.reason &&


                      <div>


                        <b>

                          Alasan:

                        </b>


                        {' '}


                        {log.new_data.reason}



                      </div>


                    }





                    {

                      (
                        log.action === 'UPDATE_CARD'
                        &&
                        log.old_data?.name !==
                        log.new_data?.name
                      )
                      &&


                      <div>


                        <b>

                          Nama Toko

                        </b>


                        <br/>



                        Sebelum:

                        {' '}

                        {

                          log.old_data?.name || '-'

                        }



                        <br/>



                        Sesudah:

                        {' '}

                        {

                          log.new_data?.name || '-'

                        }


                      </div>


                    }






                    {

                      (
                        log.action === 'UPDATE_CARD'
                        &&
                        log.old_data?.google_review_url !==
                        log.new_data?.google_review_url
                      )
                      &&


                      <div>


                        <b>

                          Google Review URL

                        </b>


                        <br/>



                        Sebelum:

                        {' '}

                        {

                          log.old_data?.google_review_url || '-'

                        }



                        <br/>



                        Sesudah:

                        {' '}

                        {

                          log.new_data?.google_review_url || '-'

                        }



                      </div>


                    }






                    {

                      (
                        (
                          log.action === 'UPDATE_CARD'
                          ||
                          log.action === 'LOST_CARD'
                        )
                        &&
                        log.old_data?.status !==
                        log.new_data?.status
                      )

                      &&

                      <div>


                        <b>

                          Status

                        </b>


                      <br/>



                        Sebelum:

                        {' '}

                        {

                          log.old_data?.status || '-'

                        }



                      <br/>



                        Sesudah:

                        {' '}

                        {

                          log.new_data?.status || '-'

                        }



                      </div>

                    }






                    {

                      log.action === 'MERGE_CARD'

                      &&

                      <div>


                        <b>

                          Kartu Digabung:

                        </b>


                      <br/>



                        {

                          log.old_data?.merged_cards?.map(

                            (card)=>(

                              <div key={card}>

                                {card}

                              </div>

                            )

                          )

                        }



                      <br/>



                        <b>

                          Tujuan:

                        </b>


                        {' '}

                        {

                          log.new_data?.target_card || '-'

                        }



                      </div>

                    }

                     





                    </div>


                  </td>




                </tr>


              )


            )


            :


            <tr>


              <td

                colSpan="5"

                style={td}

              >

                Belum ada audit.

              </td>


            </tr>


          }




          </tbody>


        </table>



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

  background:'#ffffff',

  padding:30,

  borderRadius:20,

  border:'1px solid #e5e7eb',

  marginBottom:25

}





const nav={

  display:'flex',

  justifyContent:'space-between',

  alignItems:'center',

  marginBottom:20

}





const backLink={

  fontWeight:700,

  textDecoration:'none',

  color:'#111827'

}





const title={

  fontSize:42,

  fontWeight:800,

  margin:0

}





const subtitle={

  fontSize:20

}





const muted={

  color:'#64748b'

}





const grid={

  display:'grid',

  gridTemplateColumns:

  'repeat(auto-fit,minmax(350px,1fr))',

  gap:40,

  marginTop:30

}





const heading={

  fontSize:26,

  fontWeight:800,

  marginBottom:20

}





const code={

  display:'block',

  padding:15,

  background:'#f1f5f9',

  borderRadius:12,

  marginBottom:20,

  wordBreak:'break-all',

  fontSize:14

}





const previewImage={

  width:'100%',

  maxWidth:320,

  borderRadius:16,

  marginTop:20,

  border:'1px solid #e5e7eb'

}





const input={

  width:'100%',

  padding:14,

  margin:'10px 0 20px',

  border:'1px solid #ddd',

  borderRadius:12,

  fontSize:16,

  boxSizing:'border-box'

}





const button={

  background:'#111827',

  color:'#ffffff',

  padding:'14px 25px',

  borderRadius:12,

  border:0,

  fontWeight:700,

  cursor:'pointer'

}





const table={

  width:'100%',

  borderCollapse:'collapse'

}





const th={

  padding:14,

  textAlign:'left',

  borderBottom:'1px solid #ddd',

  fontWeight:800

}





const td={

  padding:14,

  borderBottom:'1px solid #ddd'

}





const actionBadge={

  display:'inline-block',

  background:'#dbeafe',

  color:'#1d4ed8',

  padding:'6px 12px',

  borderRadius:999,

  fontWeight:700,

  fontSize:12,

  textDecoration:'none',

  cursor:'pointer'

}