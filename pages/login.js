import {useSession, signIn, signOut } from 'next-auth/react'

function login() {
    const {data: session} = useSession()
    
    if(session)
    {
        return(
            <div className='bg-slate-300'>
                <h1>logged in, {session.user.name}</h1>
                <button onClick={signOut} className='border-solid border-purple-600 border-2'>Sign Out</button>
            </div>
            
        )
    }
    else
    {
        return(
            <div>
                <h1>not logged in</h1>
                <button onClick={signIn} className='border-solid border-purple-600 border-2 rounded-lg p-1 bg-purple-100'>Sign In</button>
            </div>
        )
    }
}

export default login