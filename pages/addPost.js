import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import axios from '../utils/axiosConfig'
import { useSession } from 'next-auth/react'
import Loading from '../components/loading'
import Header from '../components/header'
import { BsFillFileEarmarkImageFill, BsXLg, BsPlusLg } from 'react-icons/bs'
import { useState, useRef, useEffect } from 'react'

function AddPost() {
  const { data: session } = useSession()
  const router = useRouter()
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState([])
  const [currentTag, setCurrentTag] = useState("")
  const { data: userInfo } = useQuery(["user_info"], async () => {
    return axios.post("/user/getUserInfo", {
      email: session.user.email
    }).then((res) => res.data.data)
  }, { enabled: !!session })

  const uploadImageRef = useRef(null)
  const tagRef = useRef(null)
  const submitTagRef = useRef(null)
  const [imageToUpload, setImageToUpload] = useState(null)
  const [imageToPreview, setImageToPreview] = useState(null)

  function handleTags(e)
  {
    e.preventDefault()
    if(currentTag !== "")
    {
      setTags(...tags, currentTag)
      setCurrentTag("")
      tagRef.current.value = ""
    }
      
  }
  function handleChangeTag(e)
  {
    setCurrentTag(e.target.value)
  }
  useEffect(()=>{
    console.log(tags)
  },[tags])
  function handleDescription(e)
  {
    setDescription(e.target.value)
  }
  function handleChangeImage(event) {
    setImageToUpload(event.target.files[0])

    const reader = new FileReader()
    reader.readAsDataURL(event.target.files[0])
    reader.onloadend = () => {
      setImageToPreview(reader.result)
    }
  }

  async function submitImage() {
    if (imageToUpload === null) {
      alert("No image selected")
      return
    }
    if (imageToUpload.size >= 3000000) {
      alert("Image Size is too big")
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(imageToUpload)
    reader.onloadend = async () => {
      try {
        const response = await axios.post("/posts/newPost", {
          image: reader.result,
          user_id: userInfo.id,
          description: description,
          tags: tags,
        })
        console.log(response)
      }
      catch (err) {
        console.log(err)
      }
    }
  }


  if (session && userInfo) {
    return (
      <>
        <Header userInfo={userInfo} />
        <input className='hidden' ref={uploadImageRef} type={"file"} onChange={(event) => handleChangeImage(event)} />
        <div className='md:w-[740px] lg:w-[1000px] w-full mx-auto mt-8 md:flex'>
          <div className='md:w-full'>
            {/* select photo button */}
            <div onClick={() => uploadImageRef.current.click()} className='flex w-fit justify-center bg-slate-200 py-2 px-6 rounded-full gap-2 select-none cursor-pointer shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mx-auto mb-8'>
              <BsFillFileEarmarkImageFill className='text-slate-400 my-auto h-6 w-6' />
              <div className='font-light my-auto'>Select a photo from your device</div>
            </div>
            {/* photo container */}
            <div className='w-10/12 flex items-center aspect-square bg-slate-100 mx-auto select-none'>
              {imageToPreview ? <div className={'w-full h-full bg-no-repeat bg-center bg-cover border border-slate-200'} style={{ backgroundImage: `url('${imageToPreview}')` }}></div> : <>
                <div className='w-full flex flex-col gap-4'>
                  <BsXLg className='flex justify-center h-12 w-full text-slate-300' />
                  <div className='font-light flex justify-center w-full'>No photo selected</div>
                </div>
              </>}

            </div>
          </div>

          <div className='w-10/12 mx-auto md:flex md:flex-col'>
            <div className='font-bold text-xl mb-2 mt-8'>Description</div>
            <textarea onChange={handleDescription} className='border border-slate-300 rounded-xl w-full px-2' rows={3} placeholder={"Add a description... (optional)"}></textarea>

            <div className='font-bold text-xl mt-4'>Tags</div>

            <div className='flex gap-8 mb-20 mt-4 items-center'>
              <form onSubmit={handleTags} className="m-0 p-0 box-border">
                <input onChange={handleChangeTag} ref={tagRef} type={"text"} className='h-fit border border-slate-300 rounded-full w-full px-2 ' placeholder={"Add tag... (optional)"} />
                <input ref={submitTagRef} type={"submit"} className="hidden" />
              </form>
              <div className='flex h-fit py-2 w-fit justify-center bg-slate-200 px-4 rounded-full gap-2 select-none cursor-pointer shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in'>
                <BsPlusLg className='text-slate-400 my-auto h-4 w-4' />
                <div className='h-fit text-sm' onClick={()=>submitTagRef.current.click()}>Add</div>
                
              </div>

            </div>


            <div onClick={async()=>await submitImage()} className='flex w-fit justify-center bg-slate-200 py-4 px-10 rounded-full select-none cursor-pointer shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in md:mx-0 md:mt-auto mx-auto mb-4'>
              <div className='font-normal my-auto'>Publish photo</div>
              
            </div>
          </div>

        </div>
      </>
    )
  }
  return (<Loading />)
}

export default AddPost