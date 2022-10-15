import {useSession, signOut } from 'next-auth/react'
import {useRouter} from 'next/router'
import Loading from '../components/loading'
function Home() {
    const { data: session, status} = useSession()
    const { push, asPath} = useRouter()
    async function handleSignOut()
    {
        const signOutData = await signOut({redirect: false, callbackUrl:"/"})
        push(signOutData.url)
    }
    function handleSignIn()
    {
        push("/signin?callbackUrl=" + asPath)
    }
    if(status === "loading")
    {
        return <Loading />
    }
    if(session)
    {
        return(
            <div className='bg-slate-300'>
                <h1>logged in, {session.user.name}</h1>
                <button onClick={handleSignOut} className='border-solid border-purple-600 border-2'>Sign Out</button>
            </div>
            
        )
    }
    else
    {
        return(
            <div>
                <h1>not logged in</h1>
                <button onClick={handleSignIn} className='border-solid border-purple-600 border-2 rounded-lg p-1 bg-purple-100'>Sign In</button>
            </div>
        )
    }
}

export default Home