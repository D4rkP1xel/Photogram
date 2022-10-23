import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/header'
import { useQuery } from '@tanstack/react-query'
import axios from '../../utils/axiosConfig'
import { useSession } from 'next-auth/react'
import Loading from '../../components/loading'
import ProfileContent from '../../components/profilePage/ProfileContent'
function UserProfilePage() {
    const { data: session } = useSession()
    const router = useRouter()
    const { user_id } = router.query
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    },{enabled: !!session})

    const { data: posts } = useQuery(["user_posts"], async() => { return axios.get("/posts/user/" + user_id).then((res) => res.data.data) },{enabled: !!user_id})
    
    if (session && userInfo) {
        return (
            <>
                <Header userInfo={userInfo} />
                <ProfileContent userInfo={userInfo} />
                
            </>
        )

    }
    return (<Loading />)
}

export default UserProfilePage