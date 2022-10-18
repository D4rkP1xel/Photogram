import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import axiosConfig from '../../utils/axiosConfig'

function ProviderPage() { // example: /verify/google -> page to ask the user if he wants to link accounts
  const router = useRouter()
  const { data: session, status } = useSession()
  const { provider } = router.query
  useEffect(() => {

    if (provider != null) {
      if ((provider !== "facebook" && provider !== "google") || status === "unauthenticated") {
        router.push("/")
        return
      }
      //TODO down here ask the user if he wants to link the account, if no -> /signin  if yes -> new express route /addprovider
    }
  }, [provider, status])

  function addProvider()
  {
    axiosConfig.post("/user/addProvider", {
      provider: provider,
      email: session.user.email
    })
  }
  return (
    <>
      {status === "authenticated" ?
        <>
          <div className="text-lg">
            <div>Do you want to link your {provider} account for {session.user.email + "?" || "current email?"}</div>
          </div>
          <button onClick={addProvider}>Add Provider</button><button onClick={()=>router.push("/")}>Cancel</button>
        </>
        : ""}
    </>
  )
}

export default ProviderPage