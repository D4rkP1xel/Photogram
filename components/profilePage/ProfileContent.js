import {BsFillCameraFill} from 'react-icons/bs'
import { useRouter } from 'next/router'

function ProfileContent({ profileInfo }) {
    const router = useRouter()
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
                 <div className='w-full flex flex-row-reverse'> {/*add photo button*/}
                    <div onClick={()=>router.push("/addPost")} className='bg-slate-200 rounded-full select-none cursor-pointer h-8 w-32 flex gap-2 justify-center shadow hover:shadow-md hover:bg-slate-100 duration-200 ease-in mr-2'>
                        <BsFillCameraFill className='h-4 w-4 my-auto'/>
                        <div className='my-auto'>Share Photo</div>
                    </div>
                </div>
                <hr className='mb-12 mt-4' />
                <div className='grid grid-cols-3 sm:gap-4 gap-1'>
                    <div className='bg-slate-200 w-full aspect-square'></div>
                </div>
            </div>  

        </>
    )
}

export default ProfileContent