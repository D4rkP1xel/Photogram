import axios from '../../utils/axiosConfig'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Header from '../../components/header'
import { useState } from 'react'
import checkSessionProvider from '../../utils/checkSessionProvider'
import { useRouter } from 'next/router'

function Test() {
    const queryClient = useQueryClient()
    const { data: session } = useSession()
    const router = useRouter()
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
          email: session.user.email,
          provider: session.provider
        }).then((res) => checkSessionProvider(res.data.data, session.provider, router))
      }, { enabled: !!session })
    const [last_post_id, setLast_post_id] = useState(null)
    async function getInfinitePosts(last_post_id_param)
    {
        
        try{
            let res = await axios.post("/posts/getPosts", {user_id: userInfo.id, last_post_id: last_post_id_param})
            let postsRead = res.data.posts
            if(postsRead.length > 0)
            {
                setLast_post_id(postsRead[postsRead.length-1].id)
                console.log(last_post_id_param +" new last_post_id: " + postsRead[postsRead.length-1].id)
            }
            else
            {
                console.log("no new posts")
            }
            let prevArray = queryClient.getQueryData(["timeline_posts"])
            console.log(prevArray)
            if(prevArray == null)
             return postsRead
            return [...prevArray, ...postsRead]
        }
        catch(err)
        {
            console.log(err)
            return null
        }
    }

    const { data: posts, refetch } = useQuery(['timeline_posts'], (prevPosts)=>{return getInfinitePosts(last_post_id)}, 
    { enabled: !!session && !!userInfo, refetchOnWindowFocus: false})
    return (
        <>
            <Header userInfo={userInfo} />
            <button onClick={()=>refetch()}>ayo</button>
        </>
    )
}

export default Test
