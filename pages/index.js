import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../components/header'
import HeaderNotLogged from '../components/headerNotLogged'
import Loading from '../components/loading'
import MainContent from '../components/mainPage/mainContent'

import axios from '../utils/axiosConfig'
function Home() {
    const { data: session, status } = useSession()
    const { push, asPath } = useRouter()
    const [userInfo, setUserInfo] = useState({})
    useEffect(() => {
        async function updateUser() {
            try {
                const response = await axios.post("/user/getUserInfo", {
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
    
    if (status === "loading") {
        return <Loading />
    }
    if (status === "authenticated") {
        return (
            <>
                <Header userInfo={userInfo} />
                <MainContent />
            </>

        )
    }
    else {
        return (
            <>
                <HeaderNotLogged />
                <MainContent />
            </>
        )
    }
}

export default Home