'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'


export default function AdminLogsPage(){


  const [logs,setLogs] =
    useState([])


  const [stats,setStats] =
    useState({
      today:0,
      update:0,
      activate:0
    })


  const [loading,setLoading] =
    useState(true)


  const [search,setSearch] =
    useState('')


  const [status,setStatus] =
    useState('')


  const [action,setAction] =
    useState('')


  const [page,setPage] =
    useState(1)


  const [total,setTotal] =
    useState(0)



  const limit = 20






  async function loadLogs(){


    try{


      setLoading(true)



      const params =
      new URLSearchParams({

        page,

        limit,

        search,

        status,

        action

      })




      const res =
      await fetch(

        `/api/admin/logs?${params}`,

        {
          cache:'no-store'
        }

      )





      const data =
      await res.json()





      if(res.ok){


        setLogs(
          data.logs || []
        )


        setTotal(
          data.total || 0
        )


        setStats(
          data.stats || {}
        )


      }




    }catch(err){


      console.error(err)


    }
    finally{


      setLoading(false)


    }


  }







  useEffect(()=>{


    loadLogs()


  },[

    page,

    search,

    status,

    action

  ])








  function formatDate(value){


    return new Date(value)

    .toLocaleString(

      'id-ID',

      {

        timeZone:'Asia/Jakarta'

      }

    )

  }







  function badgeStatus(value){


    return (

      <span className="status">

        {value || '-'}

      </span>

    )

  }







return (

<div className="wrap">



<div className="nav">


<div>

<h1>
Audit Log Kartu
</h1>


<p className="muted">
Riwayat perubahan kartu NFC
</p>


</div>


</div>







<div className="grid grid2">



<div className="card">

<p className="muted">
Total Aktivitas
</p>


<h2>
{total}
</h2>


</div>




<div className="card">

<p className="muted">
Hari Ini
</p>


<h2>
{stats.today}
</h2>


</div>




<div className="card">

<p className="muted">
Update Card
</p>


<h2>
{stats.update}
</h2>


</div>




<div className="card">

<p className="muted">
Activate Card
</p>


<h2>
{stats.activate}
</h2>


</div>



</div>









<div className="card">


<div className="grid grid2">



<input

className="input"

value={search}

onChange={(e)=>{

setPage(1)

setSearch(
e.target.value
)

}}

placeholder="Cari serial atau email..."

/>







<select

className="input"

value={status}

onChange={(e)=>{

setPage(1)

setStatus(
e.target.value
)

}}

>


<option value="">
Semua Status
</option>


<option>
ACTIVE
</option>


<option>
UNASSIGNED
</option>


<option>
LOST
</option>


</select>








<select

className="input"

value={action}

onChange={(e)=>{

setPage(1)

setAction(
e.target.value
)

}}

>


<option value="">
Semua Aktivitas
</option>


<option>
UPDATE_CARD
</option>


<option>
ACTIVATE_CARD
</option>


<option>
DELETE_CARD
</option>


</select>



</div>


</div>









<div className="card">


<table className="table">


<thead>

<tr>


<th>
Waktu
</th>


<th>
Admin
</th>


<th>
Serial
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

loading


?


<tr>

<td colSpan="5">

Loading...

</td>

</tr>



:


logs.map(log=>(



<tr

key={log.id}

>


<td>

{formatDate(log.created_at)}

</td>



<td>

{log.admin_email}

</td>



<td>

<b>

{log.serial}

</b>

</td>





<td>

{badgeStatus(log.old_status)}

&nbsp;→&nbsp;

{badgeStatus(log.new_status)}

</td>





<td>


<Link

href={`/admin/logs/${log.id}`}

className="status"

>

{log.action}

</Link>


</td>



</tr>



))


}



</tbody>



</table>



</div>









<div className="nav">



<button

className="btn secondary"

disabled={
page<=1
}

onClick={()=>setPage(
p=>p-1
)}

>

Previous

</button>





<span>

Page {page} / {Math.ceil(total/limit)||1}

</span>






<button

className="btn"

disabled={
page*limit>=total
}

onClick={()=>setPage(
p=>p+1
)}

>

Next

</button>



</div>






</div>

)


}