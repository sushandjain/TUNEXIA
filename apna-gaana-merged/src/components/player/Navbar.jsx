import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../../assets/frontend-assets/assets';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { PlayerContext } from '../../context/PlayerContext';

function Navbar() {
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery } = useContext(PlayerContext);
    const [localQuery, setLocalQuery] = useState(searchQuery || "");

    // Debounce search input by 250ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(localQuery);
        }, 250);
        return () => clearTimeout(handler);
    }, [localQuery, setSearchQuery]);

    return (
        <header className='w-full mb-4' role="banner">
            <div className='flex justify-between items-center gap-3'>
                {/* Back / Forward and Brand Logo */}
                <div className='flex items-center gap-2'>
                    <button 
                        onClick={() => navigate(-1)} 
                        className='w-10 h-10 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-green-500'
                        aria-label="Go back"
                    >
                        <img className='w-4 h-4' src={assets.arrow_left} alt="" />
                    </button>
                    <button 
                        onClick={() => navigate(1)} 
                        className='w-10 h-10 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-green-500'
                        aria-label="Go forward"
                    >
                        <img className='w-4 h-4' src={assets.arrow_right} alt="" />
                    </button>
                    <div className='hidden sm:block'>
                        <Logo />
                    </div>
                </div>

                {/* Instant Search Bar */}
                <div className="flex-1 max-w-md mx-2">
                    <div className="relative flex items-center">
                        <img 
                            src={assets.search_icon} 
                            alt="" 
                            className="w-4 h-4 absolute left-3.5 text-neutral-400 pointer-events-none opacity-60" 
                        />
                        <input
                            type="search"
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            placeholder="What do you want to play?"
                            className="w-full pl-10 pr-4 py-2 bg-neutral-900 hover:bg-neutral-800 focus:bg-neutral-900 text-sm text-white placeholder-neutral-400 rounded-full border border-neutral-700/60 focus:border-green-500 focus:outline-none transition-all"
                            aria-label="Search songs and albums"
                        />
                        {localQuery && (
                            <button
                                onClick={() => { setLocalQuery(""); setSearchQuery(""); }}
                                className="absolute right-3 text-neutral-400 hover:text-white text-xs p-1"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Right controls */}
                <div className='flex items-center gap-2'>
                    <button 
                        onClick={() => navigate('/admin')} 
                        className='bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors'
                        title="Admin Panel"
                    >
                        Admin
                    </button>
                    <div 
                        className='w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-md'
                        title="User Profile"
                    >
                        T
                    </div>
                </div>
            </div>

            {/* Category Filter Pills */}
            <nav className='flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide py-1' aria-label="Category Filters">
                <button 
                    onClick={() => { setLocalQuery(""); setSearchQuery(""); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        !localQuery ? 'bg-white text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'
                    }`}
                >
                    All
                </button>
                <button 
                    onClick={() => setLocalQuery("Hits")}
                    className='bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all'
                >
                    Hits
                </button>
                <button 
                    onClick={() => setLocalQuery("Lo-Fi")}
                    className='bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all'
                >
                    Lo-Fi
                </button>
                <button 
                    onClick={() => setLocalQuery("Calm")}
                    className='bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all'
                >
                    Chill
                </button>
            </nav>
        </header>
    );
}

export default React.memo(Navbar);
