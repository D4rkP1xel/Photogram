import React from 'react'
import {IoMdHeartEmpty} from 'react-icons/io'
import {BsChat} from 'react-icons/bs'
function MainContent() {
    return (
        <div className='w-[500px] mx-auto'>
            <div className='w-full my-10'>
                <div className='bg-slate-200 rounded-t-2xl p-4 items-center flex w-full'>
                    <div className='h-12 w-12 bg-slate-50 rounded-full'></div>
                    <div className='mx-4 font-semibold cursor-pointer select-none'>D4rkP1xel</div>
                </div>
                <div className='h-80 bg-slate-100'></div>
                <div className='h-14 bg-slate-200 pt-4 flex px-2'>
                    <div className='h-10 w-12 px-2 pb-2 cursor-pointer hover:text-slate-500'><IoMdHeartEmpty className='h-full w-auto'/></div>
                    <div className='h-[30] w-[38] px-2 pb-[12px] cursor-pointer hover:text-slate-500'><BsChat className='h-full w-auto'/></div>
                </div>
                <div className='pb-4 px-4 bg-slate-200 rounded-b-2xl'>
                    <div className='font-semibold text-sm cursor-pointer select-none mb-2'>1348 Likes</div>
                    <div className='font-semibold text-sm cursor-pointer select-none'>D4rkP1xel </div>
                    <div>Cool Description</div>
                    <div className="text-xs text-slate-400 mt-2">3 DAYS AGO</div>
                </div>
            </div>
            <div className='bg-slate-200 w-full h-96'></div>
        </div>
    )
}

export default MainContent