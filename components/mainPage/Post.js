import React from 'react'
import { IoMdHeartEmpty } from 'react-icons/io'
import { BsChat } from 'react-icons/bs'
import toDate from '../../utils/toDate'

function Post({ postInfo }) {
    return (
        <div className='w-full my-10'>
            <div className='bg-slate-200 rounded-t-2xl p-4 items-center flex w-full'>
                <div className='h-12 w-12 bg-slate-50 rounded-full'></div>
                <div className='mx-4 font-semibold cursor-pointer select-none'>{postInfo.username}</div>
            </div>
            <div className={'w-full aspect-square bg-no-repeat bg-center bg-cover'} style={{ backgroundImage: `url('${postInfo.photo_url}')` }}></div>
            <div className='h-14 bg-slate-200 pt-4 flex px-2'>
                <div className='h-10 w-12 px-2 pb-2 cursor-pointer hover:text-slate-500'><IoMdHeartEmpty className='h-full w-auto' /></div>
                <div className='h-[30] w-[38] px-2 pb-[12px] cursor-pointer hover:text-slate-500'><BsChat className='h-full w-auto' /></div>
            </div>
            <div className='pb-4 px-4 bg-slate-200 rounded-b-2xl'>
                <div className='font-semibold text-sm cursor-pointer select-none mb-2'>{postInfo.num_likes === 1 ? "1 like" : postInfo.num_likes + " likes"}</div>

                {postInfo.description !== null ? <>   
                    <div className='font-semibold text-sm cursor-pointer select-none'>{postInfo.username}</div>
                    <div className='whitespace-pre-wrap'>{postInfo.description}</div>
                </> : ""}
                <div className="text-xs text-slate-400 mt-2">{toDate(postInfo.date)}</div>
            </div>
        </div>
    )
}

export default Post