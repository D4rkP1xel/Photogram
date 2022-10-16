import {useSession, signIn, signOut } from 'next-auth/react'
import {useRouter} from 'next/router'
import { useEffect } from 'react'
import Loading from '../components/loading'
import axios from '../utils/axiosConfig'
function SignIn() {
    const router = useRouter()
    const {data: session, status } = useSession()
    useEffect(() => {
        async function updateUser()
        {
            const response = await axios.post("user/updateUser", {
                user_data: session.user
            })
            if(response.data.message !== "success")
            {
                signOut()
                alert("Error")
                return
            }
            setTimeout(()=>{

                router.push(router.query?.callbackUrl || "/")
            }, 1000)
        }
        if(session)
        {
            updateUser()
        }
    }, [session])
    
    if(status === "loading")
    {
        return <Loading />
    }
    if(session)
    {
        //useEffect handles the rest
        return <Loading />
    }
    return (
        <div className="sm:w-8/12 lg:w-6/12 py-14 bg-green-600 mx-auto translate-y-24" style={{boxShadow: "0px 0px 6px 0px rgba(0,0,0,0.2)"}}>
            <div className="flex justify-center mb-14">
                <img className="h-48" src="/login-icon.png" />
            </div>

            <div className="flex bg-stone-50 gap-4 justify-center w-3/4 mx-auto border-2 items-center select-none cursor-pointer" onClick={()=>signIn("google")}>
                <img className="h-6" src="/google-logo.png" alt="google-logo" />
                <span className="py-2">Sign in with Google</span>
            </div>
        </div>
    )
}

export default SignIn