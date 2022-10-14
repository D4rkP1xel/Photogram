import {BarLoader} from 'react-spinners'

function Loading() {
  return (
    <div className="w-screen h-screen bg-green-600 flex justify-center fixed">

        <div className="text-center translate-y-1/4">
            <img className='w-64' src='login-icon.png' />
            <div className='flex w-full justify-center scale-125 mt-20'>
                <BarLoader color='white'/>
            </div>
            
        </div>
        
    </div>
  )
}

export default Loading