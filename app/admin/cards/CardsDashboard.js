'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import MonitoringCards from '../components/MonitoringCards'


export default function CardsDashboard(){


  const [cards,setCards] = useState([])

  const [monitoring,setMonitoring] = useState([])

  const [loading,setLoading] = useState(true)

  const [error,setError] = useState('')

  const [search,setSearch] = useState('')

  const [filter,setFilter] = useState('ALL')


  const [start,setStart] = useState(1)

  const [end,setEnd] = useState(10)

  const [resolution,setResolution] = useState('hd')





  async function loadCards(){


    try{


      setLoading(true)


      const res = await fetch(

        '/api/cards/list',

        {
          cache:'no-store'
        }

      )



      const data =
        await res.json()

      if(!res.ok){

        throw new Error(

          data.error ||

          'Gagal mengambil data kartu'

        )

      }



      setCards(

        data.cards || []

      )



    }catch(err){


      console.error(err)


      setError(

        err.message

      )


    }finally{


      setLoading(false)


    }


  }



  async function loadMonitoring(){


    try{


      const res =
        await fetch(

          '/api/admin/cards/monitoring',

          {
            cache:'no-store'
          }

        )



      const data =
        await res.json()



      if(res.ok){

        setMonitoring(

          data.cards || []

        )

      }



    }catch(err){


      console.error(

        'MONITORING ERROR',

        err

      )


    }


  }


  function downloadBatch(){


    const url =

      `/api/cards/download-all?start=${start}&end=${end}&resolution=${resolution}`



    window.location.href = url


  }







  useEffect(()=>{

    loadCards()

    loadMonitoring()

  },[])







  const active =

    cards.filter(

      c => c.status === 'ACTIVE'

    ).length






  const unassigned =

    cards.filter(

      c => c.status === 'UNASSIGNED'

    ).length





  const lost =
    cards.filter(
      c => c.status === 'LOST'
    ).length







  const filteredCards =

    cards.filter(card=>{


      const matchSearch =

        card.serial

        .toLowerCase()

        .includes(

          search.toLowerCase()

        )




      const matchFilter =


        filter === 'ALL'

        ?

        true

        :

        card.status === filter




      return (

        matchSearch &&

        matchFilter

      )


    })





  return (

    <main

      style={{

        padding:40,

        background:'#f8fafc',

        minHeight:'100vh'

      }}

    >



      <h1

        style={{

          fontSize:42,

          fontWeight:800,

          marginBottom:30,

          color:'#0f172a'

        }}

      >

        Manajemen Kartu NFC

      </h1>
      <div

        style={{

          display:'grid',

          gridTemplateColumns:
          'repeat(4,1fr)',

          gap:20,

          marginBottom:40

        }}

      >



        <CardStat

          title="Total Kartu"

          value={cards.length}

        />



        <CardStat

          title="ACTIVE"

          value={active}

        />



        <CardStat

          title="UNASSIGNED"

          value={unassigned}

        />


        <CardStat

          title="LOST"

          value={lost}

        />


      </div>





      <div

        style={{

          background:'#fff',

          borderRadius:20,

          padding:25,

          border:'1px solid #e5e7eb'

        }}

      >




        <h2

          style={{

            marginBottom:20,

            fontSize:28

          }}

        >

          Daftar Kartu

        </h2>






        <div

          style={{

            background:'#f8fafc',

            padding:20,

            borderRadius:15,

            marginBottom:25,

            border:'1px solid #e5e7eb'

          }}

        >



          <h3

            style={{

              marginTop:0,

              marginBottom:15

            }}

          >

            Download QR Batch

          </h3>





          <div

            style={{

              display:'flex',

              gap:12,

              flexWrap:'wrap'

            }}

          >



            <input

              type="number"

              value={start}

              onChange={(e)=>

                setStart(e.target.value)

              }

              placeholder="Mulai"

              style={{

                padding:10,

                width:120,

                border:'1px solid #d1d5db',

                borderRadius:10

              }}

            />





            <input

              type="number"

              value={end}

              onChange={(e)=>

                setEnd(e.target.value)

              }

              placeholder="Akhir"

              style={{

                padding:10,

                width:120,

                border:'1px solid #d1d5db',

                borderRadius:10

              }}

            />







            <select

              value={resolution}

              onChange={(e)=>

                setResolution(e.target.value)

              }

              style={{

                padding:10,

                borderRadius:10,

                border:'1px solid #d1d5db'

              }}

            >



              <option value="standard">

                Standard

              </option>



              <option value="hd">

                HD

              </option>



              <option value="ultra">

                Print

              </option>



            </select>






            <button

              onClick={downloadBatch}

              style={{

                padding:'10px 18px',

                background:'#16a34a',

                color:'#fff',

                border:0,

                borderRadius:10,

                fontWeight:700,

                cursor:'pointer'

              }}

            >

              Download ZIP

            </button>




          </div>



        </div>






        <div

          style={{

            display:'flex',

            gap:15,

            marginBottom:25,

            flexWrap:'wrap'

          }}

        >




          <input


            placeholder="Cari serial kartu..."


            value={search}


            onChange={(e)=>

              setSearch(

                e.target.value

              )

            }


            style={{

              flex:1,

              minWidth:220,

              padding:12,

              border:'1px solid #d1d5db',

              borderRadius:10

            }}


          />






          <select


            value={filter}


            onChange={(e)=>

              setFilter(

                e.target.value

              )

            }


            style={{

              padding:12,

              borderRadius:10,

              border:'1px solid #d1d5db'

            }}


          >

            <option value="ALL">

              Semua Status

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


          </select>







          <button


            onClick={loadCards}


            style={{


              padding:'12px 18px',

              background:'#111827',

              color:'#fff',

              border:0,

              borderRadius:10,

              fontWeight:700,

              cursor:'pointer'


            }}

          >

            Refresh

          </button>






        </div>







        {

          error &&


          <div

            style={{

              background:'#fee2e2',

              padding:15,

              borderRadius:12,

              color:'#991b1b',

              marginBottom:20

            }}

          >

            {error}


          </div>


        }
        {

          loading


          ?


          <p>
            Memuat data kartu...
          </p>



          :



          <table

            style={{

              width:'100%',

              borderCollapse:'collapse'

            }}

          >



            <thead>


              <tr>


                <th style={th}>
                  Serial
                </th>


                <th style={th}>
                  Status
                </th>


                <th style={th}>
                  Bisnis
                </th>


                <th style={th}>
                  Aktif Sejak
                </th>


                <th style={th}>
                  Aksi
                </th>


              </tr>


            </thead>






            <tbody>


            {


              filteredCards.map(card=>(



                <tr key={card.id}>



                  <td style={td}>

                    <strong>

                      {card.serial}

                    </strong>


                  </td>







                  <td style={td}>


                    <span

                      style={{


                        padding:'6px 12px',

                        borderRadius:20,

                        fontSize:14,

                        fontWeight:600,


                        background:

                        card.status === 'ACTIVE'

                        ?

                        '#dcfce7'

                        :

                        card.status === 'LOST'

                        ?

                        '#fee2e2'

                        :

                        '#fef3c7',



                        color:

                        card.status === 'ACTIVE'

                        ?

                        '#166534'

                        :

                        card.status === 'LOST'

                        ?

                        '#991b1b'

                        :

                        '#92400e'


                      }}

                    >

                      {card.status}


                    </span>



                  </td>








                  <td style={td}>


                    {

                      card.business?.name ||

                      '-'

                    }


                  </td>









                  <td style={td}>


                    {

                      card.activated_at

                      ?

                      new Date(

                        card.activated_at

                      )

                      .toLocaleString(

                        'id-ID'

                      )

                      :

                      '-'

                    }



                  </td>








                  <td style={td}>


                    <div

                      style={{

                        display:'flex',

                        gap:8,

                        flexWrap:'wrap'

                      }}

                    >




                      <Link


                        href={

                          `/admin/cards/${card.serial}`

                        }


                        style={{


                          padding:'8px 15px',

                          background:'#111827',

                          color:'#fff',

                          borderRadius:10,

                          textDecoration:'none',

                          fontWeight:600


                        }}

                      >

                        Detail


                      </Link>






                      <a


                        href={

                          `/api/cards/preview/${encodeURIComponent(card.serial)}?resolution=hd`

                        }


                        download={`${card.serial.replace('NFC-','')}.png`}


                        style={{


                          padding:'8px 15px',

                          background:'#2563eb',

                          color:'#fff',

                          borderRadius:10,

                          textDecoration:'none',

                          fontWeight:600


                        }}

                      >

                        QR PNG


                      </a>






                    </div>



                  </td>





                </tr>



              ))



            }



            </tbody>





          </table>



        }



      </div>



      <MonitoringCards

        cards={monitoring}

      />

    </main>


  )


}





function QuickAction({
  title,
  desc,
  href
}){


  return (

    <Link

      href={href}

      style={{

        padding:25,

        background:'#f8fafc',

        border:'1px solid #e5e7eb',

        borderRadius:18,

        textDecoration:'none',

        color:'#0f172a'

      }}

    >


      <h3>

        {title}

      </h3>


      <p

        style={{

          color:'#64748b'

        }}

      >

        {desc}

      </p>


    </Link>

  )

}









function CardStat({title,value}){


  return (

    <div

      style={{

        background:'#fff',

        padding:25,

        borderRadius:20,

        border:'1px solid #e5e7eb'

      }}

    >



      <p

        style={{

          color:'#64748b',

          fontSize:16,

          marginBottom:10

        }}

      >

        {title}


      </p>




      <h2

        style={{

          fontSize:40,

          margin:0,

          color:'#0f172a'

        }}

      >

        {value}


      </h2>



    </div>


  )


}







const th={

  textAlign:'left',

  padding:15,

  borderBottom:'1px solid #e5e7eb',

  color:'#334155'

}



const td={

  padding:15,

  borderBottom:'1px solid #e5e7eb',

  color:'#334155'

}