import { BsFillCameraFill, BsFillPersonPlusFill } from 'react-icons/bs'
import { useRouter } from 'next/router'
import axios from '../../utils/axiosConfig'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, useCallback } from 'react'
import { IoMdHeartEmpty, IoMdHeart, IoMdClose } from 'react-icons/io'
import toDate from '../../utils/toDate'
import toNumLikes from '../../utils/toNumLikes'
import { ScaleLoader } from 'react-spinners'

function ProfileContent({ profileInfo, userInfo, session }) {

    const queryClient = useQueryClient()
    const router = useRouter()
    const followRef = useRef()
    const [hasNextPage, setHasNextPage] = useState(false)
    const [last_post_id, setLast_post_id] = useState(null)
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), [])

    const { data: isFollowing } = useQuery(["isFollowing"], async () => { return axios.post("/user/getFollowing", { follower: userInfo.id, following: profileInfo.id }).then((res) => res.data.follows) }, { enabled: !!profileInfo && !!userInfo && profileInfo.id !== userInfo.id })
    const { data: posts, refetch, isFetching } = useQuery(['profile_posts'], () => { return getInfinitePosts(last_post_id) },
        { enabled: !!session && !!userInfo, refetchOnWindowFocus: false })
    const { data: comments, refetch: refetchComments, remove: removeComments, isFetching: isCommentsFetching } = useQuery(["comments"], async () => { return isShowPost != null ? getInfiniteComments(isShowPost.id, last_comment_id) : null }, { enabled: !!userInfo, refetchOnWindowFocus: false })

    async function getInfinitePosts(last_post_id_param) {
        try {
            let res = await axios.post("/posts/getPostsProfilePage", { user_id: userInfo.id, last_post_id: last_post_id_param })
            let postsRead = res.data.posts
            if (postsRead.length > 0) {
                setLast_post_id(postsRead[postsRead.length - 1].id)
                //console.log(last_post_id_param +" new last_post_id: " + postsRead[postsRead.length-1].id)
                if (postsRead.length < 9)
                    setHasNextPage(false)
                else
                    setHasNextPage(true)

            }
            else {
                //console.log("no new posts")
                setHasNextPage(false)
            }


            let prevArray = queryClient.getQueryData(["profile_posts"])
            if (prevArray == null)
                return postsRead
            return [...prevArray, ...postsRead]
        }
        catch (err) {
            console.log(err)
            return null
        }
    }
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


    async function changeFollowing() {

        if (isFollowing === true)
            return await axios.post("/user/removeFollowing", { follower: userInfo.id, following: profileInfo.id }).then((res) => res.data.follows)
        if (isFollowing === false)
            return await axios.post("/user/addFollowing", { follower: userInfo.id, following: profileInfo.id }).then((res) => res.data.follows)
        return null
    }

    async function changeLike({ setLike, postIndex: index }) {

        const postInfo = queryClient.getQueryData(["profile_posts"])[index]
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


    const [last_comment_id, setLast_comment_id] = useState(null)
    const [isShowPost, setShowPost] = useState(null)
    const [hasCommentsNextPage, setHasCommentsNextPage] = useState(false)
    const commentTextAreaRef = useRef()
    const [commentText, addCommentText] = useState("")
    const [commentToReplyIndex, setCommentToReplyIndex] = useState(null)

    useEffect(() => {
        if (isShowPost != null)
            refetchComments()

    }, [isShowPost])

    async function getReplies(comment_index) {
        comments[comment_index].show_replies = true
        if (comments[comment_index].replies === null) {
            comments[comment_index].is_fetching_replies = true
            forceUpdate()
            comments[comment_index].replies = (await axios.post("/posts/getCommentReplies", { comment_id: comments[comment_index].id, last_reply_id: null })).data.comments
            comments[comment_index].is_fetching_replies = false
        }
        else if (comments[comment_index].replies.length < comments[comment_index].num_replies) //more replies to fetch
        {
            comments[comment_index].is_fetching_replies = true
            forceUpdate()
            comments[comment_index].replies = [...comments[comment_index].replies, ...(await axios.post("/posts/getCommentReplies", { comment_id: comments[comment_index].id, last_reply_id: comments[comment_index].replies[comments[comment_index].replies.length - 1].id })).data.comments]
            comments[comment_index].is_fetching_replies = false
        }
        forceUpdate()
    }

    async function getInfiniteComments(post_id_param, last_comment_id_param) {
        try {
            let res = await axios.post("/posts/getComments", { post_id: post_id_param, last_comment_id: last_comment_id_param })
            let commentsRead = res.data.comments
            for (let com = 0; com < commentsRead.length; com++) {
                commentsRead[com]["show_replies"] = false
                commentsRead[com]["replies"] = null
                commentsRead[com]["is_fetching_replies"] = false
            }
            if (commentsRead.length > 0) {
                setLast_comment_id(commentsRead[commentsRead.length - 1].id)
                //console.log(last_post_id_param +" new last_post_id: " + postsRead[postsRead.length-1].id)
                if (commentsRead.length < 10)
                    setHasCommentsNextPage(false)
                else
                    setHasCommentsNextPage(true)
            }
            else {
                console.log("no new comments")
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
    const { mutate: mutateLike } = useMutation((vars) => changeLike(vars), {
        onMutate: ({ setLike, postIndex: index }) => {

            // queryClient.cancelQueries({ queryKey: ["profile_posts"] }) => this was breaking the mutation function easily
            let currentPostInfo = queryClient.getQueryData(["profile_posts"])[index]
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

    function postComment() {
        if (userInfo == null)
            return

        if (commentText.length > 400 || commentText.length === 0) {
            alert("Comment length not permitted")
            return
        }
        mutateNewComment({ newComment: { date: new Date(), user_id: userInfo.id, text: commentText, user_photo_url: userInfo.photo_url, user_username: userInfo.username }, index: commentToReplyIndex === null ? isShowPost.index : commentToReplyIndex, isFromPost: commentToReplyIndex === null ? true : false })

    }

    async function addCommentMutation() {
        if (isShowPost != null && userInfo != null)
            return commentToReplyIndex !== null ? await axios.post("/posts/addComment", { parentId: comments[commentToReplyIndex].id, isFromPost: false, comment: commentText, user_id: userInfo.id })
                : await axios.post("/posts/addComment", { parentId: isShowPost.id, isFromPost: true, comment: commentText, user_id: userInfo.id })
    }

    const { mutate: mutateNewComment } = useMutation(addCommentMutation, {
        onMutate: ({ newComment, index, isFromPost }) => {
            if (isFromPost === true) {
                queryClient.cancelQueries({ queryKey: ["comments"] })
                let currentPostInfo = queryClient.getQueryData(["profile_posts"])[index]
                queryClient.setQueryData(["comments"], (prev) => { return [newComment, ...prev] })
                addCommentText("")
                currentPostInfo.num_comments++
                if (isShowPost != null) //not needed yet but did it just in case I need it later
                {
                    isShowPost.num_comments++
                }
            }
            else {
                queryClient.cancelQueries({ queryKey: ["comments"] })
                let currentCommentInfo = queryClient.getQueryData(["comments"])[index]
                addCommentText("")
                if (currentCommentInfo.replies !== null) {
                    currentCommentInfo.replies.unshift(newComment)
                }
                currentCommentInfo.num_replies++
                setCommentToReplyIndex(null)
            }
        }//maybe do the onError

    })


    const { mutate: mutateFollowing } = useMutation(changeFollowing, {
        onMutate: (newIsFollowing) => {

            queryClient.cancelQueries({ queryKey: ["isFollowing"] })
            queryClient.setQueryData(["isFollowing"], newIsFollowing)
            let currentProfileData = profileInfo
            if (newIsFollowing === true)
                currentProfileData.followers++
            if (newIsFollowing === false)
                currentProfileData.followers--
            queryClient.cancelQueries({ queryKey: ["profile_info"] })
            queryClient.setQueryData(["profile_info"], currentProfileData)
        }//maybe do the onError
    })

    useEffect(() => {
        if (followRef && isFollowing === true)
            followRef.current.innerText = "Following"
    }, [isFollowing, followRef])

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

    function resetComments() {
        setShowPost(null)
        addCommentText("")
        removeComments()
        setHasCommentsNextPage(false)
        lastCommentRef(null)
        setLast_comment_id(null)
        setCommentToReplyIndex(null)
    }

    function showPost() {
        const html = document.querySelector('html');
        isShowPost !== null && html ? html.style.overflow = 'hidden' : html.style.overflow = 'auto'

        return isShowPost !== null ?
            (
                <>

                    <div className='z-50 fixed top-0 left-0 w-screen h-screen overflow-auto'>
                        <div className=' lg:w-[1000px] w-full md:w-[600px] lg:max-h-[600px] mx-auto mt-24 lg:flex lg:gap-2 bg-white pointer-events-auto pb-4'>
                            <div className='lg:w-full md:w-[600px] w-full mx-auto aspect-square'>
                                <div className={'w-full aspect-square bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${isShowPost.photo_url}')` }}></div>
                                <div className='flex px-4 pt-3'>
                                    {isShowPost.is_liked === 1 ?
                                        <div onClick={() => mutateLike({ setLike: false, postIndex: isShowPost.index })} className='h-12 w-14 px-2 pb-2 cursor-pointer'>
                                            <IoMdHeart className='h-full w-auto' />
                                        </div>
                                        :
                                        <div onClick={() => mutateLike({ setLike: true, postIndex: isShowPost.index })} className='h-12 w-14 px-2 pb-2 cursor-pointer'>
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
                                <div className='flex gap-3 pb-2 py-4'>
                                    <div className='flex items-center gap-3 flex-shrink-0 h-fit'>
                                        <img className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={userInfo?.photo_url} alt="" referrerPolicy="no-referrer" />
                                        <div>
                                            <div className='font-medium text-sm cursor-pointer'>{userInfo?.username}</div>
                                        </div>
                                    </div>
                                    {commentToReplyIndex !== null ? <div className='relative'><div className='w-60 absolute font-thin text-gray-500 left-3 bottom-9 text-sm select-none'>replying to: <span className='font-normal text-black'>{comments[commentToReplyIndex].user_username}</span></div> </div> : null}
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
                                {comments != null ?
                                    <div className='max-h-96 overflow-auto'>
                                        {comments.map((comment, index) => {
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
                                                                            <span onClick={() => setCommentToReplyIndex(index)} className='font-semibold text-gray-500 cursor-pointer'>reply</span>
                                                                        </div>
                                                                        {comment.num_replies > 0 ? comment.show_replies === false ?
                                                                            <div onClick={() => getReplies(index)} className='mt-2 font-semibold text-gray-500 cursor-pointer'>show replies ({comment.num_replies})</div>
                                                                            :
                                                                            <>
                                                                                <div onClick={() => { comments[index].show_replies = false; forceUpdate() }} className='mt-2 font-semibold text-gray-500 cursor-pointer'>close replies</div>

                                                                                {comment.replies != null ? comment.replies.map((reply, index) => {
                                                                                    return (
                                                                                        <div key={index} className='w-full '>
                                                                                            <div className='flex gap-3 py-2'>
                                                                                                <div className='w-full'>
                                                                                                    <div className='flex gap-3'>
                                                                                                        <img onClick={() => router.push("/user/" + reply.user_id)} className="h-10 rounded-full cursor-pointer select-none" draggable="false" src={reply.user_photo_url} alt="" referrerPolicy="no-referrer" />
                                                                                                        <div className='gap-3 py-2'>
                                                                                                            <span onClick={() => router.push("/user/" + reply.user_id)} className='font-medium text-sm cursor-pointer h-fit mr-2 text-black'>{reply.user_username}</span>
                                                                                                            <span className='w-fit break-words whitespace-pre-wrap text-black font-normal text-base'>{reply.text}</span>
                                                                                                            <div className='select-none text-gray-400 text-[10px] tracking-wide mt-1'>
                                                                                                                <span>{toDate(reply.date)}</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                }) : null}
                                                                                {comments[index].is_fetching_replies === true ? <ScaleLoader className='w-fit scale-loader scale-75 mt-4' /> : null}
                                                                                {comments[index].is_fetching_replies === false && comments[index].num_replies > comments[index].replies.length ?
                                                                                    <div onClick={() => getReplies(index)} className='mt-2 font-semibold text-gray-500 cursor-pointer'>show more</div>
                                                                                    : null}
                                                                            </>
                                                                            : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {isCommentsFetching ? <ScaleLoader className='mx-auto w-fit scale-loader scale-75 mt-4' /> : null}
                                    </div>
                                    :
                                    ""
                                }
                            </div>
                        </div>
                    </div>
                    <div className='fixed w-full top-0 left-0 z-50'>
                        <div className='flex w-full'>
                            <div onClick={() => resetComments()} className='h-16 w-16 ml-auto mt-2 mr-2 p-[12px] cursor-pointer text-slate-100'><IoMdClose className='h-full w-auto' /></div>
                        </div>
                    </div>
                    <div onClick={() => resetComments()} className='fixed top-0 left-0 w-full h-screen bg-black opacity-50 z-40'></div>

                </>

            )
            :
            ""
    }

    return (
        <>

            <div className='sm:w-[600px] w-full mx-auto mt-8'>
                <div className='flex sm:w-10/12 w-full mx-auto sm:justify-start justify-around'>
                    <img className='rounded-full sm:h-40 h-32' draggable="false" src={profileInfo?.photo_url} alt={profileInfo?.username + " photo"} referrerPolicy="no-referrer" />
                    <div className='flex sm:ml-auto flex-col my-auto'>
                        <div className='font-bold text-xl'>{profileInfo?.username}</div>
                        <div className='mt-1'>
                            <span className='font-semibold'>{profileInfo?.num_posts}</span><span className='font-light'> posts <span>&nbsp;</span></span>
                            <span className='font-semibold'>{profileInfo?.followers}</span><span className='font-light'> followers <span>&nbsp;</span></span>
                            <span className='font-semibold'>{profileInfo?.following}</span><span className='font-light'> following</span>
                        </div>
                        <div className='mt-4 whitespace-pre-wrap'>{profileInfo !== undefined ? profileInfo.description : ""}</div>
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
                        queryClient.getQueryData(['isFollowing']) !== undefined ?
                            <div className='w-full flex flex-row-reverse'> {/*follow button*/}
                                {queryClient.getQueryData(['isFollowing']) === true ?
                                    <div onMouseEnter={() => followRef.current.innerText = "Unfollow"} onMouseLeave={() => followRef.current.innerText = "Following"} onClick={() => mutateFollowing(false)} className='bg-slate-200 rounded-full select-none cursor-pointer h-8 w-32 flex gap-2 justify-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mr-2 hover:border-red-600 hover:text-red-600 hover:border'>
                                        <div className='my-auto' ref={followRef}></div>
                                    </div>
                                    :
                                    <div onClick={() => mutateFollowing(true)} className='bg-slate-200 rounded-full select-none cursor-pointer h-8 w-32 flex gap-2 justify-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mr-2'>
                                        <BsFillPersonPlusFill className='h-4 w-4 my-auto' />
                                        <div className='my-auto'>Follow</div>
                                    </div>
                                }
                            </div>
                            :
                            <div className='w-full flex flex-row-reverse'>
                                <div className='bg-slate-200 rounded-full select-none cursor-pointer h-8 w-32 flex gap-2 justify-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mr-2'>
                                </div>
                            </div>
                    : ""   //is loading
                }

                <hr className='mb-12 mt-4' />
                <div className='grid grid-cols-3 sm:gap-4 gap-1'>
                    {posts != null ? posts.map((postInfo, index) => {
                        return (
                            <div key={index} ref={index === posts.length - 1 ? lastPostRef : null} onClick={() => setShowPost({ ...postInfo, index })} className='w-full aspect-square cursor-pointer'>
                                <div className={'w-full h-full bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${postInfo.photo_url}')` }}></div>
                            </div>)
                    })
                        :
                        ""}

                </div>
                <div className='w-full h-8'></div>
            </div>
            {posts != null ? showPost() : ""}
        </>
    )
}

export default ProfileContent