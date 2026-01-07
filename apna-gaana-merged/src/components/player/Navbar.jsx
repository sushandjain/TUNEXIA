import React from 'react'
import { assets } from '../../assets/frontend-assets/assets'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'

function Navbar() {

    const navigate = useNavigate()

    return (
        <>
            <div className='w-full flex justify-between items-center font-semibold'>
                <div className='flex items-center gap-2'>
                    <img onClick={() => navigate(-1)} className='w-8 bg-neutral-800 p-2 rounded-2xl cursor-pointer' src={assets.arrow_left} alt="" />
                    <img onClick={() => navigate(1)} className='w-8 bg-neutral-800 p-2 rounded-2xl cursor-pointer' src={assets.arrow_right} alt="" />
                    <Logo />
                </div>
                <div className='flex items-center gap-2 md:gap-4'>
                    {/* Mobile Icons - Show on small screens */}
                    <img 
                        onClick={() => navigate('/library')} 
                        className='w-8 bg-neutral-800 p-2 rounded-2xl cursor-pointer lg:hidden' 
                        src={assets.stack_icon} 
                        alt="Library" 
                        title="Your Library"
                    />
                    <div 
                        onClick={() => navigate('/admin')} 
                        className='bg-neutral-800 px-3 py-1.5 rounded-2xl cursor-pointer lg:hidden text-sm'
                        title="Admin Panel"
                    >
                        Admin
                    </div>
                    {/* Desktop Items */}
                    <p className='bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer'>Explore Premium</p>
                    <p className='bg-neutral-800 py-1 px-4 rounded-2xl text-[15px] cursor-pointer hidden md:block'>Install App</p>
                    <p className='bg-purple-950 text-black rounded-full w-7 h-7 flex justify-center items-center cursor-pointer '>S</p>
                </div>
            </div>
            <div className='flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide'>
                <p className='bg-white text-black px-4 py-1 rounded-2xl cursor-pointer whitespace-nowrap'>ALL</p>
                <p className='bg-neutral-800 px-4 py-1 rounded-2xl cursor-pointer whitespace-nowrap'>Music</p>
                <p className='bg-neutral-800 px-4 py-1 rounded-2xl cursor-pointer whitespace-nowrap'>Podcasts</p>
            </div>
        </>
    )
}

export default Navbar
