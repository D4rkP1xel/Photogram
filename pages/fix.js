import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

function Fix() {
    const router = useRouter()
    useEffect(() => {
        if (router.isReady)
        {
            if (router.query.searchq !== undefined) {
                router.push("/search?q=" + router.query.searchq)
            }
            if(router.query.profileid !== undefined)
            {
                router.push("/user/" + router.query.profileid)
            }
        }
            
    }, [router.isReady, router.query.searchq,  router.query.profileid])

    return (
        <></>
    )
}

export default Fix