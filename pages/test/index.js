import { useEffect, useState } from 'react'
import axios from '../../utils/axiosConfig'
import { useQuery, useMutation, QueryCache, QueryClient, useQueryClient } from '@tanstack/react-query'

function Test() {
    const queryClient = useQueryClient()
    
   function convertToSqlString(str)
   {
        return str.replace('\n','<br/>')
   }
    return (
        <div>
            comments
            yooo
            {console.log(convertToSqlString())}
        </div>
    )
}

export default Test
