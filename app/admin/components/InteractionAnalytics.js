'use client'


import { useState } from 'react'
import Link from 'next/link'



export default function InteractionAnalytics({

  summary={},

  stores=[]

}){


  const [page,setPage] =
    useState(1)



  const limit = 10



  const totalPage =

    Math.ceil(

      stores.length /

      limit

    )



  const start =

    (page - 1) *

    limit



  const displayStores =

    stores.slice(

      start,

      start + limit

    )



  const total =

    (summary.nfc || 0) +

    (summary.qr || 0)



  const nfcPercent =

    total

    ?

    Math.round(

      (

        (summary.nfc || 0) /

        total

      )

      *

      100

    )

    :

    0



  const qrPercent =

    total

    ?

    Math.round(

      (

        (summary.qr || 0) /

        total

      )

      *

      100

    )

    :

    0



  return (

    <div

      className="card"

      style={{

        marginTop:25

      }}

    >


      <h2>

        Analitik Interaksi

      </h2>





      {/* ========================= */}
      {/* DISTRIBUSI INTERAKSI */}
      {/* ========================= */}


      <div

        style={{

          marginTop:25,

          marginBottom:40

        }}

      >


        <h3>

          Distribusi Interaksi

        </h3>




        {/* TOTAL INTERAKSI */}


        <div

          style={{

            marginBottom:25

          }}

        >


          <div

            style={{

              display:'flex',

              justifyContent:'space-between',

              alignItems:'center',

              marginBottom:8

            }}

          >


            <strong>

              Total Interaksi

            </strong>


            <span>

              {total}

              {' '}

              (100%)

            </span>


          </div>




          <div style={barTrack}>


            <div

              style={{

                ...barFillTotal,

                width:'100%'

              }}

            />


          </div>


        </div>





        {/* NFC */}


        <div

          style={{

            marginBottom:25

          }}

        >


          <div

            style={{

              display:'flex',

              justifyContent:'space-between',

              alignItems:'center',

              marginBottom:8

            }}

          >


            <strong>

              NFC Tap

            </strong>


            <span>

              {summary.nfc || 0}

              {' '}

              ({nfcPercent}%)

            </span>


          </div>




          <div style={barTrack}>


            <div

              style={{

                ...barFillNfc,

                width:
                `${nfcPercent}%`

              }}

            />


          </div>


        </div>





        {/* QR */}


        <div>


          <div

            style={{

              display:'flex',

              justifyContent:'space-between',

              alignItems:'center',

              marginBottom:8

            }}

          >


            <strong>

              QR Scan

            </strong>


            <span>

              {summary.qr || 0}

              {' '}

              ({qrPercent}%)

            </span>


          </div>




          <div style={barTrack}>


            <div

              style={{

                ...barFillQr,

                width:
                `${qrPercent}%`

              }}

            />


          </div>


        </div>


      </div>






      {/* ========================= */}
      {/* PERFORMA TOKO */}
      {/* ========================= */}


      <h3>

        Performa Metode per Toko

      </h3>




      <table className="table">


        <thead>

          <tr>


            <th>

              Nama Toko

            </th>



            <th>

              Kartu

            </th>



            <th>

              NFC

            </th>



            <th>

              QR

            </th>



            <th>

              Total

            </th>



            <th>

              Detail

            </th>


          </tr>

        </thead>





        <tbody>


          {

            displayStores.map(

              (store,index)=>(


                <tr

                  key={index}

                >


                  <td>

                    {store.name || '-'}

                  </td>




                  <td>


                    {

                      (store.cards || [])

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

                    {store.nfc || 0}

                  </td>




                  <td>

                    {store.qr || 0}

                  </td>




                  <td>

                    {store.total || 0}

                  </td>




                  <td>


                    {

                      store.cards?.length

                      ?

                      <Link

                        href={`/admin/cards/${store.cards[0]}`}

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






      {/* ========================= */}
      {/* PAGINATION */}
      {/* ========================= */}


      <div

        style={{

          marginTop:20,

          display:'flex',

          gap:15,

          alignItems:'center'

        }}

      >


        <button

          disabled={page <= 1}

          onClick={()=>{

            setPage(

              p=>p-1

            )

          }}

        >

          ← Sebelumnya

        </button>




        <span>

          Halaman {page} / {totalPage || 1}

        </span>




        <button

          disabled={

            page >= totalPage

          }

          onClick={()=>{

            setPage(

              p=>p+1

            )

          }}

        >

          Berikutnya →

        </button>


      </div>


    </div>

  )


}





const barTrack={

  width:'100%',

  height:14,

  background:'#e5e7eb',

  borderRadius:999,

  overflow:'hidden'

}





const barFillTotal={

  height:'100%',

  background:'#111827',

  borderRadius:999,

  transition:'width .3s ease'

}





const barFillNfc={

  height:'100%',

  background:'#374151',

  borderRadius:999,

  transition:'width .3s ease'

}





const barFillQr={

  height:'100%',

  background:'#64748b',

  borderRadius:999,

  transition:'width .3s ease'

}