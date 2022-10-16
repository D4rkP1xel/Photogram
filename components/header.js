import React from 'react'

function Header({userInfo}) {
  return (
    <>
    <div className="h-20 w-screen fixed bg-slate-100 flex justify-center">
        <div className='flex w-8/12 h-full items-center'>
            <div className='flex items-center gap-6'><img className='h-14' src='instagram-logo.png' /><span className="font-semibold text-xl">PHOTOGRAM</span></div>
            <img className='h-14 rounded-full ml-auto cursor-pointer' src={userInfo?.photo_url} alt={userInfo?.username + " image"} />
        </div>
        
    </div>
    <div className='h-20 w-screen'></div>
    </>
  )
}

export default Header