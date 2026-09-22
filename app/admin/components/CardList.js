'use client'


import { useMemo, useState } from 'react'
import Link from 'next/link'


export default function CardList({

  cards=[]

}){


  const [search,setSearch] =
    useState('')


  const [status,setStatus] =
    useState('ALL')


  const [page,setPage] =
    useState(1)


  const limit = 10

  function getStatusStyle(status){


    if(status === 'ACTIVE'){

      return {

        bg:'#dcfce7',

        color:'#166534'

      }

    }


    if(status === 'UNASSIGNED'){

      return {

        bg:'#f1f5f9',

        color:'#475569'

      }

    }


    if(status === 'LOST'){

      return {

        bg:'#fee2e2',

        color:'#991b1b'

      }

    }


    return {

      bg:'#e5e7eb',

      color:'#374151'

    }

  }



  const filteredCards =

    useMemo(()=>{

      const keyword =
        search
        .trim()
        .toLowerCase()


      return [...cards]
        .sort((a,b)=>
          a.serial.localeCompare(
            b.serial
          )
        )
      
      
      
      .filter(card=>{


        const matchSearch =

          !keyword

          ||

          card.serial
            ?.toLowerCase()
            .includes(keyword)



        const matchStatus =

          status === 'ALL'

          ||

          card.status === status



        return (

          matchSearch &&
          matchStatus

        )

      })


    },[
      cards,
      search,
      status
    ])





  const totalPage =

    Math.ceil(

      filteredCards.length /

      limit

    )





  const safePage =

    Math.min(

      page,

      totalPage || 1

    )





  const start =

    (safePage - 1) *

    limit





  const displayCards =

    filteredCards.slice(

      start,

      start + limit

    )





  function handleSearch(value){

    setSearch(value)

    setPage(1)

  }





  function handleStatus(value){

    setStatus(value)

    setPage(1)

  }





  return (

    <div

      className="card"

      style={{

        marginTop:25

      }}

    >


      <h2>

        Daftar Kartu

      </h2>





      {/* ========================= */}
      {/* SEARCH & FILTER */}
      {/* ========================= */}


      <div

        style={{

          display:'flex',

          gap:15,

          flexWrap:'wrap',

          alignItems:'center',

          marginTop:20,

          marginBottom:25

        }}

      >


        <input

          type="text"

          placeholder="Cari serial kartu..."

          value={search}

          onChange={e=>

            handleSearch(
              e.target.value
            )

          }

          style={{

            minWidth:260,

            padding:'10px 12px',

            border:'1px solid #d1d5db',

            borderRadius:8,

            fontSize:14

          }}

        />





        <select

          value={status}

          onChange={e=>

            handleStatus(
              e.target.value
            )

          }

          style={{

            padding:'10px 12px',

            border:'1px solid #d1d5db',

            borderRadius:8,

            fontSize:14,

            background:'#ffffff'

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





        <span>

          {filteredCards.length} kartu

        </span>


      </div>






      {/* ========================= */}
      {/* TABLE */}
      {/* ========================= */}


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

              Aksi

            </th>


          </tr>


        </thead>






        <tbody>


          {

            displayCards.length

            ?

            displayCards.map(card=>(


              <tr

                key={card.serial}

              >


                <td>

                  {card.serial}

                </td>



                <td>

                  {

                    card.businesses?.name ||

                    '-'

                  }

                </td>



                <td>


                  {

                    (()=>{


                      const status =

                        getStatusStyle(

                          card.status

                        )



                      return (

                        <span

                          style={{

                            display:'inline-block',

                            padding:'6px 12px',

                            borderRadius:999,

                            background:status.bg,

                            color:status.color,

                            fontWeight:700,

                            fontSize:13

                          }}

                        >

                          {card.status}

                        </span>

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


            :


            <tr>


              <td

                colSpan="4"

                style={{

                  textAlign:'center',

                  padding:30

                }}

              >

                Tidak ada kartu yang ditemukan.

              </td>


            </tr>

          }


        </tbody>


      </table>






      {/* ========================= */}
      {/* PAGINATION */}
      {/* ========================= */}


      <div

        style={{

          display:'flex',

          alignItems:'center',

          gap:15,

          marginTop:20

        }}

      >


        <button

          disabled={
            safePage <= 1
          }

          onClick={()=>{

            setPage(
              p=>Math.max(
                1,
                p-1
              )
            )

          }}

        >

          ← Sebelumnya

        </button>





        <span>

          Halaman {safePage} / {totalPage || 1}

        </span>





        <button

          disabled={

            safePage >= totalPage

          }

          onClick={()=>{

            setPage(
              p=>Math.min(
                totalPage,
                p+1
              )
            )

          }}

        >

          Berikutnya →

        </button>


      </div>


    </div>

  )


}