import React from 'react'

function ProfileContent({ profileInfo }) {
    return (
        <>
            <div className='sm:w-[600px] w-full mx-auto mt-8'>
                <div className='flex sm:w-10/12 w-full mx-auto sm:justify-start justify-around'>
                    <img className='rounded-full sm:h-40 h-32' src={profileInfo?.photo_url} alt={profileInfo?.username + " photo"} referrerPolicy="no-referrer" />
                    <div className='flex sm:ml-auto flex-col my-auto'>
                    <div className='font-bold text-xl'>{profileInfo?.username}</div>
                        <div className='mt-1'>
                            <span className='font-semibold'>0 </span><span className='font-light'>posts <span>&nbsp;</span></span>
                            <span className='font-semibold'>150 </span><span className='font-light'>followers <span>&nbsp;</span></span>
                            <span className='font-semibold'>397 </span><span className='font-light'>following</span>
                        </div>
                        <div className='mt-4'>Bro/King</div>
                    </div>
                </div>
                <hr className='my-12' />
                <div className='grid grid-cols-3 sm:gap-4 gap-1'>
                    <div className='bg-slate-200 w-full aspect-square'></div>
                </div>
            </div>  

        </>
    )
}

export default ProfileContent