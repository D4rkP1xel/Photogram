import { useRouter } from 'next/router'
import Header from '../../components/header'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '../../utils/axiosConfig'
import { useSession } from 'next-auth/react'
import ProfileContent from '../../components/profilePage/ProfileContent'
import { useEffect } from 'react'
import HeaderNotLogged from '../../components/headerNotLogged'
import checkSessionProvider from '../../utils/checkSessionProvider'

function UserProfilePage() {
    const { data: session, status: sessionStatus } = useSession()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { user_id } = router.query
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
          email: session.user.email,
          provider: session.provider
        }).then((res) => checkSessionProvider(res.data.data, session.provider, router))
      }, { enabled: !!session })
    const { data: profileInfo, refetch: refreshProfileInfo } = useQuery(["profile_info"], async () => { return axios.get("/user/getProfileInfo/" + user_id).then((res) => res.data.data) }, { enabled: !!user_id })
    const { data: posts, refetch: refreshPosts } = useQuery(["user_posts"], async () => { return axios.get("/posts/user/" + user_id).then((res) => res.data.data) }, { enabled: !!user_id })

    useEffect(() => {
        if (user_id)
            refreshData()
        if(router.isReady && router.query.user_id !== undefined && userInfo !== undefined && queryClient.getQueryData(["user_info"]) === undefined)
        {
            router.push("/fix?profileid="+ user_id)
        }
    }, [user_id, router.isReady, queryClient.getQueryData(["user_info"]), userInfo ])

    function refreshData() {
        refreshProfileInfo()
        refreshPosts()
    }
    if (session && userInfo) {

        return (
            <>
                <Header userInfo={userInfo} />
                <ProfileContent profileInfo={profileInfo} userInfo={userInfo} posts={posts} />
            </>
        )

    }
    {
        return sessionStatus === "unauthenticated" ?
            <HeaderNotLogged /> //TODO show user page even when not logged in
            :
            <Header userInfo={userInfo} />
    }
}

export default UserProfilePage