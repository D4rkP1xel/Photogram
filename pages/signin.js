import {useSession, signIn } from 'next-auth/react'
import {useRouter} from 'next/router'

import Loading from '../components/loading'

function SignIn() {
    const router = useRouter()
    const {data: session, status } = useSession()
    
    
    if(status === "loading")
    {
        return <Loading />
    }
    if(session)
    {
        router.push(router.query?.callbackUrl || "/")
        return 
    }
    return (
        <div className="sm:w-8/12 lg:w-6/12 py-14 bg-green-600 mx-auto translate-y-24" style={{boxShadow: "0px 0px 6px 0px rgba(0,0,0,0.2)"}}>
            <div className="flex justify-center mb-14">
                <img className="h-48" src="/login-icon.png" />
            </div>

            <div className="flex bg-stone-50 gap-4 justify-center w-3/4 mx-auto border-2 items-center select-none cursor-pointer" onClick={()=>signIn("google", {callbackUrl: process.env.VERCEL_URL}) }>
                
                <img className="h-6" src="/google-logo.png" alt="google-logo" />
                <span className="py-2">Sign in with Google</span>
            </div>
        </div>
    )
}

export default SignIn