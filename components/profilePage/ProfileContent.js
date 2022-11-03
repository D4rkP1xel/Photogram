import { BsFillCameraFill, BsFillPersonPlusFill, BsFillPersonDashFill } from 'react-icons/bs'
import { useRouter } from 'next/router'
import axios from '../../utils/axiosConfig'
import { useQuery, useMutation, QueryCache, QueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

function ProfileContent({ profileInfo, userInfo, posts }) {

    async function changeFollowing()
    {
        if(isFollowing)
        {
            if(isFollowing === true)
                return await axios.post("/user/removeFollowing", {follower: userInfo.id, following: profileInfo.id}).then((res) => res.data.follows)
            return await axios.post("/user//addFollowing", {follower: userInfo.id, following: profileInfo.id}).then((res) => res.data.follows)
        }
        return null
    }
    const router = useRouter()
    const { data: isFollowing, refetch: refetchFollow } = useQuery(["isFollowing"], async () => { return axios.post("/user/getFollowing", {follower: userInfo.id, following: profileInfo.id}).then((res) => res.data.follows) }, { enabled: !!profileInfo && !!userInfo && profileInfo.id !== userInfo.id })
    const {mutate} = useMutation(changeFollowing, {

        onMutate: (newFollowValue)=>{
            new QueryClient().setQueryData(['isFollowing'], newFollowValue)
        },
        onError: (error, newData, rollback) => rollback(),
        onSettled: () => refetchFollow()
    })
    const followRef = useRef()
    useEffect(()=>{
        if(followRef && isFollowing === true)
        followRef.current.innerText = "Following"
    }, [isFollowing, followRef])
    return (
        <>
            {posts ? console.log(posts) : ""}
            {isFollowing ? console.log(isFollowing) : ""}
            <div className='sm:w-[600px] w-full mx-auto mt-8'>
                <div className='flex sm:w-10/12 w-full mx-auto sm:justify-start justify-around'>
                    <img className='rounded-full sm:h-40 h-32' src={profileInfo?.photo_url} alt={profileInfo?.username + " photo"} referrerPolicy="no-referrer" />
                    <div className='flex sm:ml-auto flex-col my-auto'>
                        <div className='font-bold text-xl'>{profileInfo?.username}</div>
                        <div className='mt-1'>
                            <span className='font-semibold'>0 </span><span className='font-light'>posts <span>&nbsp;</span></span>
                            <span className='font-semibold'>150 </span><span className='font-light'>followers <span>&nbsp;</span></span>
                            <span className='font-semibold'>397 </span><span className='font-light'>following</span>
                        </div>
                        <div className='mt-4'>Bro/King</div>
                    </div>
                </div>
                {userInfo?.id && profileInfo?.id ?
                    userInfo.id === profileInfo.id ?
                        <div className='w-full flex flex-row-reverse'> {/*add photo button*/}
                            <div onClick={() => router.push("/addPost")} className='bg-slate-200 rounded-full select-none cursor-pointer h-8 w-32 flex gap-2 justify-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mr-2'>
                                <BsFillCameraFill className='h-4 w-4 my-auto' />
                                <div className='my-auto'>Share Photo</div>
                            </div>
                        </div>
                        :
                        isFollowing ?
                        <div className='w-full flex flex-row-reverse'> {/*follow button*/}
                            {new QueryClient().getQueryData(['isFollowing']) === true ?
                            <div onMouseEnter={()=> followRef.current.innerText = "Unfollow"} onMouseLeave={()=> followRef.current.innerText = "Following"} onClick={() => mutate(false)} className='bg-slate-200 rounded-full select-none cursor-pointer h-8 w-32 flex gap-2 justify-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mr-2 hover:border-red-600 hover:text-red-600 hover:border'>
                                <div className='my-auto' ref={followRef}></div>
                            </div>
                            :
                            <div onClick={() => mutate(true)} className='bg-slate-200 rounded-full select-none cursor-pointer h-8 w-32 flex gap-2 justify-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mr-2'>
                                <BsFillPersonPlusFill className='h-4 w-4 my-auto' />
                                <div className='my-auto'>Follow</div>
                            </div>
                            }
                        </div>
                        : 
                        <div className='w-full flex flex-row-reverse'>
                            <div className='bg-slate-200 rounded-full select-none cursor-pointer h-8 w-32 flex gap-2 justify-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mr-2'></div>
                        </div>
                    : ""   //is loading
                }

                <hr className='mb-12 mt-4' />
                <div className='grid grid-cols-3 sm:gap-4 gap-1'>
                    {posts?.map((post, index)=>{
                        return (
                        <div key={index} className='w-full aspect-square'>
                            <div className={'w-full h-full bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${post.photo_url}')` }}></div>
                        </div>)
                    })}
                    
                </div>
            </div>

        </>
    )
}

export default ProfileContent