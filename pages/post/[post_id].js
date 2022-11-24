import { useRouter } from 'next/router'
import axios from '../../utils/axiosConfig'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Header from '../../components/header'
import { useRef, useState } from 'react'
import { IoMdHeartEmpty, IoMdHeart } from 'react-icons/io'
import toDate from '../../utils/toDate'

function PostPage() {
    const { data: session } = useSession()
    const queryClient = useQueryClient()
    const router = useRouter()
    const { post_id } = router.query
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    }, { enabled: !!session })
    const { data: postInfo } = useQuery(["post_info"], async () => { return axios.post("/posts/getPost", { post_id: post_id }).then((res) => res.data.data) }, { enabled: !!post_id })
    const { data: comments } = useQuery(["comments"], async () => { return axios.post("/posts/getComments", { post_id: post_id }).then((res) => res.data.data) }, { enabled: !!post_id })
    const { data: isLike } = useQuery(["is_like"], async () => { return axios.post("/posts/getLike", { post_id: post_id, user_id: userInfo.id }).then((res) => res.data.is_like) }, { enabled: !!postInfo && !!userInfo })
    const commentTextAreaRef = useRef()
    const [commentText, addCommentText] = useState("")


    function addCommentOnChange(e) {

        addCommentText(e.target.value)
        e.target.style.height = "24px"
        e.target.style.height = `${e.target.scrollHeight}px`
    }


    function commentLenght() {
        const maxLength = 400
        if (commentText.length === 0) {
            return ""
        }
        if (commentText.length > maxLength) {
            return (<span className='text-red-500'>{commentText.length}/{maxLength}</span>)
        }
        return (<span>{commentText.length}/{maxLength}</span>)

    }

    function postComment() {
        if (commentText.length > 400 || commentText.length === 0) {
            alert("Comment length not permitted")
            return
        }
        mutate({ date: new Date(), user_id: userInfo?.id, text: commentText, user_photo_url: userInfo?.photo_url, user_username: userInfo?.username })

    }
    async function addCommentMutation() {
        if (postInfo != null && userInfo != null)
            return await axios.post("/posts/addComment", { parentId: postInfo?.id, isFromPost: true, comment: commentText, user_id: userInfo?.id })
    }

    const { mutate } = useMutation(addCommentMutation, {
        onMutate: (newComment) => {

            queryClient.cancelQueries({ queryKey: ["comments"] })
            queryClient.setQueryData(["comments"], (prev) => { return [newComment, ...prev] })
            addCommentText("")
        }//maybe do the onError

    })

    async function changeLike() {
        if (isLike === true) {
            await axios.post("/posts/removeLike", { post_id: post_id, user_id: userInfo.id })
            return false
        }

        if (isLike === false) {
            await axios.post("/posts/addLike", { post_id: post_id, user_id: userInfo.id })
            return true
        }
        return null
    }
    const { mutate: mutateLike } = useMutation(changeLike, {
        onMutate: (newLike) => {

            queryClient.cancelQueries({ queryKey: ["is_like"] })
            queryClient.setQueryData(["is_like"], newLike)
            let currentPostInfo = postInfo
            if (newLike === true)
                currentPostInfo.num_likes++
            if (newLike === false)
                currentPostInfo.num_likes--
        }//maybe do the onError
    })

    function numLikes(likes) {
        if (likes === 1) {
            return "1 like"
        }
        return likes + " likes"
    }
    return (
        <>
            <Header userInfo={userInfo} />
            <div className='lg:w-[1000px] w-full lg:max-h-[580px] mx-auto mt-8 lg:flex lg:gap-2'>

                <div className='lg:w-full md:w-[600px] w-full mx-auto aspect-square'>
                    {postInfo !== undefined ?
                        <>
                            <div className={'w-full aspect-square bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${postInfo.photo_url}')` }}></div>
                            <div className='flex px-4 pt-3'>
                                {
                                    isLike !== undefined ?
                                        isLike === true ?
                                            <div onClick={() => mutateLike(false)} className='h-12 w-14 px-2 pb-2 cursor-pointer'>
                                                <IoMdHeart className='h-full w-auto' />
                                            </div>
                                            :
                                            <div onClick={() => mutateLike(true)} className='h-12 w-14 px-2 pb-2 cursor-pointer'>
                                                <IoMdHeartEmpty className='h-full w-auto' />
                                            </div>
                                        :
                                        <div className='h-10 w-10 ml-2 mb-2 px-2 pb-2 bg-slate-300 rounded-full'></div>
                                }
                            </div>
                            <div className='px-6 font-semibold select-none mb-1'>{numLikes(postInfo.num_likes)}</div>
                        </>
                        :
                        <>
                            <div className={'w-full h-full bg-slate-300'}></div>
                            <div className='flex px-4 pt-3'>
                                <div className='h-10 w-10 ml-2 mb-2 px-2 pb-2 bg-slate-300 rounded-full'></div>
                            </div>
                            <div className='ml-6 h-4 w-14 bg-slate-300 rounded-full'></div>
                        </>

                    }
                </div>

                <div className='w-full md:max-w-[600px] px-6 mx-auto max-h-full'>
                    <div className='md:max-w-[600px] sm:mx-auto w-full'>
                        <div className='flex gap-4 pt-4'>
                            {postInfo !== undefined ?
                                <>
                                    <div className='flex items-center gap-3 flex-shrink-0 h-fit'>
                                        <img onClick={() => router.push("/user/" + postInfo.author_id)} className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={postInfo.author_photo_url} alt="" referrerPolicy="no-referrer" />
                                        <div>
                                            <div onClick={() => router.push("/user/" + postInfo.author_id)} className='font-medium text-sm select-none cursor-pointer'>{postInfo.author_username}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='w-fit break-words mt-2 whitespace-pre-wrap'>{postInfo.description}</div>
                                        <div className='select-none text-gray-400 text-[10px] tracking-wide mt-1'>
                                            <div className='flex gap-2'>
                                                <span>{toDate(postInfo.date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                </>
                                :
                                <>
                                    <div className='flex items-center gap-4 flex-shrink-0 h-fit'>
                                        <div className='h-12 w-12 rounded-full bg-slate-300'></div>
                                        <div className='h-4 w-20 rounded-full bg-slate-300'></div>
                                    </div>
                                </>
                            }
                        </div>


                    </div>

                    {postInfo !== undefined ?
                        <hr className='md:max-w-[600px] sm:mx-auto w-full my-2' />
                        :
                        ""
                    }
                    {postInfo !== undefined ?
                        <div className='flex gap-3 py-2'>
                            <div className='flex items-center gap-3 flex-shrink-0 h-fit'>
                                <img className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={userInfo?.photo_url} alt="" referrerPolicy="no-referrer" />
                                <div>
                                    <div className='font-medium text-sm cursor-pointer'>{userInfo?.username}</div>
                                </div>
                            </div>
                            <textarea ref={commentTextAreaRef} onChange={addCommentOnChange} value={commentText} className='overflow-hidden border-b border-slate-400 w-full h-[28px] pb-1 mt-2'></textarea>
                            <div className='font-semibold text-gray-500  mt-2 mb-auto select-none'>
                                {commentText.length <= 400 ?
                                    <div onClick={() => postComment()} className='cursor-pointer'>Post</div>
                                    :
                                    <div className='text-slate-300'>Post</div>
                                }

                                <div className='absolute text-[12px] font-thin'>{commentLenght()}</div>

                            </div>

                        </div>
                        :
                        ""

                    }
                    {comments !== undefined ?
                            <div className='max-h-96 overflow-auto'>
                            {comments?.map((comment, index) => {
                                return (
                                    <div key={index} className='md:max-w-[600px] sm:mx-auto w-full '>
                                        <div className='flex gap-3 py-2'>
                                            <div className='flex items-center gap-3 flex-shrink-0 h-fit'>
                                                <img onClick={() => router.push("/user/" + comment.user_id)} className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={comment.user_photo_url} alt="" referrerPolicy="no-referrer" />
                                                <div>
                                                    <div onClick={() => router.push("/user/" + comment.user_id)} className='font-medium text-sm cursor-pointer'>{comment.user_username}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className='w-fit break-words mt-2 whitespace-pre-wrap'>{comment.text}</div>
                                                <div className='select-none text-gray-400 text-[10px] tracking-wide mt-1'>
                                                    <div className='flex gap-2'>
                                                        <span>{toDate(comment.date)}</span>
                                                        <span className='font-semibold text-gray-500 cursor-pointer'>reply</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        :
                        ""
                    }
                    <div className='h-12'></div>
                </div>
            </div>
        </>
    )
}

export default PostPage