import React, { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { IoMdSearch } from 'react-icons/io'

function Header({ userInfo, searchQuery }) {
  const router = useRouter()
  const [isMenuOpened, openMenu] = useState(false)
  const pfIconRef = useRef()
  const searchBarRef = useRef()
  const [searchBarText, setSearchBarText] = useState("")

  function handleChangeSearchBarText(e) {
    if (e.target.value.length <= 24) {
      setSearchBarText(e.target.value)
    }
  }
  const handleClickOutside = (event) => {
    if (pfIconRef.current && !pfIconRef.current.contains(event.target)) {
      openMenu(false);
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    if (searchQuery !== undefined) {
      setSearchBarText(searchQuery)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    };

  }, [searchQuery])

  function handleOpenMenu() {
    if (isMenuOpened === false) {
      openMenu(true)
      return
    }
    openMenu(false)
  }
  function handleSearch(e) {
    if (e.keyCode === 13 && searchBarText !== "") {
      if(router.asPath.includes("/search?q"))
        router.push("/fix?searchq=" + searchBarText)
      else
        router.push("/search?q=" + searchBarText)
    }
  }
  async function signOutHandler() {
    const data = await signOut({ redirect: false, callbackUrl: "/signin" })
    router.push(data.url)
  }
  return (
    <>
      <div className="z-20 h-20 w-screen fixed bg-slate-100 flex justify-center">
        <div className='flex lg:w-8/12 w-10/12 h-full items-center justify-between'>
          <div onClick={() => router.push("/")} className='flex items-center cursor-pointer '>
            <div className='gap-6 flex items-center'>
              <img className='h-14' src="/instagram-logo.png" />
              <span className="font-semibold text-xl lg:block hidden">PHOTOGRAM</span></div>
          </div>

          <div className='flex gap-4 items-center rounded-full border border-black py-1 px-2'>
            <IoMdSearch onClick={()=>searchBarText !== "" ? router.asPath.includes("/search?q") ? router.push("/fix?searchq=" + searchBarText) : router.push("/search?q=" + searchBarText) : null} className='h-6 w-auto cursor-pointer' />
            <input ref={searchBarRef} onChange={handleChangeSearchBarText} value={searchBarText} onKeyDown={handleSearch} className='md:w-60 w-40 bg-transparent outline-none'></input>
          </div>

          <div>
            {userInfo?.photo_url ? <img onClick={handleOpenMenu} ref={pfIconRef} className='h-14 hover:relative hover:scale-105 duration-200 ease-out rounded-full cursor-pointer select-none' draggable="false" src={userInfo?.photo_url} alt={userInfo?.username + " image"} referrerPolicy="no-referrer" /> : <div className='h-14 w-14 rounded-full bg-slate-300'></div>}

            <div className={isMenuOpened ? "z-10 duration-200 absolute select-none -translate-x-10 top-24 w-40 bg-slate-50 shadow" : "translate-x-4 z-10 opacity-0 absolute pointer-events-none select-none right-4 top-24 w-40 bg-slate-50 shadow"}>
              <div onClick={() => router.push("/user/" + userInfo.id)} className='w-full hover:bg-white duration-200 ease-in p-2 cursor-pointer'>Profile</div>
              <div onClick={() => router.push("/settings/")} className='w-full hover:bg-white duration-200 ease-in p-2 cursor-pointer'>Settings</div>
              <hr />
              <div onClick={async () => await signOutHandler()} className='w-full hover:bg-white duration-200 ease-in p-2 cursor-pointer'>Logout</div>

            </div>
          </div>

        </div>

      </div>
      <div className='h-20 w-full'></div>
    </>
  )
}

export default Header