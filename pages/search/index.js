import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, useRef, useCallback } from "react"
import Header from "../../components/header"
import checkSessionProvider from '../../utils/checkSessionProvider'
import axios from '../../utils/axiosConfig'
import { IoMdHeartEmpty, IoMdHeart, IoMdClose } from 'react-icons/io'
import { BsChat } from 'react-icons/bs'
import toDate from '../../utils/toDate'
import toNumLikes from '../../utils/toNumLikes'
import { ScaleLoader } from 'react-spinners'
import HeaderNotLogged from "../../components/headerNotLogged"

export default function SearchPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status: sessionStatus } = useSession()
  const { data: userInfo } = useQuery(["user_info"], async () => {
    return axios.post("/user/getUserInfo", {
      email: session.user.email,
      provider: session.provider
    }).then((res) => checkSessionProvider(res.data.data, session.provider, router))
  }, { enabled: !!session, refetchOnWindowFocus: false, keepPreviousData: true })
  const { data: posts, isFetching, refetch } = useQuery(["search_posts"], async () => { return getInfinitePosts(last_post_id) }, { enabled: !!userInfo && !!router.query.q, refetchOnWindowFocus: false })
  const { data: comments, refetch: refetchComments, remove: removeComments, isFetching: isCommentsFetching } = useQuery(["comments"], async () => { return isShowPost != null ? getInfiniteComments(isShowPost.id, last_comment_id) : null }, { enabled: !!userInfo })

  const [hasNextPage, setHasNextPage] = useState(false)
  const [last_post_id, setLast_post_id] = useState(null)
  const [isShowPost, setShowPost] = useState(null)

  useEffect(() => {
    if (router.isReady) {
      if (router.query.q == null) {
        router.push("/")
      }
    }
    if (isShowPost != null)
      refetchComments()
  }, [router.query, router.isReady, isShowPost, router.query.q])

  useEffect(() => {
    if (posts !== undefined && queryClient.getQueryData(["search_posts"]) === undefined && router.query.q !== null) {
      router.push("/fix?searchq=" + router.query.q)
    }
  }, [posts, queryClient.getQueryData(["search_posts"]), router.query.q])


  async function getInfinitePosts(last_post_id_param) {
    try {
      let res = await axios.post("/posts/getPostsByTag", { tag: router.query.q, user_id: userInfo.id, last_post_id: last_post_id_param })
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
        //console.log("no new posts")
        setHasNextPage(false)
      }
      let prevArray = queryClient.getQueryData(["search_posts"])
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

    const postInfo = queryClient.getQueryData(["search_posts"])[index]
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

      // queryClient.cancelQueries({ queryKey: ["search_posts"] }) => this was breaking the mutation function easily
      let currentPostInfo = queryClient.getQueryData(["search_posts"])[index]
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
        //console.log('We are near the last post!')
        refetch()
      }
    })

    if (post) intObserver.current.observe(post)
  }, [isFetching, refetch, hasNextPage])

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
        //console.log("no new posts")
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

  const [hasCommentsNextPage, setHasCommentsNextPage] = useState(false)
  const commentTextAreaRef = useRef()
  const [commentText, addCommentText] = useState("")
  const [last_comment_id, setLast_comment_id] = useState(null)
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), [])
  const [commentToReplyIndex, setCommentToReplyIndex] = useState(null)

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
    onMutate: ({ newComment, index: index, isFromPost }) => {
      if (isFromPost === true) {
        queryClient.cancelQueries({ queryKey: ["comments"] })
        let currentPostInfo = queryClient.getQueryData(["search_posts"])[index]
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
                <div className='flex gap-3 pb-2 pt-4'>
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
      {
        posts !== undefined ?
          <>
            <Header userInfo={userInfo} searchQuery={router.query.q} />
            {/* <button onClick={()=>console.log(queryClient.getQueryData(["timeline_posts"]))}>queryclient</button>
            <button onClick={()=>console.log(posts)}>posts</button> */}
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
                        </> : <div className='h-2 w-full'></div>}
                        {postInfo.num_comments > 0 ? <div onClick={() => setShowPost({ ...postInfo, index })} className="text-sm text-slate-500 select-none cursor-pointer w-fit">show comments ({postInfo.num_comments})</div> : <div onClick={() => setShowPost({ ...postInfo, index })} className="text-sm text-slate-500 select-none cursor-pointer w-fit">show more...</div>}

                        <div className="text-xs text-slate-400 mt-2">{toDate(postInfo.date)}</div>
                      </div>
                    </div>
                  )
                })
                : ""}
              {isFetching ? <ScaleLoader className='mx-auto w-fit scale-loader scale-75 mt-4' /> : hasNextPage ? null : posts?.length > 0 ? <div className='text-center text-slate-600 mt-8 mb-2'>no more posts</div> : <div className='text-center text-slate-600 mt-8 mb-2'>no posts</div>}
              {posts != null ? showPost() : ""}
            </div>
          </>
          :
          sessionStatus === "unauthorized" || !session ?
            <HeaderNotLogged />
            :
            <Header userInfo={userInfo} />
      }
    </>
  )
}

