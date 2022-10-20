import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../components/header'
import Loading from '../components/loading'
import axios from '../utils/axiosConfig'
function Home() {
    const { data: session, status } = useSession()
    const { push, asPath } = useRouter()
    const [userInfo, setUserInfo] = useState({})
    useEffect(() => {
        async function updateUser() {
            try {
                const response = await axios.post("user/getUserInfo", {
                    email: session.user.email
                })
                if (response.data.message !== "success") {
                    signOut()
                    alert("Error")
                    return
                }
                setUserInfo(response.data.data)
            }
            catch (err) {
                console.log(err)
                //signOut()
            }
        }
        if (session) {
            updateUser()
        }
    }, [session])
    async function handleSignOut() {
        const signOutData = await signOut({ redirect: false, callbackUrl: "/" })
        push(signOutData.url)
    }
    function handleSignIn() {
        push("/signin?callbackUrl=" + asPath)
    }
    if (status === "loading") {
        return <Loading />
    }
    if (session) {
        return (
            <>
                <Header userInfo={userInfo} />
                <div>{process.env.BACKEND_API_URL}</div>
                <button onClick={handleSignOut} className='border-solid border-purple-600 border-2'>Sign Out</button>
            </>

        )
    }
    else {
        return (
            <div>
                <h1>not logged in</h1>
                <button onClick={handleSignIn} className='border-solid border-purple-600 border-2 rounded-lg p-1 bg-purple-100'>Sign In</button>
            </div>
        )
    }
}

export default Home