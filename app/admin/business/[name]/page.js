export default function BusinessDetail({params}) {

  return (
    <div style={{padding:40}}>
      <h1>Detail Business</h1>

      <p>
        Nama:
        {' '}
        {params.name}
      </p>

    </div>
  )

}