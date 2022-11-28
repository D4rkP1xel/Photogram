import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useRef, useCallback, useEffect } from 'react'
import Header from '../components/header'
import HeaderNotLogged from '../components/headerNotLogged'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import axios from '../utils/axiosConfig'
import { IoMdHeartEmpty, IoMdHeart, IoMdClose } from 'react-icons/io'
import { BsChat } from 'react-icons/bs'
import toDate from '../utils/toDate'
import toNumLikes from '../utils/toNumLikes'
import {ScaleLoader} from 'react-spinners'

function Home() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { data: session, status: sessionStatus } = useSession()

    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    }, { enabled: !!session })

    const { data: posts, refetch, isFetching } = useQuery(['timeline_posts'], () => { return getInfinitePosts(last_post_id) },
        { enabled: !!session && !!userInfo, refetchOnWindowFocus: false })

    const { data: comments, refetch: refetchComments, remove: removeComments, isFetching: isCommentsFetching } = useQuery(["comments"], async () => { return isShowPost != null ? getInfiniteComments(isShowPost.id ,last_comment_id) : null }, { enabled: !!userInfo })
   
    const [hasNextPage, setHasNextPage] = useState(false)
    const [last_comment_id, setLast_comment_id] = useState(null)
    const [last_post_id, setLast_post_id] = useState(null)
    const [isShowPost, setShowPost] = useState(null)
    const [hasCommentsNextPage, setHasCommentsNextPage] = useState(false)
    const commentTextAreaRef = useRef()
    const [commentText, addCommentText] = useState("")

    useEffect(() => {

        if (isShowPost != null)
            refetchComments()

    }, [isShowPost])

    async function getInfiniteComments(post_id_param, last_comment_id_param) {
        try {
            let res = await axios.post("/posts/getComments", { post_id: post_id_param , last_comment_id: last_comment_id_param })
            let commentsRead = res.data.comments
            if (commentsRead.length > 0) {
                setLast_comment_id(commentsRead[commentsRead.length - 1].id)
                //console.log(last_post_id_param +" new last_post_id: " + postsRead[postsRead.length-1].id)
                if (commentsRead.length < 10)
                    setHasCommentsNextPage(false)
                else
                    setHasCommentsNextPage(true)
            }
            else {
                console.log("no new posts")
                setHasCommentsNextPage(false)
            }

            let prevArray = queryClient.getQueryData(["comments"])
            if (prevArray == null)
                return commentsRead
            return [...prevArray, ...commentsRead]
        }
        catch (err) {
            console.log(err)
            return null
        }
    }

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
    async function getInfinitePosts(last_post_id_param) {
        try {
            let res = await axios.post("/posts/getPosts", { user_id: userInfo.id, last_post_id: last_post_id_param })
            let postsRead = res.data.posts
            if (postsRead.length > 0) {
                setLast_post_id(postsRead[postsRead.length - 1].id)
                //console.log(last_post_id_param +" new last_post_id: " + postsRead[postsRead.length-1].id)
                if (postsRead.length < 10)
                    setHasNextPage(false)
                else
                    setHasNextPage(true)

            }
            else {
                console.log("no new posts")
                setHasNextPage(false)
            }


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


    async function changeLike({ setLike, postIndex: index }) {

        const postInfo = queryClient.getQueryData(["timeline_posts"])[index]
        if (setLike === false) {
            await axios.post("/posts/removeLike", { post_id: postInfo.id, user_id: userInfo.id })
            return false
        }

        if (setLike === true) {
            await axios.post("/posts/addLike", { post_id: postInfo.id, user_id: userInfo.id })
            return true
        }
        return null
    }

    const { mutate } = useMutation((vars) => changeLike(vars), {
        onMutate: ({ setLike, postIndex: index }) => {

            // queryClient.cancelQueries({ queryKey: ["timeline_posts"] }) => this was breaking the mutation function easily
            let currentPostInfo = queryClient.getQueryData(["timeline_posts"])[index]
            if (setLike === true) {
                currentPostInfo.num_likes++
                currentPostInfo.is_liked = 1
                if (isShowPost !== null) {
                    isShowPost.num_likes++
                    isShowPost.is_liked = 1
                }
            }
            if (setLike === false) {
                currentPostInfo.num_likes--
                currentPostInfo.is_liked = 0
                if (isShowPost !== null) {
                    isShowPost.num_likes--
                    isShowPost.is_liked = 0
                }
            }
        }//maybe do the onError
    })

    const intObserver = useRef()
    const lastPostRef = useCallback(post => {
        if (isFetching) return

        if (intObserver.current) intObserver.current.disconnect()

        intObserver.current = new IntersectionObserver(posts => {
            if (posts[0].isIntersecting && hasNextPage) {
                console.log('We are near the last post!')
                refetch()
            }
        })

        if (post) intObserver.current.observe(post)
    }, [isFetching, refetch, hasNextPage])

    function postComment() {
        if (userInfo == null)
            return

        if (commentText.length > 400 || commentText.length === 0) {
            alert("Comment length not permitted")
            return
        }
        mutateNewComment({newComment: { date: new Date(), user_id: userInfo.id, text: commentText, user_photo_url: userInfo.photo_url, user_username: userInfo.username }, postIndex: isShowPost.index} )

    }

    async function addCommentMutation() {
        if (isShowPost != null && userInfo != null)
            return await axios.post("/posts/addComment", { parentId: isShowPost.id, isFromPost: true, comment: commentText, user_id: userInfo.id })
    }

    const { mutate: mutateNewComment } = useMutation(addCommentMutation, {
        onMutate: ({newComment, postIndex: index}) => {

            queryClient.cancelQueries({ queryKey: ["comments"] })
            let currentPostInfo = queryClient.getQueryData(["timeline_posts"])[index]
            queryClient.setQueryData(["comments"], (prev) => { return [newComment, ...prev] })
            addCommentText("")
            currentPostInfo.num_comments++
            if(isShowPost != null) //not needed yet but did it just in case I need it later
            {
                isShowPost.num_comments++
            }
        }//maybe do the onError

    })

    const intObserverComment = useRef()
    const lastCommentRef = useCallback(comment => {
        if (isCommentsFetching) return

        if (intObserverComment.current) intObserverComment.current.disconnect()

        intObserverComment.current = new IntersectionObserver(comments => {
            if (comments[0].isIntersecting && hasCommentsNextPage) {
                //console.log('We are near the last comment!')
                refetchComments()
            }
        })

        if (comment) intObserverComment.current.observe(comment)
    }, [isCommentsFetching, refetchComments, hasCommentsNextPage])

    function resetComments()
    {
        setShowPost(null)
        addCommentText("")
        removeComments()
        setHasCommentsNextPage(false) 
        lastCommentRef(null)
        setLast_comment_id(null)
    }
    function showPost() {
        const html = document.querySelector('html');
        isShowPost !== null && html ? html.style.overflow = 'hidden' : html.style.overflow = 'auto'

        return isShowPost !== null ?
            (
                <>

                    <div className='z-50 fixed top-0 left-0 w-full pointer-events-none'>
                        <div className=' lg:w-[1000px] w-full lg:max-h-[600px] mx-auto mt-24 lg:flex lg:gap-2 bg-white pointer-events-auto pb-4'>
                            <div className='lg:w-full md:w-[600px] w-full mx-auto aspect-square'>
                                <div className={'w-full aspect-square bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${isShowPost.photo_url}')` }}></div>
                                <div className='flex px-4 pt-3'>
                                    {isShowPost.is_liked === 1 ?
                                        <div onClick={() => mutate({ setLike: false, postIndex: isShowPost.index })} className='h-12 w-14 px-2 pb-2 cursor-pointer'>
                                            <IoMdHeart className='h-full w-auto' />
                                        </div>
                                        :
                                        <div onClick={() => mutate({ setLike: true, postIndex: isShowPost.index })} className='h-12 w-14 px-2 pb-2 cursor-pointer'>
                                            <IoMdHeartEmpty className='h-full w-auto' />
                                        </div>}
                                </div>
                                <div className='px-6 font-semibold select-none mb-1'>{toNumLikes(isShowPost.num_likes)}</div>
                            </div>
                            <div className='w-full md:max-w-[600px] px-6 mx-auto max-h-full'>
                                <div className='md:max-w-[600px] sm:mx-auto w-full'>
                                    <div className='flex gap-4 pt-4'>
                                        <div className='w-full'>
                                            <div className='flex gap-3'>
                                                <img onClick={() => router.push("/user/" + isShowPost.user_id)} className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={isShowPost.user_photo_url} alt="" referrerPolicy="no-referrer" />
                                                <div className='gap-3 py-2'>
                                                    <span onClick={() => router.push("/user/" + isShowPost.user_id)} className='font-medium text-sm cursor-pointer h-fit mr-2'>{isShowPost.username}</span>
                                                    <span className='w-fit break-words whitespace-pre-wrap'>{isShowPost.description}</span>
                                                    <div className='select-none text-gray-400 text-[10px] tracking-wide mt-1'>
                                                        <div className='flex gap-2'>
                                                            <span>{toDate(isShowPost.date)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr className='md:max-w-[600px] sm:mx-auto w-full my-2' />
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
                                {comments !== undefined ?
                                    <div className='max-h-96 overflow-auto'>
                                        {comments?.map((comment, index) => {
                                            return (
                                                <div key={index} ref={index === comments.length - 1 ? lastCommentRef : null} className='md:max-w-[600px] sm:mx-auto w-full '>
                                                    <div className='flex gap-3 py-2'>
                                                        <div className='w-full'>
                                                            <div className='flex gap-3'>
                                                                <img onClick={() => router.push("/user/" + comment.user_id)} className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={comment.user_photo_url} alt="" referrerPolicy="no-referrer" />
                                                                <div className='gap-3 py-2'>
                                                                    <span onClick={() => router.push("/user/" + comment.user_id)} className='font-medium text-sm cursor-pointer h-fit mr-2'>{comment.user_username}</span>
                                                                    <span className='w-fit break-words whitespace-pre-wrap'>{comment.text}</span>
                                                                    <div className='select-none text-gray-400 text-[10px] tracking-wide mt-1'>
                                                                        <div className='flex gap-2'>
                                                                            <span>{toDate(comment.date)}</span>
                                                                            <span className='font-semibold text-gray-500 cursor-pointer'>reply</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {isCommentsFetching ? <ScaleLoader className='mx-auto w-fit scale-loader scale-75 mt-4' /> : null }
                                    </div>
                                    :
                                    ""
                                }
                            </div>
                        </div>
                    </div>
                    <div className='fixed w-full top-0 left-0 z-50'>
                        <div className='flex w-full'>
                            <div onClick={() => resetComments() } className='h-16 w-16 ml-auto mt-2 mr-2 p-[12px] cursor-pointer text-slate-100'><IoMdClose className='h-full w-auto' /></div>
                        </div>
                    </div>
                    <div onClick={() => resetComments() } className='fixed top-0 left-0 w-full h-screen bg-black opacity-50 z-40'></div>

                </>

            )
            :
            ""
    }
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
                                        <div key={postInfo.id} ref={index === posts.length - 1 ? lastPostRef : null} className='w-full my-10'>
                                            <div onClick={() => router.push("/user/" + postInfo.user_id)} className='bg-slate-200 rounded-t-2xl p-4 items-center flex w-full'>
                                                <img className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={postInfo.user_photo_url} alt="" referrerPolicy="no-referrer" />
                                                <div className='mx-4 font-semibold cursor-pointer select-none'>{postInfo.username}</div>
                                            </div>
                                            <div className={'w-full aspect-square bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${postInfo.photo_url}')` }}></div>
                                            <div className='h-14 bg-slate-200 pt-4 flex px-2'>
                                                {postInfo.is_liked === 1 ?
                                                    <div className='h-10 w-12 px-2 pb-2 cursor-pointer' onClick={() => mutate({ setLike: false, postIndex: index })} >
                                                        <IoMdHeart className='h-full w-auto' />
                                                    </div>
                                                    :
                                                    <div className='h-10 w-12 px-2 pb-2 cursor-pointer' onClick={() => mutate({ setLike: true, postIndex: index })} >
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
                                                            <span onClick={() => router.push("/user/" + postInfo.user_id)} className='font-medium text-sm cursor-pointer h-fit mr-2'>{postInfo.username}</span>
                                                            <span className='w-fit break-words whitespace-pre-wrap'>{postInfo.description}</span>
                                                        </div>
                                                    </div>
                                                </> : ""}
                                                {postInfo.num_comments > 0 ? <div onClick={() => setShowPost({ ...postInfo, index })} className="text-sm text-slate-500 select-none cursor-pointer">show comments ({postInfo.num_comments})</div> : ""}

                                                <div className="text-xs text-slate-400 mt-2">{toDate(postInfo.date)}</div>
                                            </div>
                                        </div>
                                    )
                                })
                                : ""}
                                {isFetching ? <ScaleLoader className='mx-auto w-fit scale-loader scale-75 mt-4' /> : null }
                            
                        </div>
                        
                        {posts != null ? showPost() : ""}

                    </>
                    :
                    sessionStatus === "unauthorized" ?
                        <HeaderNotLogged /> 
                    :
                        <Header userInfo={userInfo} />
            }
        </>
    )
}

export default Home