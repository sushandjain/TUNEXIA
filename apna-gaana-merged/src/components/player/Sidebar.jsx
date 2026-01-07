import React from 'react'
import { assets } from '../../assets/frontend-assets/assets'
import { useNavigate } from 'react-router-dom'

function Sidebar() {
    const navigate = useNavigate();

    return (
        <div className='w-[25%] h-full p-2 flex-col gap-2 text-white lg:flex hidden'>
            <div className='bg-purple-950 h-[15%] rounded flex flex-col justify-around'>
                <div onClick={() => navigate("/")} className='flex items-center gap-3 pl-8 cursor-pointer hover:opacity-80'>
                    <img className="w-6" src={assets.home_icon} alt="" />
                    <p className='font-bold'>Home</p>
                </div>
                <div className='flex items-center gap-3 pl-8 cursor-pointer hover:opacity-80'>
                    <img className="w-6" src={assets.search_icon} alt="" />
                    <p className='font-bold'>Search</p>
                </div>
            </div>
            <div className='bg-purple-950 h-[85%] rounded overflow-auto'>
                <div className='p-4 flex items-center justify-between'>
                    <div onClick={() => navigate('/library')} className='flex items-center gap-3 cursor-pointer hover:opacity-80'>
                        <img className="w-6" src={assets.stack_icon} alt="" />
                        <p className='font-semibold'>Your Library</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <img className="w-5 cursor-pointer hover:opacity-80" src={assets.arrow_icon} alt="" />
                        <img className="w-5 cursor-pointer hover:opacity-80" src={assets.plus_icon} alt="" />
                    </div>
                </div>
                <div className='p-4 bg-purple-900 m-2 rounded font-semibold flex flex-col items-start justify-start'>
                    <h1>Create your first library</h1>
                    <p className='font-light'>List your favorite songs now</p>
                    <button 
                        onClick={() => navigate('/library')}
                        className='px-4 py-1.5 bg-white text-black text-[15px] rounded-full mt-4 hover:scale-105 transition-all'
                    >
                        Create playlist
                    </button>
                </div>
                <div className='p-4 bg-purple-900 m-2 rounded font-semibold flex flex-col items-start justify-start mt-4'>
                    <h1>Find some podcast to follow and listen</h1>
                    <p className='font-light'>Keep track on new episodes</p>
                    <button className='px-4 py-1.5 bg-white text-black text-[15px] rounded-full mt-4 hover:scale-105 transition-all'>
                        Browse Podcast
                    </button>
                </div>
                <div className='p-2 m-2 text-center'>
                    <button 
                        onClick={() => navigate('/admin')}
                        className='text-gray-400 text-xs hover:text-gray-300 transition-colors mt-50'
                    >
                        Admin Panel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
