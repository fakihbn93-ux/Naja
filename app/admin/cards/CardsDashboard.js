'use client'

import {
  useEffect,
  useState
} from 'react'



export default function CardsDashboard(){


  const [cards,setCards] = useState([])

  const [loading,setLoading] = useState(true)

  const [error,setError] = useState('')


  const [search,setSearch] = useState('')

  const [filter,setFilter] = useState('ALL')


  const [start,setStart] = useState(1)

  const [end,setEnd] = useState(10)


  const [monitoring,setMonitoring] = useState([])



  // ==========================
  // PAGINATION
  // ==========================

  const [page,setPage] = useState(1)

  const perPage = 10







  async function loadCards(){

    try{

      setLoading(true)


      const res = await fetch(
        '/api/cards/list'
      )


      const text = await res.text()


      console.log(
        "API RESPONSE:",
        text
     )


    let data


      try{

        data = JSON.parse(text)

      }catch(e){

        throw new Error(
          "Response API bukan JSON"
       )

      }


      if(!res.ok){

        throw new Error(
          data.error || 'Gagal mengambil kartu'
        )

      }


      setCards(
        data.cards || []
      )


    }catch(err){

      console.error(
        "LOAD CARDS ERROR:",
        err
      )


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
        '/api/cards/monitoring'
      )


      const data =
      await res.json()


      if(res.ok){

        setMonitoring(
          data.monitoring || []
        )

      }


    }catch(err){

      console.error(
        err
      )

    }

  }





  useEffect(()=>{

    loadCards()

    loadMonitoring()

  },[])





  // reset halaman ketika filter berubah

  useEffect(()=>{

    setPage(1)

  },[
    search,
    filter
  ])







  function getStatus(card){


    if(card.status){

      return card.status

    }


    if(card.assigned){

      return 'ACTIVE'

    }


    return 'UNASSIGNED'


  }







  function filteredCards(){


    return cards.filter(card=>{


      const keyword =
      search
      .toLowerCase()



      const matchSearch =

      !keyword ||

      card.serial
      ?.toLowerCase()
      .includes(keyword)



      const status =
      getStatus(card)



      const matchFilter =

      filter === 'ALL'

      ||

      status === filter



      return (

        matchSearch &&

        matchFilter

      )


    })


  }







  async function downloadOne(serial){

    window.location.href =
    `/api/cards/download-one/${serial}`

  }







  async function downloadBatch(){


    window.location.href =

    `/api/cards/download-all?start=${start}&end=${end}`


  }


  if(loading){


    return (

      <main className="wrap">

        <div className="card">

          Memuat data kartu...

        </div>

      </main>

    )


  }





  if(error){


    return (

      <main className="wrap">

        <div className="card error">

          {error}

        </div>

      </main>

    )


  }





  const filtered =
    filteredCards()



  const totalPages =
    Math.ceil(
      filtered.length / perPage
    )



  const visibleCards =
    filtered.slice(

      (page - 1) * perPage,

      page * perPage

    )





  const totalCards =
    cards.length



  const activeCards =
    cards.filter(
      card =>
      getStatus(card) === 'ACTIVE'
    ).length



  const unassignedCards =
    cards.filter(
      card =>
      getStatus(card) === 'UNASSIGNED'
    ).length



  const lostCards =
    cards.filter(
      card =>
      getStatus(card) === 'LOST'
    ).length






  return (

    <main className="wrap">



      {/* HEADER */}

      <div className="nav">


        <div>

          <h1>
            Card Management
          </h1>


          <p className="muted">

            Kelola kartu NFC, QR Code,
            dan status aktivasi pelanggan.

          </p>

        </div>



        <span className="status">

          {totalCards} Cards

        </span>


      </div>







      {/* STATISTIC */}


      <section
        className="grid grid2"
      >


        <div className="card">

          <h3>
            Total Kartu
          </h3>


          <strong>
            {totalCards}
          </strong>


          <p className="muted">

            Semua kartu terdaftar

          </p>


        </div>





        <div className="card">

          <h3>
            Aktif
          </h3>


          <strong>
            {activeCards}
          </strong>


          <p className="muted">

            Kartu sudah digunakan

          </p>


        </div>





        <div className="card">

          <h3>
            Belum Aktif
          </h3>


          <strong>
            {unassignedCards}
          </strong>


          <p className="muted">

            Menunggu assignment

          </p>


        </div>





        <div className="card">

          <h3>
            Hilang
          </h3>


          <strong>
            {lostCards}
          </strong>


          <p className="muted">

            Status kehilangan

          </p>


        </div>



      </section>








      {/* DOWNLOAD RANGE */}


      <section
        className="card"
        style={{
          marginTop:20
        }}
      >


        <h3>
          Download Kartu PNG
        </h3>


        <div
          className="grid grid2"
        >


          <div>

            <label>
              Nomor Awal
            </label>


            <input

              className="input"

              value={start}

              onChange={
                e =>
                setStart(
                  e.target.value
                )
              }

            />

          </div>





          <div>

            <label>
              Nomor Akhir
            </label>


            <input

              className="input"

              value={end}

              onChange={
                e =>
                setEnd(
                  e.target.value
                )
              }

            />

          </div>


        </div>




        <button

          className="btn"

          onClick={
            downloadBatch
          }

        >

          Download ZIP PNG

        </button>



      </section>







      {/* SEARCH FILTER */}


      <section
        className="card"
        style={{
          marginTop:20
        }}
      >


        <h3>
          Daftar Kartu
        </h3>


        <p className="muted">

          Menampilkan {filtered.length} kartu

        </p>



        <input

          className="input"

          placeholder="Cari serial kartu..."

          value={search}

          onChange={
            e =>
            setSearch(
              e.target.value
            )
          }

        />




        <div
          style={{
            display:'flex',
            gap:10,
            flexWrap:'wrap'
          }}
        >


          {
            [
              'ALL',
              'ACTIVE',
              'UNASSIGNED',
              'LOST'
            ]

            .map(item=>(


              <button

                key={item}

                className={
                  filter === item
                  ?
                  'btn'
                  :
                  'btn secondary'
                }


                onClick={()=>
                  setFilter(item)
                }

              >

                {item}

              </button>


            ))

          }


        </div>


      </section>


      {/* TABLE CARD */}


      <section
        className="card"
        style={{
          marginTop:20
        }}
      >


        {
          visibleCards.length === 0

          ?

          <div
            className="empty-state"
          >

            <h3>
              Tidak ada kartu ditemukan
            </h3>


            <p className="muted">

              Coba ubah kata pencarian
              atau filter status kartu.

            </p>


          </div>


          :


          <div
            style={{
              overflowX:'auto'
            }}
          >


            <table
              className="table"
            >

              <thead>

                <tr>

                  <th>
                    Serial
                  </th>


                  <th>
                    Status
                  </th>


                  <th>
                    Dibuat
                  </th>


                  <th>
                    Action
                  </th>

                </tr>

              </thead>



              <tbody>


              {
                visibleCards.map(card=>(


                  <tr
                    key={card.id}
                  >


                    <td>

                      <strong>
                        {card.serial}
                      </strong>

                    </td>



                    <td>

                      {
                        getStatus(card) === 'ACTIVE'

                        ?

                        <span className="badge success-badge">

                          ACTIVE

                        </span>


                        :


                        getStatus(card) === 'LOST'


                        ?

                        <span className="badge danger-badge">

                          LOST

                        </span>


                        :


                        <span className="badge warning-badge">

                          UNASSIGNED

                        </span>

                      }

                    </td>




                    <td>

                      {
                        card.created_at

                        ?

                        new Date(
                          card.created_at
                        )
                        .toLocaleDateString(
                          'id-ID'
                        )

                        :

                        '-'

                      }

                    </td>





                    <td>


                      <div
                        style={{
                          display:'flex',
                          gap:8,
                          flexWrap:'wrap'
                        }}
                      >



                        <a

                          className="btn secondary"

                          href={
                            `/admin/cards/${card.serial}`
                          }

                        >

                          Detail

                        </a>





                        <button

                          className="btn"

                          onClick={()=>

                            downloadOne(
                              card.serial
                            )

                          }

                        >

                          QR PNG

                        </button>



                      </div>


                    </td>



                  </tr>


                ))

              }


              </tbody>


            </table>


          </div>


        }




        {/* PAGINATION */}


        {
          filtered.length > perPage &&

          <div
            className="pagination"
          >


            <button

              className="btn secondary"

              disabled={
                page <= 1
              }

              onClick={()=>setPage(page-1)}

            >

              Previous

            </button>





            <span className="muted">

              Halaman {page} dari {totalPages || 1}

            </span>





            <button

              className="btn secondary"

              disabled={
                page >= totalPages
              }

              onClick={()=>setPage(page+1)}

            >

              Next

            </button>



          </div>

        }


      </section>








      {/* MONITORING */}


      <section

        className="card"

        style={{
          marginTop:20
        }}

      >


        <h3>

          Monitoring Aktivitas

        </h3>




        {
          monitoring.length === 0


          ?


          <p className="muted">

            Belum ada aktivitas.

          </p>



          :



          <table
            className="table"
          >


            <thead>

              <tr>

                <th>
                  Serial
                </th>


                <th>
                  Event
                </th>


                <th>
                  Waktu
                </th>


              </tr>

            </thead>



            <tbody>


              {
                monitoring.map(item=>(


                  <tr
                    key={item.id}
                  >


                    <td>
                      {item.serial}
                    </td>


                    <td>
                      {item.event}
                    </td>


                    <td>

                      {
                        item.created_at

                        ?

                        new Date(
                          item.created_at
                        )
                        .toLocaleString(
                          'id-ID'
                        )

                        :

                        '-'

                      }

                    </td>


                  </tr>


                ))

              }


            </tbody>


          </table>


        }



      </section>





    </main>

  )

}