import { useEffect, useState } from 'react'
import axios from '../utils/axiosConfig'
import { useQuery, useMutation, QueryCache, QueryClient, useQueryClient } from '@tanstack/react-query'

function Test() {
    const queryClient = useQueryClient()
    const { data: isFollowing} = useQuery(["isFollowing"], 
        async () => { 
            return axios.post("/user/getFollowing", {follower: "16660305291902i4rwq217", following: "1666030336737wwgh9cn1"}).then((res) => {console.log(res.data); return res.data.follows}) 
    })
    const {mutate} = useMutation(follow, {
        onMutate: (newIsFollowing) => {
            queryClient.setQueryData(["isFollowing"], newIsFollowing)
        }
    })
    async function follow()
    {
        if(isFollowing === false)
            return await axios.post("/user/addFollowing", {follower: "16660305291902i4rwq217", following: "1666030336737wwgh9cn1"}).then((res) => res.data.follows)
        else
            return await axios.post("/user/removeFollowing", {follower: "16660305291902i4rwq217", following: "1666030336737wwgh9cn1"}).then((res) => res.data.follows)
    }
    
    return (
        <>
            <div>{queryClient.getQueryData(["isFollowing"]) === true ? "following" : "not following"}</div>
            <button onClick={()=>mutate(!isFollowing)}>Follow</button>
   
        </>
    )
}

export default Test
