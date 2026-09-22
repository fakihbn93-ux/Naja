'use client'


import { useState } from 'react'
import Link from 'next/link'



export default function MergeClient({cards=[]}){


  const [mainCard,setMainCard] =
    useState(null)



  const [mergeCards,setMergeCards] =
    useState([])



  const [searchMain,setSearchMain] =
    useState('')



  const [searchMerge,setSearchMerge] =
    useState('')



  const [loading,setLoading] =
    useState(false)






  const filteredMain =

    cards.filter(card=>


      card.serial

      .toLowerCase()

      .includes(

        searchMain

        .toLowerCase()

      )


    )







  const filteredMerge =

    cards.filter(card=>


      card.id !== mainCard

      &&


      card.serial

      .toLowerCase()

      .includes(

        searchMerge

        .toLowerCase()

      )


    )







  function toggleMerge(id){


    if(

      mergeCards.includes(id)

    ){


      setMergeCards(

        mergeCards.filter(

          item=>item !== id

        )

      )


    }

    else{


      setMergeCards([

        ...mergeCards,

        id

      ])


    }


  }








  async function handleMerge(){



    if(!mainCard){


      alert(

        'Pilih kartu utama.'

      )

      return

    }






    if(

      mergeCards.length === 0

    ){


      alert(

        'Pilih kartu yang akan digabungkan.'

      )

      return


    }






    setLoading(true)





    const response =

      await fetch(

        '/api/cards/merge',

        {


          method:'POST',


          headers:{

            'Content-Type':
            'application/json'

          },



          body:JSON.stringify({


            mainCardId:

            mainCard,



            mergeCardIds:

            mergeCards


          })

        }

      )







    const result =

      await response.json()





    setLoading(false)






    if(response.ok){


      alert(

        'Kartu berhasil digabungkan.'

      )



      window.location.href =
      '/admin'



    }

    else{


      alert(

        result.error ||

        'Gagal menggabungkan kartu.'

      )


    }


  }







  return (

    <main style={wrap}>


      <Link

        href="/admin"

        style={back}

      >

        ← Dashboard

      </Link>






      <div style={card}>


        <h1>

          Gabungkan Kartu

        </h1>



        <p>

          Pindahkan beberapa kartu NFC ke toko utama.

        </p>


      </div>








      <div style={grid}>


        <div style={card}>


          <h2>

            Kartu Utama

          </h2>




          <input

            style={input}

            placeholder="Cari kartu utama..."

            value={searchMain}

            onChange={e=>

              setSearchMain(

                e.target.value

              )

            }

          />






          <div style={list}>


          {

            filteredMain.map(card=>(


              <label

                key={card.id}

                style={item}

              >


                <input

                  type="radio"

                  name="main"

                  checked={

                    mainCard === card.id

                  }

                  onChange={()=>


                    setMainCard(

                      card.id

                    )


                  }

                />



                <div>


                  <b>

                    {card.serial}

                  </b>



                  <br/>



                  Toko:

                  {' '}

                  {

                    card.businesses?.name ||

                    '-'

                  }



                  <br/>



                  Status:

                  {' '}

                  {card.status}


                </div>


              </label>


            ))

          }


          </div>


        </div>









        <div style={card}>


          <h2>

            Kartu Yang Digabungkan

          </h2>




          <input

            style={input}

            placeholder="Cari kartu..."

            value={searchMerge}

            onChange={e=>

              setSearchMerge(

                e.target.value

              )

            }

          />







          <div style={list}>


          {

            filteredMerge.map(card=>(


              <label

                key={card.id}

                style={item}

              >


                <input

                  type="checkbox"

                  checked={

                    mergeCards.includes(

                      card.id

                    )

                  }

                  onChange={()=>


                    toggleMerge(

                      card.id

                    )


                  }

                />




                <div>


                  <b>

                    {card.serial}

                  </b>



                  <br/>



                  Toko:

                  {' '}

                  {

                    card.businesses?.name ||

                    '-'

                  }



                  <br/>



                  Status:

                  {' '}

                  {card.status}



                </div>


              </label>


            ))

          }


          </div>


        </div>


      </div>









      <div style={card}>


        <button

          style={button}

          onClick={handleMerge}

          disabled={loading}

        >


          {

            loading

            ?

            'Menggabungkan...'

            :

            'Gabungkan Kartu'

          }


        </button>


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



const grid={

  display:'grid',

  gridTemplateColumns:

  'repeat(auto-fit,minmax(350px,1fr))',

  gap:25

}



const input={

  width:'100%',

  padding:14,

  border:'1px solid #ddd',

  borderRadius:12,

  marginBottom:20,

  boxSizing:'border-box'

}



const list={

  maxHeight:450,

  overflowY:'auto'

}



const item={

  display:'flex',

  gap:15,

  padding:15,

  borderBottom:'1px solid #eee',

  cursor:'pointer'

}



const button={

  background:'#111827',

  color:'#fff',

  padding:'14px 25px',

  border:0,

  borderRadius:12,

  fontWeight:700,

  cursor:'pointer'

}



const back={

  display:'inline-block',

  marginBottom:20,

  color:'#111827',

  textDecoration:'none',

  fontWeight:700

}