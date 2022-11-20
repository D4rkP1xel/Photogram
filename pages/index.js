import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Header from '../components/header'
import HeaderNotLogged from '../components/headerNotLogged'
import MainContent from '../components/mainPage/mainContent'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '../utils/axiosConfig'
import Post from '../components/mainPage/Post'

function Home() {
    const queryClient = useQueryClient()
    const { data: session, status } = useSession()
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    }, { enabled: !!session })

    const [last_post_id, setLast_post_id] = useState(null)

    async function getInfinitePosts(last_post_id_param) {
        try {
            let res = await axios.post("/posts/getPosts", { user_id: userInfo.id, last_post_id: last_post_id_param })
            let postsRead = res.data.posts
            if (postsRead.length > 0) {
                setLast_post_id(postsRead[postsRead.length - 1].id)
                //console.log(last_post_id_param +" new last_post_id: " + postsRead[postsRead.length-1].id)
            }
            else
                console.log("no new posts")

            let prevArray = queryClient.getQueryData(["timeline_posts"])
            if (prevArray == null)
                return postsRead
            return [...prevArray, ...postsRead]
        }
        catch (err) {
            console.log(err)
            return null
        }
    }

    const { data: posts, refetch } = useQuery(['timeline_posts'], () => { return getInfinitePosts(last_post_id) },
        { enabled: !!session && !!userInfo, refetchOnWindowFocus: false })
    return (
        <>
            {
                posts !== undefined ?
                    <>
                        <Header userInfo={userInfo} />
                        <div className='w-[500px] mx-auto'>
                            {posts != null ?
                                posts.map((postInfo) => {
                                    return <Post key={postInfo.id} postInfo={postInfo} />
                                })
                                : ""}
                        </div>
                        <button onClick={() => refetch()}>ayo</button>

                    </>
                    :
                    <>
                        <HeaderNotLogged />

                    </>

            }
        </>
    )
}

export default Home