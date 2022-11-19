import React, { useState, useRef, useEffect } from 'react'
import Header from '../../components/header'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../../utils/axiosConfig'



function SettingsPage() {
    const { data: session } = useSession()

    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    }, { enabled: !!session })

    const [optionPage, setOptionPage] = useState("profile")       //accepted values: profile,
    const descriptionTextAreaRef = useRef()
    const [descriptionText, addDescription] = useState("")

    const { data: description } = useQuery(["user_description"], async () => {
        return axios.post("/user/getDescription", {
            user_id: userInfo.id
        }).then((res) => res.data.description)
    }, { enabled: !!session && !!userInfo, refetchOnWindowFocus: false })

    const queryClient = useQueryClient()

    useEffect(() => {
        if (description !== undefined && descriptionTextAreaRef !== null) {
            addDescription(convertFromSqlString(description))
        }
    }, [description])

    const { mutate } = useMutation(async () => await axios.post("/user/editDescription", { user_id: userInfo.id, description: convertToSqlString(descriptionText) }), {
        onMutate: (newDescription) => {

            queryClient.cancelQueries({ queryKey: ["user_description"] })
            queryClient.setQueryData(["user_description"], () => { return newDescription })

        }//maybe do the onError
    })
    const maxLength = 240

    function convertToSqlString(str) {
        return str.replace(/\n/g, '<br/>')
    }

    function convertFromSqlString(str) {
        return str.replace(/<br\/>/g, '\n')
    }

    function addCommentOnChange(e) {

        addDescription(e.target.value)
        changeTextAreaSize(e)
    }

    function changeTextAreaSize(e)
    {
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

    function handleOption() {
        if (optionPage === "profile") {
            return (
                <div className='w-full bg-slate-100 py-4 px-8 flex flex-col'>
                    <div className='flex gap-4 mt-4'>
                        <span className='shrink-0'>Change Profile Description</span>
                        {description !== undefined ?
                            <>
                                <textarea ref={descriptionTextAreaRef} onFocus={(e)=>changeTextAreaSize(e)} onChange={addCommentOnChange} value={descriptionText} className='overflow-hidden border border-slate-400 w-full h-[28px] pb-1'></textarea>
                                <div className='mt-1 w-20 text-[12px] font-thin text-center'>{descriptionLenght()}</div>
                            </>

                            :
                            ""
                        }

                    </div>
                    <div onClick={async () => await saveSettings()} className='ml-auto mt-auto rounded-full px-6 py-2 cursor-pointer duration-200 ease-in bg-blue-500 hover:bg-blue-600 w-fit text-white'>Save</div>


                </div>
            )
        }
        return ""
    }
    return (
        <>
            <Header userInfo={userInfo} />
            <div className='lg:w-[1000px] w-full mx-auto mt-8 flex'>
                <div className='w-96 bg-slate-100 h-[600px] border-r border-slate-200 select-none'>
                    <div className='h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in border-r-2 border-black'>Profile Settings</div>
                    {/* <div className='h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in'>Profile Settings</div>
                    <div className='h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in'>Profile Settings</div>
                    <div className='h-12 flex items-center pl-4 w-full text-sm cursor-pointer hover:bg-slate-200 duration-100 ease-in'>Profile Settings</div> */}
                </div>
                {handleOption()}
            </div>

        </>
    )
}

export default SettingsPage