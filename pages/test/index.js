import { useEffect, useState } from 'react'
import axios from '../../utils/axiosConfig'
import { useQuery, useMutation, QueryCache, QueryClient, useQueryClient } from '@tanstack/react-query'

function Test() {
    const queryClient = useQueryClient()
    
    const { data: comments } = useQuery(["comments"], async () => { return axios.post("/posts/getComments", { post_id: "1667940497985lf3ip9ln" }).then((res) => res.data.data) }, {enabled: true})
    return (
        <div>
            {console.log(comments)}
            
            comments
        </div>
    )
}

export default Test
