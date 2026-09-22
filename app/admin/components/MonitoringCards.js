'use client'

import { useState } from 'react'
import Link from 'next/link'



export default function MonitoringCards({

  cards=[]

}){





  const [filter,setFilter] =
    useState('ALL')



  const [page,setPage] =
    useState(1)



  const limit = 10





  const summaryCard={

    background:'#ffffff',

    padding:20,

    borderRadius:16,

    border:'1px solid #e5e7eb'

  }





  // ======================
  // MONITORING SUMMARY
  // ======================


  const totalCards =

    cards.length





  const activeCards =

    cards.filter(card=>

      card.status === 'ACTIVE'

    ).length





  const unusedCards =

    cards.filter(card=>

      card.status === 'UNASSIGNED'

    ).length





  const attentionCards =

    cards.filter(card=>{


      const days =

        getDays(card.lastScan)



      return (

        card.status === 'ACTIVE'

        &&

        days !== null

        &&

        days > 30

      )


    }).length






  function getDays(value){


    if(!value){

      return null

    }



    const now =
      new Date()



    const date =
      new Date(value)




    return Math.floor(

      (

        now - date

      )

      /

      (

        1000 *

        60 *

        60 *

        24

      )

    )


  }







  function getScanStatus(value){


    if(!value){


      return {


        text:'Belum pernah',

        bg:'#fee2e2',

        color:'#991b1b'


      }


    }




    const days =

      getDays(value)




    if(days <= 7){


      return {


        text:'Aktif',

        bg:'#dcfce7',

        color:'#166534'


      }


    }





    if(days <= 30){


      return {


        text:`${days} hari lalu`,

        bg:'#fef3c7',

        color:'#92400e'


      }


    }




    return {


      text:`${days} hari lalu`,

      bg:'#fee2e2',

      color:'#991b1b'


    }


  }








  const filteredCards =

  cards.filter(card=>{


    const days =

      getDays(card.lastScan)





    if(filter === 'ACTIVE'){


      return card.status === 'ACTIVE'


    }





    if(filter === 'UNASSIGNED'){


      return card.status === 'UNASSIGNED'


    }





    if(filter === 'LOST'){


      return card.status === 'LOST'


    }





    if(filter === 'NO_SCAN'){


      return !card.lastScan


    }





    if(filter === 'OVER_7'){


      return days !== null && days > 7


    }





    if(filter === 'OVER_30'){


      return days !== null && days > 30


    }





    return true



  })









  const totalPage =

    Math.ceil(

      filteredCards.length /

      limit

    )








  const start =

    (page - 1) *

    limit








  const displayCards =

    filteredCards.slice(

      start,

      start + limit

    )









  return (


    <div

      className="card"

      style={{

        marginTop:25

      }}

    >





      <h2>

        Monitoring Kartu

      </h2>







      <div

        style={{

          display:'grid',

          gridTemplateColumns:

          'repeat(auto-fit,minmax(180px,1fr))',

          gap:20,

          marginBottom:25

        }}

      >





        <div style={summaryCard}>

          <h3>

            Total Kartu

          </h3>


          <strong>

            {totalCards}

          </strong>


        </div>






        <div style={summaryCard}>


          <h3>

            Kartu Aktif

          </h3>


          <strong>

            {activeCards}

          </strong>


        </div>






        <div style={summaryCard}>


          <h3>

            Belum Digunakan

          </h3>


          <strong>

            {unusedCards}

          </strong>


        </div>






        <div style={summaryCard}>


          <h3>

            Perlu Perhatian

          </h3>


          <strong>

            {attentionCards}

          </strong>


        </div>





      </div>









      <select


        value={filter}


        onChange={e=>{


          setFilter(

            e.target.value

          )


          setPage(1)


        }}



        style={{


          padding:12,

          borderRadius:10,

          marginBottom:20


        }}


      >



        <option value="ALL">

          Semua Kartu

        </option>



        <option value="ACTIVE">

          ACTIVE

        </option>



        <option value="UNASSIGNED">

          UNASSIGNED

        </option>



        <option value="LOST">

          LOST

        </option>



        <option value="NO_SCAN">

          Belum Pernah Scan

        </option>



        <option value="OVER_7">

          Tidak Scan &gt; 7 Hari

        </option>



        <option value="OVER_30">

          Tidak Scan &gt; 30 Hari

        </option>



      </select>









      <table className="table">


        <thead>


          <tr>


            <th>
              Serial
            </th>


            <th>
              Nama Toko
            </th>


            <th>
              Status
            </th>


            <th>
              Total Scan
            </th>


            <th>
              Last Scan
            </th>


            <th>
              Detail
            </th>


          </tr>


        </thead>






        <tbody>



        {


          displayCards.map(card=>(



            <tr

              key={card.serial}

            >



              <td>

                {card.serial}

              </td>




              <td>

                {card.store}

              </td>




              <td>

                {card.status}

              </td>




              <td>

                {card.total}

              </td>





              <td>


                {

                  (()=>{


                    const scan =

                      getScanStatus(

                        card.lastScan

                      )



                    return (


                      <div>


                        <span

                          style={{


                            display:'inline-block',

                            padding:'6px 12px',

                            borderRadius:999,

                            background:scan.bg,

                            color:scan.color,

                            fontWeight:700,

                            fontSize:13


                          }}

                        >

                          {scan.text}

                        </span>





                        {

                          card.lastScan &&


                          <div

                            style={{


                              marginTop:8


                            }}

                          >


                            {

                              new Date(

                                card.lastScan

                              )

                              .toLocaleString(

                                'id-ID',

                                {

                                  timeZone:

                                  'Asia/Jakarta',

                                  dateStyle:

                                  'short',

                                  timeStyle:

                                  'medium'

                                }

                              )

                            }


                          </div>


                        }



                      </div>


                    )


                  })()

                }



              </td>






              <td>


                <Link

                  href={`/admin/cards/${card.serial}`}

                >

                  Detail

                </Link>



              </td>




            </tr>



          ))


        }



        </tbody>


      </table>









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

          onClick={()=>setPage(page-1)}

        >

          ← Sebelumnya

        </button>







        <span>

          Halaman {page} / {totalPage || 1}

        </span>








        <button

          disabled={page >= totalPage}

          onClick={()=>setPage(page+1)}

        >

          Berikutnya →

        </button>





      </div>





    </div>


  )


}