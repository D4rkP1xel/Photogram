import axios from '../../utils/axiosConfig'
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import Header from '../../components/header'

function Test() {
    const queryClient = useQueryClient()
    const { data: session } = useSession()

    const { data: userInfo } = useQuery(["user_info"], async () => {
        return axios.post("/user/getUserInfo", {
            email: session.user.email
        }).then((res) => res.data.data)
    }, { enabled: !!session })

    
    return (
        <>
            <Header userInfo={userInfo} />

        </>
    )
}

export default Test
