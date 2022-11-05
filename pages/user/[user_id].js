import { useRouter } from 'next/router'
import Header from '../../components/header'
import { useQuery} from '@tanstack/react-query'
import axios from '../../utils/axiosConfig'
import { useSession } from 'next-auth/react'
import Loading from '../../components/loading'
import ProfileContent from '../../components/profilePage/ProfileContent'
import { useEffect } from 'react'
function UserProfilePage() {
    const { data: session } = useSession()
    const router = useRouter()
  
    const { user_id } = router.query
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    }, { enabled: !!session })
    const { data: profileInfo, refetch: refreshProfileInfo } = useQuery(["profile_info"], async () => { return axios.get("/user/getProfileInfo/" + user_id).then((res) => res.data.data) }, { enabled: !!user_id })
    const { data: posts, refetch: refreshPosts } = useQuery(["user_posts"], async () => { return axios.get("/posts/user/" + user_id).then((res) => res.data.data) }, { enabled: !!user_id })
    
    useEffect(()=>{
        if(user_id)
            refreshData()
    },[user_id])

    function refreshData()
    {
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
    return (<Loading />)
}

export default UserProfilePage