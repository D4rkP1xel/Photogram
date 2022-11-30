import React, { useState, useRef, useEffect } from 'react'
import Header from '../../components/header'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../../utils/axiosConfig'
import checkSessionProvider from '../../utils/checkSessionProvider'
import { useRouter } from 'next/router'
import { BsPlusLg } from 'react-icons/bs'


function SettingsPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email,
            provider: session.provider
        }).then((res) => checkSessionProvider(res.data.data, session.provider, router))
    }, { enabled: !!session })

    const descriptionTextAreaRef = useRef()
    const [optionPage, setOptionPage] = useState(1)
    const [descriptionText, addDescription] = useState("")
    const uploadImageRef = useRef(null)
    const [imageToUpload, setImageToUpload] = useState(null)
    const [imageToPreview, setImageToPreview] = useState(null)

    const { data: description } = useQuery(["user_description"], async () => {
        return axios.post("/user/getDescription", {
            user_id: userInfo.id
        }).then((res) => res.data.description)
    }, { enabled: !!session && !!userInfo, refetchOnWindowFocus: false })

    const queryClient = useQueryClient()

    useEffect(() => {
        if (description !== undefined && descriptionTextAreaRef != null && optionPage === 1) {

            addDescription(description)
            setTimeout(() => {
                descriptionTextAreaRef.current.style.height = "28px"
                descriptionTextAreaRef.current.style.height = `${descriptionTextAreaRef.current.scrollHeight}px`
            }, 100);

        }
    }, [description, descriptionTextAreaRef, optionPage])

    const { mutate } = useMutation(async () => await axios.post("/user/editDescription", { user_id: userInfo.id, description: descriptionText }), {
        onMutate: (newDescription) => {

            queryClient.cancelQueries({ queryKey: ["user_description"] })
            queryClient.setQueryData(["user_description"], () => { return newDescription })

        }//maybe do the onError
    })
    const maxLength = 240



    function addCommentOnChange(e) {

        addDescription(e.target.value)
        changeTextAreaSize(e)
    }

    function changeTextAreaSize(e) {
        e.target.style.height = "28px"
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    async function saveSettings() {
        if (descriptionText.length > maxLength)
            return alert("Description too long")
        try {
            if (description !== descriptionText) {
                // await axios.post("/user/editDescription", {user_id: userInfo.id, description: descriptionText})
                mutate(descriptionText)
                //supposedly there should be a mutate modifying the query 
            }
            alert("New settings saved")
        }
        catch (err) {
            console.log(err)
        }
    }

    function descriptionLenght() {

        if (descriptionText.length === 0) {
            return ""
        }
        if (descriptionText.length > maxLength) {
            return (<span className='text-red-500'>{descriptionText.length}/{maxLength}</span>)
        }
        return (<span>{descriptionText.length}/{maxLength}</span>)

    }

    function handleChangeImage(event) {
        setImageToUpload(event.target.files[0])
    
        const reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.onloadend = () => {
          setImageToPreview(reader.result)
        }
      }

    function handleOption() {

        return (
            <div className='w-full bg-slate-100 py-4 px-8 flex flex-col'>
                {optionPage === 1 ?
                    <>
                        <div className='flex gap-4 mt-4'>
                            <span className='shrink-0'>Change Profile Description</span>
                            {description !== undefined ?
                                <>
                                    <textarea ref={descriptionTextAreaRef} onFocus={(e) => changeTextAreaSize(e)} onChange={addCommentOnChange} value={descriptionText} className='overflow-hidden whitespace-pre-wrap border border-slate-400 w-full h-[28px] pb-1'></textarea>
                                    <div className='mt-1 w-20 text-[12px] font-thin text-center'>{descriptionLenght()}</div>
                                </>

                                :
                                ""
                            }

                        </div>
                        <div onClick={async () => await saveSettings()} className='ml-auto mt-auto rounded-full px-6 py-2 cursor-pointer duration-200 ease-in bg-blue-500 hover:bg-blue-600 w-fit text-white'>Save</div>
                    </>
                    :
                    optionPage === 2 ?
                        <>
                            <input className='hidden' ref={uploadImageRef} type={"file"} onChange={(event) => handleChangeImage(event)} />
                            <div className='flex gap-4 mt-4'>
                                <span className='shrink-0 w-36'>Change Username</span>
                                <input className='w-full'></input>
                            </div>
                            <div className='flex gap-4 mt-4 py-8'>
                                <span className='shrink-0 w-36'>Change Avatar</span>
                                {userInfo !== undefined ?
                                    <>
                                        <div>

                                            <div onClick={() => uploadImageRef.current.click()} onMouseEnter={(e) => e.target.style.opacity = ".5"} onMouseLeave={(e) => e.target.style.opacity = "0"} className='h-40 w-40 bg-slate-300 absolute cursor-pointer flex items-center opacity-0 duration-100 ease-in'>
                                                <BsPlusLg className='text-slate-800 h-12 w-12 mx-auto z-10 opacity-100' />
                                            </div>
                                            {imageToPreview === null ?
                                                <img className='h-40 w-40' alt="" src={userInfo.photo_url} />
                                                :
                                                <div className='h-40 w-40 bg-no-repeat bg-center bg-cover' style={{ backgroundImage: `url('${imageToPreview}')` }}></div>
                                            }



                                        </div>
                                    </>
                                    :
                                    <div className='h-40 w-40 bg-slate-300'></div>
                                }

                            </div>
                        </>
                        :
                        ""
                }
            </div>
        )


    }
    return (
        <>
            <Header userInfo={userInfo} />
            <div className='lg:w-[1000px] w-full mx-auto mt-8 flex'>
                <div className='w-96 bg-slate-100 h-[600px] border-r border-slate-200 select-none'>
                    <div onClick={() => setOptionPage(1)} className={optionPage === 1 ? 'h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in border-r-2 border-black' : 'h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in'}>Profile Settings</div>
                    <div onClick={() => setOptionPage(2)} className={optionPage === 2 ? 'h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in border-r-2 border-black' : 'h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in'}>Account Settings</div>
                    {/*<div className='h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in'>Profile Settings</div>
                    <div className='h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in'>Profile Settings</div> */}
                </div>
                {handleOption()}
            </div>

        </>
    )
}

export default SettingsPage