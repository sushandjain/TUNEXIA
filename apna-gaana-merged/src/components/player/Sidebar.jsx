import React from 'react';
import { assets } from '../../assets/frontend-assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className='w-[24%] max-w-[280px] h-full p-2 flex-col gap-2 text-white lg:flex hidden' aria-label="Sidebar Navigation">
            {/* Top Navigation Block */}
            <div className='bg-[#121212] rounded-lg p-4 flex flex-col gap-4'>
                <button 
                    onClick={() => navigate("/")} 
                    className={`flex items-center gap-4 cursor-pointer transition-colors text-left ${
                        location.pathname === '/' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                >
                    <img className="w-5 h-5" src={assets.home_icon} alt="" />
                    <span className='text-sm'>Home</span>
                </button>
                <button 
                    onClick={() => navigate("/library")} 
                    className={`flex items-center gap-4 cursor-pointer transition-colors text-left ${
                        location.pathname === '/library' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                >
                    <img className="w-5 h-5" src={assets.stack_icon} alt="" />
                    <span className='text-sm'>Your Library</span>
                </button>
            </div>

            {/* Library / Playlists Block */}
            <div className='bg-[#121212] flex-1 rounded-lg overflow-y-auto p-3 flex flex-col justify-between'>
                <div className="space-y-3">
                    <div className='p-4 bg-neutral-900/80 rounded-lg'>
                        <h2 className='text-sm font-bold text-white'>Create your library</h2>
                        <p className='text-xs text-neutral-400 mt-1'>Save your favorite tracks and listen anytime</p>
                        <button 
                            onClick={() => navigate('/library')}
                            className='px-4 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-full mt-3 active:scale-95 transition-all cursor-pointer'
                        >
                            Open Library
                        </button>
                    </div>

                    <div className='p-4 bg-neutral-900/80 rounded-lg'>
                        <h2 className='text-sm font-bold text-white'>Manage Tracks & Albums</h2>
                        <p className='text-xs text-neutral-400 mt-1'>Add and remove audio content</p>
                        <button 
                            onClick={() => navigate('/admin')}
                            className='px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-full mt-3 active:scale-95 transition-all cursor-pointer'
                        >
                            Admin Dashboard
                        </button>
                    </div>
                </div>

                <div className='pt-4 text-center'>
                    <button 
                        onClick={() => navigate('/admin')}
                        className='text-neutral-500 hover:text-neutral-400 text-xs transition-colors cursor-pointer'
                    >
                        Tunexia Admin Panel
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default React.memo(Sidebar);
