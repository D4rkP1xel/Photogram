import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import Loading from '../../components/loading'
import axios from '../../utils/axiosConfig'


function Index() {                  // example: /verify?provider=google -> check in db if provider exists
    const router = useRouter()
    const { data: session, status } = useSession()
    const { data: serverResponse } = useQuery(["response"], async () => {
        return axios.post("/user/updateUser", {
            user_data: session.user,
            provider: router.query.provider
        }).then((res) => res.data)
    }, { enabled: !!session && (router.query.provider === "google" || router.query.provider === "facebook") })

    if (status === "unauthenticated") {
        router.push("/signin")
        return
    }
    if (serverResponse != null) {
        if (serverResponse.message === "unsuccess") {
            signOut()
            alert("Error")
            router.push('/signin')
            return
        }
        if (serverResponse.message === "success") {
            //console.log("success")
                router.push("/")
                return
        }
        if (serverResponse.message === "new provider") {
            //console.log("new provider")
            router.push("/verify/" + serverResponse.provider)
            return
        }
    }
    return (
        <>
            <Loading />
        </>
    )
}

export default Index