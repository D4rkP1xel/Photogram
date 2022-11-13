import React, { useEffect, useRef, useState } from 'react'
import {signOut} from 'next-auth/react'
import { useRouter } from 'next/router'
function Header({ userInfo }) {
  const router = useRouter()
  const [isMenuOpened, openMenu] = useState(false)
  const pfIconRef = useRef() 
  const handleClickOutside = (event) => {
    if (pfIconRef.current && !pfIconRef.current.contains(event.target)) {
        openMenu(false);
    }
};
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
        document.removeEventListener('click', handleClickOutside, true);
    };
}, [])

  function handleOpenMenu() {
    if (isMenuOpened === false) {
      openMenu(true)
      return
    }
    openMenu(false)
  }
  async function signOutHandler()
  {
    const data = await signOut({redirect: false, callbackUrl: "/signin"})
    router.push(data.url)
  }
  return (
    <>
      <div className="z-20 h-20 w-screen fixed bg-slate-100 flex justify-center">
        <div className='flex w-8/12 h-full items-center'>
          <div onClick={()=>router.push("/")} className='flex items-center gap-6 cursor-pointer'><img className='h-14' src="/instagram-logo.png"/><span className="font-semibold text-xl">PHOTOGRAM</span></div>
          <div className='ml-auto'>
            {userInfo?.photo_url ? <img onClick={handleOpenMenu} ref={pfIconRef} className='h-14 hover:relative hover:scale-105 duration-200 ease-out rounded-full cursor-pointer select-none' draggable="false" src={userInfo?.photo_url} alt={userInfo?.username + " image"} referrerPolicy="no-referrer"/> : <div className='h-14 w-14 rounded-full bg-slate-300'></div>}
            
            <div className={isMenuOpened ? "z-10 duration-200 absolute select-none -translate-x-10 top-24 w-40 bg-slate-50 shadow" :  "translate-x-4 z-10 opacity-0 absolute pointer-events-none select-none right-4 top-24 w-40 bg-slate-50 shadow"}>
              <div onClick={()=>router.push("/user/" + userInfo.id)} className='w-full hover:bg-white duration-200 ease-in p-2 cursor-pointer'>Profile</div>
              <div onClick={()=>router.push("/settings/")} className='w-full hover:bg-white duration-200 ease-in p-2 cursor-pointer'>Settings</div>
              <hr/>
              <div onClick={async ()=> await signOutHandler()} className='w-full hover:bg-white duration-200 ease-in p-2 cursor-pointer'>Logout</div>
      
            </div>
          </div>

        </div>

      </div>
      <div className='h-20 w-full'></div>
    </>
  )
}

export default Header