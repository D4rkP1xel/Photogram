import { useEffect, useState } from 'react'
import axios from '../../utils/axiosConfig'
import { useQuery, useMutation, QueryCache, QueryClient, useQueryClient } from '@tanstack/react-query'

function Test() {
    const queryClient = useQueryClient()
    
   
    return (
        <div>
            comments
            yooo
        </div>
    )
}

export default Test
