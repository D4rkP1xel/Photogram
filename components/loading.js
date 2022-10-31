import {BarLoader} from 'react-spinners'

function Loading() {
  return (
    <div className="w-screen h-screen bg-slate-100 flex justify-center fixed">

        <div className="text-center translate-y-1/4">
            <img className='w-64' src='/instagram-logo.png' />
            <div className='flex w-full justify-center scale-125 mt-20'>
                <BarLoader color="gray" />
            </div>
            
        </div>
        
    </div>
  )
}

export default Loading