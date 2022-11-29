import {useSession, signIn } from 'next-auth/react'
import {useRouter} from 'next/router'

import Loading from '../components/loading'
import axios from '../utils/axiosConfig'

function SignIn() {
    const router = useRouter()
    const {data: session, status } = useSession()
    
    
    if(status === "loading")
    {
        return <Loading />
    }
    if(session)
    {
        
        router.push("/verify?provider=google")
        // router.push(router.query?.callbackUrl || "/")
        return 
    }
    return (
        <div className="sm:w-8/12 lg:w-6/12 py-14 bg-slate-300 mx-auto translate-y-24" >
            <div className="flex justify-center mb-14">
                <img className="h-48" src="/instagram-logo.png" />
            </div>

            <div className="flex mb-6 bg-stone-50 gap-4 justify-center w-3/4 mx-auto border-2 items-center select-none cursor-pointer" onClick={()=>signIn("google", {callbackUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL}) }>
                <img className="h-6" src="/google-logo.png" alt="google-logo" />
                <span className="py-2">Sign in with Google</span>
            </div>
            <div className="flex bg-stone-50 gap-4 justify-center w-3/4 mx-auto border-2 items-center select-none cursor-pointer" onClick={()=>signIn("facebook", {callbackUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL}) }>
                <img className="h-6" src="/facebook-logo.png" alt="facebook-logo" />
                <span className="py-2">Sign in with Facebook</span>
            </div>
        </div>
    )
}

export default SignIn