export default async function Success({searchParams}) {

  const sp = await searchParams

  const serial = sp?.serial || '-'


  return (

    <main className="wrap">

      <div 
        className="card"
        style={{
          maxWidth:600,
          margin:'40px auto',
          textAlign:'center'
        }}
      >

        <h1>
          ✅ Kartu Berhasil Aktif
        </h1>


        <p>
          Kartu:
          <b> {serial}</b>
        </p>


        <p className="muted">

          Kartu NFC sekarang siap digunakan.
          Tempelkan kartu ke HP pelanggan untuk membuka Google Review.

        </p>


      </div>

    </main>

  )

}