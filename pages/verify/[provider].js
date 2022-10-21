import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import axios from 'axios'

function ProviderPage() { // example: /verify/google -> page to ask the user if he wants to link accounts
  const router = useRouter()
  const { data: session, status } = useSession()
  const { provider } = router.query
  const providerTitle = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : ""
  useEffect(() => {

    if (provider != null) {
      if ((provider !== "facebook" && provider !== "google") || status === "unauthenticated") {
        router.push("/")
        return
      }
      //TODO down here ask the user if he wants to link the account, if no -> /signin  if yes -> new express route /addprovider
    }
  }, [provider, status])

  async function addProvider() {
    try {
      const response = await axios.post("https://photogram-backend-production.up.railway.app/user/addProvider", {
        provider: provider,
        email: session.user.email
      })
      if (response.data.message === "success") {
        alert("Account linked!")
        router.push("/")
        return
      }
      alert("Error: " + response.data.message)
      router.push("/")
    }
    catch (err) {
      console.log(err)
      if(err.response.data.message)
        alert("Error: " + err.response.data.message)
    }
  }
  function handleSignOut() {
    signOut()
    router.push("/")
  }
  return (
    <>
      {status === "authenticated" ?
        <div className="flex bg-slate-200 px-14 py-8 translate-y-2/4 rounded-3xl justify-center w-min mx-auto select-none">
          <div>
            <div className='flex items-center gap-14'>
              <img className="w-24" src={"/" + provider + "-logo.png"} />
              <span className="text-lg w-96">Do you want to link your <span className="font-semibold">{providerTitle}</span> account for <span className="font-semibold">{session.user.email || "current email"}</span>?</span>
            </div>
            <div className='flex w-full justify-end pt-8 gap-8'>
              <div onClick={async () => await addProvider()} className='hover:bg-blue-400 duration-200 ease-in py-2 px-4 rounded-full shadow bg-blue-500 font-semibold cursor-pointer text-gray-100 hover:text-white'>Confirm</div>
              <div onClick={() => handleSignOut()} className='py-2 px-4 hover:bg-slate-200 bg-slate-100 duration-200 ease-in rounded-full shadow cursor-pointer'>Cancel</div>
            </div>
          </div>
        </div>
        : ""
        // <>
        //   <div className="text-lg">
        //     <div>Do you want to link your {provider} account for {session.user.email + "?" || "current email?"}</div>
        //   </div>
        //   <button onClick={addProvider}>Add Provider</button><button onClick={()=>router.push("/")}>Cancel</button>
        // </>
      }
    </>
  )
}

export default ProviderPage