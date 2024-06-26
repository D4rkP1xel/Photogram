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
    }, { enabled: !!session, refetchOnWindowFocus: false })

    const descriptionTextAreaRef = useRef()
    const [optionPage, setOptionPage] = useState(1)
    const [descriptionText, addDescription] = useState("")
    const uploadImageRef = useRef(null)
    const [imageToUpload, setImageToUpload] = useState(null)
    const [imageToPreview, setImageToPreview] = useState(null)
    const [isAvatarHovered, setAvatarHovered] = useState(false)
    const [descriptionChanged, setDescriptionChanged] = useState(false)
    const [usernameText, setUsernameText] = useState("")
    const [usernameChanged, setUsernameChanged] = useState(false)

    const { data: description } = useQuery(["user_description"], async () => {
        return axios.post("/user/getDescription", {
            user_id: userInfo.id
        }).then((res) => res.data.description)
    }, { enabled: !!session && !!userInfo, refetchOnWindowFocus: false })

    const queryClient = useQueryClient()

    useEffect(() => {
        if (description !== undefined && descriptionTextAreaRef != null && optionPage === 1) {

            descriptionChanged ? addDescription(descriptionText) : addDescription(description)
            setTimeout(() => {
                descriptionTextAreaRef.current.style.height = "28px"
                descriptionTextAreaRef.current.style.height = `${descriptionTextAreaRef.current.scrollHeight}px`
            }, 100);

        }
        if(optionPage === 2 && userInfo != null)
        {
            usernameChanged ? setUsernameText(usernameText) : setUsernameText(userInfo.username)
        }
    }, [description, descriptionTextAreaRef, optionPage, userInfo])

    const { mutate: mutateDescription } = useMutation(async () => await axios.post("/user/editDescription", { user_id: userInfo.id, description: descriptionText }), {
        onMutate: (newDescription) => {

            queryClient.cancelQueries({ queryKey: ["user_description"] })
            queryClient.setQueryData(["user_description"], () => { return newDescription })

        }//maybe do the onError
    })
    const maxLength = 240

    function handleChangeUsername(e) {
        if(userInfo == null) return
        setUsernameText(e.target.value)
        e.target.value !== userInfo.username ? setUsernameChanged(true) : setUsernameChanged(false)
    }

    function addCommentOnChange(e) {

        addDescription(e.target.value)
        e.target.value !== userInfo.username ? setDescriptionChanged(true) : setDescriptionChanged(false)
        changeTextAreaSize(e)
    }

    function changeTextAreaSize(e) {
        e.target.style.height = "28px"
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    async function saveSettings() {
        if (descriptionChanged === true) {
            if (descriptionText.length > maxLength)
                return alert("Description too long")
        }
        if(usernameChanged === true)
        {
            if(usernameText.length < 3)
            {
                return alert("Username too short")
            }
            if(usernameText.length > 40)
            {
                return alert("Username too long")
            }
        }
        if (imageToUpload !== null) {
            if (imageToUpload.size >= 3000000) {
                alert("Image Size is too big")
                return
            }
        }
        try {
            if (descriptionChanged === true) {
                // await axios.post("/user/editDescription", {user_id: userInfo.id, description: descriptionText})
                mutateDescription(descriptionText)
                //supposedly there should be a mutate modifying the query 
            }
            if (imageToUpload !== null) {
                await axios.post("/user/newAvatar", { user_id: userInfo.id, photo: imageToUpload })
            }
            if(usernameChanged === true)
            {
                await axios.post("/user/newUsername", {user_id: userInfo.id, username: usernameText})
            }
            alert("New settings saved")
        }
        catch (err) {
            console.log(err)
            alert("Error saving settings, try again later")
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
            setImageToUpload(reader.result)
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
                                <input onChange={(e)=>handleChangeUsername(e)} value={usernameText} className='w-full'></input>
                            </div>
                            <div className='flex gap-4 mt-4 py-8'>
                                <span className='shrink-0 w-36'>Change Avatar</span>
                                {userInfo !== undefined ?
                                    <>
                                        <div>
                                            <div className='pointer-events-none h-40 w-40 absolute items-center flex'>
                                                <BsPlusLg className={isAvatarHovered ? 'text-slate-800 h-12 w-12 mx-auto opacity-40 pointer-events-none duration-100 ease-in' : 'text-slate-800 h-12 w-12 mx-auto opacity-0 pointer-events-none duration-100 ease-in'} />
                                            </div>

                                            <div onClick={() => uploadImageRef.current.click()} onMouseEnter={() => setAvatarHovered(true)} onMouseLeave={() => setAvatarHovered(false)} className={isAvatarHovered ? 'h-40 w-40 bg-slate-300 absolute cursor-pointer opacity-40 duration-100 ease-in' : 'h-40 w-40 bg-slate-300 absolute cursor-pointer opacity-0 duration-100 ease-in'}>

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
                            <div onClick={async () => await saveSettings()} className='ml-auto mt-auto rounded-full px-6 py-2 cursor-pointer duration-200 ease-in bg-blue-500 hover:bg-blue-600 w-fit text-white'>Save</div>
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