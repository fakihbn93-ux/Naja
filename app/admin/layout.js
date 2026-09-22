import { requireAdmin } from '../../lib/auth/admin'
import { redirect } from 'next/navigation'


export default async function AdminLayout({
  children
}) {


  const auth =
    await requireAdmin()



  if(auth.error){

    redirect('/login')

  }




  return (


    <div
      className="
      min-h-screen
      bg-slate-50
      "
    >


      <main

        className="
        max-w-7xl
        mx-auto
        px-6
        py-10
        "

      >

        {children}


      </main>


    </div>


  )


}