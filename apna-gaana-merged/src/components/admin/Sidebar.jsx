import React from 'react'
import { assets } from '../../assets/admin-assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'


const Sidebar = () => {
    const navigate = useNavigate();
    
    return (
        <div className='bg-purple-700 min-h-screen pl-[4vh] font-extrabold '>
            <div className='mt-5 w-[max(10vw,100px)] hidden sm:block '>
                <h2 
                    onClick={() => navigate('/')} 
                    className='first-letter:text-orange-400 bg-purple-200 p-1.5 rounded-br-2xl rounded-tl-2xl cursor-pointer'
                >
                    T<span className='font-sans text-purple-700'>UNE</span><span className='font-bold text-red-500'>X</span><span className='font-mono text-purple-700'>IA</span>
                </h2>
            </div>
            <img src={assets.logo_small} alt="" className='mt-5 w-[max(5vw,40px)] mr-5 sm:hidden block' />

            <div className='flex flex-col gap-5 mt-10'>
                <NavLink to="/admin/add-song" className='flex items-center gap-2.5 text-gray-800 bg-white border-black p-2 pr-[max(8vh,10px)] drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium'>
                    <img src={assets.add_song} alt="" className='w-5' />
                    <p className='hidden sm:block'>Add Song</p>
                </NavLink>
                <NavLink to="/admin/list-song" className='flex items-center gap-2.5 text-gray-800 bg-white border-black p-2 pr-[max(8vh,10px)] drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium'>
                    <img src={assets.song_icon} alt="" className='w-5' />
                    <p className='hidden sm:block'>List Song</p>
                </NavLink>
                <NavLink to="/admin/add-album" className='flex items-center gap-2.5 text-gray-800 bg-white border-black p-2 pr-[max(8vh,10px)] drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium'>
                    <img src={assets.add_album} alt="" className='w-5' />
                    <p className='hidden sm:block'>Add Album</p>
                </NavLink>
                <NavLink to="/admin/list-album" className='flex items-center gap-2.5 text-gray-800 bg-white border-black p-2 pr-[max(8vh,10px)] drop-shadow-[-4px_4px_#00FF5B] text-sm font-medium'>
                    <img src={assets.album_icon} alt="" className='w-5' />
                    <p className='hidden sm:block'>List Album</p>
                </NavLink>
                
                <div className='mt-10'>
                    <button 
                        onClick={() => navigate('/')}
                        className='flex items-center gap-2.5 text-white bg-purple-900 border-black p-2 pr-[max(8vh,10px)] text-sm font-medium hover:bg-purple-800 transition-colors'
                    >
                        <span className='hidden sm:block'>← Back to App</span>
                        <span className='sm:hidden'>←</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
