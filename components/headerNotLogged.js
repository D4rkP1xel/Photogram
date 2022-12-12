import React from 'react'
import { useRouter } from 'next/router'

function HeaderNotLogged() {
    const router = useRouter()
    function handleSignIn() {
        router.push("/signin?callbackUrl=" + router.asPath)
    }
  return (
    <>
      <div className="z-20 h-20 w-screen fixed shadow-md  bg-neutral-100 flex justify-center">
        <div className='flex w-8/12 h-full items-center'>
          <div onClick={()=>router.push("/")} className='flex items-center gap-6 cursor-pointer'><img className='h-14' src="/instagram-logo.png"/><span className="font-semibold text-xl">PHOTOGRAM</span></div>
          <div className='ml-auto'>
            <div onClick={handleSignIn} className='cursor-pointer select-none py-2 px-4 rounded-full bg-slate-200 flex items-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in'>Log in</div>
          </div>
        </div>
      </div>
      <div className='h-20 w-full'></div>
    </>
  )
}

export default HeaderNotLogged