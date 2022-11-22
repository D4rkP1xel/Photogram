import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Header from '../components/header'
import HeaderNotLogged from '../components/headerNotLogged'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '../utils/axiosConfig'
import { IoMdHeartEmpty, IoMdHeart } from 'react-icons/io'
import { BsChat } from 'react-icons/bs'
import toDate from '../utils/toDate'

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
                                posts.map((postInfo, index) => {
                                    return (
                                        <div key={postInfo.id} className='w-full my-10'>
                                            <div className='bg-slate-200 rounded-t-2xl p-4 items-center flex w-full'>
                                                <img className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={postInfo.user_photo_url} alt="" referrerPolicy="no-referrer" />
                                                <div className='mx-4 font-semibold cursor-pointer select-none'>{postInfo.username}</div>
                                            </div>
                                            <div className={'w-full aspect-square bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${postInfo.photo_url}')` }}></div>
                                            <div className='h-14 bg-slate-200 pt-4 flex px-2'>
                                                {postInfo.is_liked === 1 ?
                                                    <div className='h-10 w-12 px-2 pb-2 cursor-pointer' onClick={() => mutate({setLike: false, postIndex: index})} >
                                                        <IoMdHeart className='h-full w-auto' />
                                                    </div>
                                                    :
                                                    <div className='h-10 w-12 px-2 pb-2 cursor-pointer' onClick={() => mutate({setLike: true, postIndex: index})} >
                                                        <IoMdHeartEmpty className='h-full w-auto' />
                                                    </div>
                                                }
                                                <div className='h-[30] w-[38] px-2 pb-[12px] cursor-pointer hover:text-slate-500'><BsChat className='h-full w-auto' /></div>
                                            </div>
                                            <div className='pb-4 px-4 bg-slate-200 rounded-b-2xl'>
                                                <div className='font-semibold text-sm cursor-pointer select-none'>{postInfo.num_likes === 1 ? "1 like" : postInfo.num_likes + " likes"}</div>

                                                {postInfo.description !== null ? <>
                                                    <div className='w-full'>
                                                        <div className='gap-3 py-2'>
                                                            <span className='font-medium text-sm cursor-pointer h-fit mr-2'>{postInfo.username}</span>
                                                            <span className='w-fit break-words whitespace-pre-wrap'>{postInfo.description}</span>
                                                        </div>
                                                    </div>
                                                </> : ""}
                                                <div className="text-xs text-slate-400 mt-2">{toDate(postInfo.date)}</div>
                                            </div>
                                        </div>
                                    )
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