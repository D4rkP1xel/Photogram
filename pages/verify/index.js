import {useSession, signIn, signOut } from 'next-auth/react'
import {useRouter} from 'next/router'
import { useEffect } from 'react'
import Loading from '../../components/loading'
import axios from '../../utils/axiosConfig'

function Index() {                  // example: /verify?provider=google -> check in db if provider exists
    const router = useRouter()
    const {data: session, status } = useSession() 

    if(status === "unauthenticated")
        {
            router.push("/signin")
        }
    useEffect(() => {
        async function updateUser()
        {
            const response = await axios.post("user/updateUser", {
                user_data: session.user,
                provider: router.query.provider
            })
            if(response.data.message === "unsuccess")
            {
                signOut()
                alert("Error")
                router.push('/signin')
                return
            }
            if(response.data.message === "success")
            {
                console.log("success")
                setTimeout(()=>{

                    router.push("/")
                }, 1000)
                return <Loading />
            }
            if(response.data.message === "new provider")
            {
                console.log("new provider")
                router.push("/verify/" + response.data.provider)
                return
            }
            
        }
        if(session && (router.query.provider === 'google' || router.query.provider === 'facebook'))
        {
            updateUser()
        }
        
    }, [session])
  return (
    <Loading />
  )
}

export default Index