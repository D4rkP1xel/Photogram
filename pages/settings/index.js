import React from 'react'
import Header from '../../components/header'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from '../../utils/axiosConfig'

function index() {
    const { data: session } = useSession()
    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    }, { enabled: !!session })

    const [optionPage, setOptionPage] = "profile"       //accepted values: profile,

    function handleOption()
    {
        if(optionPage === "profile")
        {
            return(
                <div>
                    profile settings
                </div>
            )
        }
        return ""
    }
    return (
        <>
            <Header userInfo={userInfo} />
            {handleOption}
        </>
    )
}

export default index