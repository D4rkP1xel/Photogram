import { useRouter } from 'next/router'
import axios from '../../utils/axiosConfig'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Header from '../../components/header'

function PostPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const { post_id } = router.query
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    }, { enabled: !!session })
    const { data: postInfo } = useQuery(["post_info"], async () => { return axios.post("/posts/getPost", { post_id: post_id }).then((res) => res.data.data) }, { enabled: !!post_id })
    const { data: comments } = useQuery(["comments"], async () => { return axios.post("/posts/getComments", { post_id: post_id }).then((res) => res.data.data) }, { enabled: !!post_id })
    function toDate(date) {
        const currentDate = Date.parse(new Date())
        const dateNorm = Date.parse(new Date(date))
        const minutes = (currentDate - dateNorm) / (1000 * 60)
        if (minutes < 1) {
            return "a few moments ago"
        }
        if (minutes < 60) {
            if (minutes < 2)
                return "a min ago"
            return `${parseInt(minutes)} min ago`
        }
        const hours = minutes / 60
        if (hours < 24) {
            if (hours < 2)
                return "an hour ago"
            return `${parseInt(hours)} hours ago`
        }
        const days = hours / 24
        if (days < 31) {
            if (days < 2)
                return "a day ago"
            return `${parseInt(days)} days ago`
        }
        const months = days / 31
        if (months < 12) {
            if (months < 2)
                return "a month ago"
            return `${parseInt(months)} months ago`
        }
        const years = days / 365
        if (years < 2)
            return "a year ago"
        return `${parseInt(years)} years ago`

    }
    return (
        <>
            {console.log(comments)}
            <Header userInfo={userInfo} />
            <div className='lg:w-[1000px] w-full mx-auto mt-8 lg:flex lg:gap-2'>

                <div className='lg:w-full md:w-[600px] w-full mx-auto aspect-square'>
                    {postInfo !== undefined ?
                        <div className={'w-full aspect-square bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${postInfo.photo_url}')` }}></div>
                        :
                        <div className={'w-full h-full bg-slate-300'}></div>
                    }
                </div>

                <div className='w-full md:max-w-[600px] px-6 mx-auto'>
                    <div className='md:max-w-[600px] sm:mx-auto w-full '>
                        <div className='flex gap-4 items-center py-4'>
                            {postInfo !== undefined ?
                                <>
                                    <img className="h-12 rounded-full cursor-pointer" draggable="false" src={postInfo.author_photo_url} alt="" referrerPolicy="no-referrer" />
                                    <div className='font-medium select-none cursor-pointer'>{postInfo.author_username}</div>
                                </>
                                :
                                <>
                                    <div className='h-12 w-12 rounded-full bg-slate-300'></div>
                                    <div className='h-4 w-20 rounded-full bg-slate-300'></div>
                                </>
                            }
                        </div>
                        {postInfo !== undefined ?
                            <div className='select-none text-gray-400 absolute text-[10px] tracking-wide'>
                                <div className='relative bottom-6 left-16'>Posted {toDate(postInfo.date)}</div>
                            </div>
                            : ""}
                    </div>

                    <hr className='md:max-w-[600px] sm:mx-auto w-full ' />

                    {postInfo !== undefined ?
                        postInfo.description !== null ?
                            <div className='mb-4 md:max-w-[600px] sm:mx-auto w-full '>
                                <div className='flex gap-4 items-center pt-4 pb-2'>
                                    <img className="h-12 rounded-full cursor-pointer" draggable="false" src={postInfo.author_photo_url} alt="" referrerPolicy="no-referrer" />
                                    <div className='font-medium select-none cursor-pointer'>{postInfo.author_username}</div>
                                </div>
                                <div className='select-none text-gray-400 absolute text-[10px] tracking-wide'>
                                    <div className='relative bottom-5 left-16'><span>{toDate(postInfo.date)}</span></div>
                                </div>
                                <div className='lg:pl-4 lg:pr-0 sm:px-16 px-4'>{postInfo.description}</div>
                            </div>
                            : ""
                        : ""
                    }
                    
                    {comments !== undefined ?
                        comments?.map((comment, index) => {
                            return (
                            <div key={index} className='mb-4 md:max-w-[600px] sm:mx-auto w-full '>
                                <div className='flex gap-4 items-center py-4'>
                                    <img className="h-12 rounded-full cursor-pointer" draggable="false" src={comment.user_photo_url} alt="image" referrerPolicy="no-referrer" />
                                    <div className='font-medium select-none cursor-pointer'>{comment.user_username}</div>
                                </div>
                                <div className='select-none text-gray-400 absolute text-[10px] tracking-wide'>
                                    <div className='relative bottom-6 left-16'><div className='flex gap-2'><span>{toDate(comment.date)}</span><span className='font-semibold text-gray-500 cursor-pointer'>reply</span></div></div>
                                </div>
                                <div className='lg:pl-4 lg:pr-0 sm:px-16 px-4'>{comment.text}</div>
                            </div>
                            )
                        })
                        :
                        ""
                    }
                    {/* <div className='mb-4 md:max-w-[600px] sm:mx-auto w-full '>
                        <div className='flex gap-4 items-center py-4'>
                            <img className="h-12 rounded-full cursor-pointer" draggable="false" src="https://lh3.googleusercontent.com/a/ALm5wu2UnfIKK-U9TsT1mHP4gT4I7cvnbko3CDXfKHOIGQ=s96-c" alt=" image" referrerPolicy="no-referrer" />
                            <div className='font-medium select-none cursor-pointer'>Alexandre Silva</div>

                        </div>
                        <div className='select-none text-gray-400 absolute text-[10px] tracking-wide'>
                            <div className='relative bottom-6 left-16'><div className='flex gap-2'><span>1min ago</span><span className='font-semibold text-gray-500 cursor-pointer'>reply</span></div></div>
                        </div>
                        <div className='lg:pl-4 lg:pr-0 sm:px-16 px-4'>Great photo!!!! I really liked the background and the colors and the sun and the bitches and cocaine. Great photo!!!! I really liked the background and the colors and the sun and the bitches and cocaine. Great photo!!!! I really liked the background and the colors and the sun and the bitches and cocaine.</div>
                    </div>

                    <div className='mb-4 md:max-w-[600px] sm:mx-auto w-full '>
                        <div className='flex gap-4 items-center py-4'>
                            <img className="h-12 rounded-full cursor-pointer" draggable="false" src="https://lh3.googleusercontent.com/a/ALm5wu2UnfIKK-U9TsT1mHP4gT4I7cvnbko3CDXfKHOIGQ=s96-c" alt=" image" referrerPolicy="no-referrer" />
                            <div className='font-medium select-none cursor-pointer'>Alexandre Silva</div>

                        </div>
                        <div className='select-none text-gray-400 absolute text-[10px] tracking-wide'>
                            <div className='relative bottom-6 left-16'><div className='flex gap-2'><span>1min ago</span><span className='font-semibold text-gray-500 cursor-pointer'>reply</span></div></div>
                        </div>
                        <div className='lg:pl-4 lg:pr-0 sm:px-16 px-4'>Great photo!!!! I really liked the background.</div>
                    </div> */}


                    <div className='h-12'></div>
                </div>
            </div>
        </>
    )
}

export default PostPage