import React, { useEffect, useState } from 'react'
import {signOut} from 'next-auth/react'
function Header({ userInfo }) {
  const [isMenuOpened, openMenu] = useState(false)
  
  function handleOpenMenu() {
    if (isMenuOpened === false) {
      openMenu(true)
      return
    }
    openMenu(false)
  }
  return (
    <>
      <div className="h-20 w-screen fixed bg-slate-100 flex justify-center">
        <div className='flex w-8/12 h-full items-center'>
          <div className='flex items-center gap-6'><img className='h-14' src='instagram-logo.png' /><span className="font-semibold text-xl">PHOTOGRAM</span></div>
          <div className='ml-auto'>
            <img onClick={handleOpenMenu} className='h-14 hover:relative hover:scale-105 duration-200 ease-out rounded-full cursor-pointer' src={userInfo.photo_url} alt={userInfo?.username + " image"} onL/>
            <div className={isMenuOpened ? "z-10 duration-200 absolute select-none -translate-x-10 top-24 w-40 bg-slate-50 shadow" :  "translate-x-4 z-10 opacity-0 absolute pointer-events-none select-none right-4 top-24 w-40 bg-slate-50 shadow"}>
              <div onClick={signOut} className='w-full hover:bg-white duration-200 ease-in p-2 cursor-pointer'>Logout</div>
              {/* <hr /> */}
            </div>
            {/* <div className='fixed w-screen h-screen top-0 left-0 z-0'></div> click outside screen*/}
          </div>

        </div>

      </div>
      <div className='h-20 w-full'></div>
    </>
  )
}

export default Header