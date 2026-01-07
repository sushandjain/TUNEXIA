import { useContext, useRef, useEffect, useState } from 'react'
import Navbar from './Navbar'
import { PlayerContext } from '../../context/PlayerContext'

const Library = () => {
    const { songsData, likedSongs, playWithId, playStatus, pause, track } = useContext(PlayerContext);
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Filter liked songs
    const likedSongsData = songsData.filter(song => likedSongs.includes(song._id));

    // Auto-scroll carousel
    useEffect(() => {
        if (likedSongsData.length <= 3) return;
        
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % likedSongsData.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [likedSongsData.length]);

    // Scroll to active item
    useEffect(() => {
        if (carouselRef.current && likedSongsData.length > 0) {
            const itemWidth = 280; // width + gap
            const scrollPosition = activeIndex * itemWidth - itemWidth;
            carouselRef.current.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
        }
    }, [activeIndex, likedSongsData.length]);

    return (
        <>
            <Navbar />
            <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
                <div className="w-48 h-48 bg-gradient-to-br from-purple-700 to-blue-300 rounded shadow-2xl flex items-center justify-center">
                    <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
                <div className="flex flex-col gap-3">
                    <p className='text-sm font-semibold'>Playlist</p>
                    <h2 className='text-5xl font-bold mb-2 md:text-7xl'>Liked Songs</h2>
                    <p className='text-slate-300'>Your favorite tracks</p>
                    <p className='flex items-center gap-2 mt-2 text-sm'>
                        <span className="font-bold">You</span>
                        <span>• {likedSongsData.length} songs</span>
                    </p>
                </div>
            </div>

            {/* Play button */}
            {likedSongsData.length > 0 && (
                <div className="mt-6 flex items-center gap-5">
                    <button
                        onClick={() => playWithId(likedSongsData[0]._id)}
                        className='bg-green-500 hover:bg-green-400 hover:scale-105 transition-all text-black rounded-full p-4'
                    >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Carousel for liked songs */}
            {likedSongsData.length > 0 && (
                <div className="mt-10 mb-8">
                    <h3 className="text-2xl font-bold mb-4">Featured Liked Songs</h3>
                    <div className="relative">
                        <div 
                            ref={carouselRef}
                            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {likedSongsData.map((item, index) => (
                                <div
                                    key={item._id}
                                    onClick={() => {
                                        setActiveIndex(index);
                                        if (track._id === item._id && playStatus) {
                                            pause();
                                        } else {
                                            playWithId(item._id);
                                        }
                                    }}
                                    className={`flex-shrink-0 w-[250px] p-4 rounded-lg cursor-pointer transition-all duration-300 snap-center ${
                                        index === activeIndex 
                                            ? 'bg-gradient-to-br from-purple-600/40 to-blue-600/40 scale-105 shadow-xl border-2 border-purple-500' 
                                            : 'bg-[#ffffff10] hover:bg-[#ffffff20] scale-95 opacity-70'
                                    }`}
                                >
                                    <img
                                        className='w-full h-[250px] rounded-lg object-cover mb-4'
                                        src={item.image}
                                        alt={item.name}
                                    />
                                    <div>
                                        <p className='text-white font-bold text-lg truncate'>{item.name}</p>
                                        <p className='text-gray-300 text-sm mt-1 truncate'>{item.desc}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <p className='text-gray-400 text-xs'>{item.album}</p>
                                            <p className='text-gray-400 text-xs'>{item.duration}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Navigation dots */}
                        <div className="flex justify-center gap-2 mt-4">
                            {likedSongsData.slice(0, Math.min(likedSongsData.length, 10)).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        index === activeIndex 
                                            ? 'bg-purple-500 w-8' 
                                            : 'bg-gray-500 hover:bg-gray-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Songs list */}
            <div className="mt-10 mb-20">
                {likedSongsData.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        {likedSongsData.map((item, index) => (
                            <div
                                key={item._id}
                                onClick={() => {
                                    if (track._id === item._id && playStatus) {
                                        pause();
                                    } else {
                                        playWithId(item._id);
                                    }
                                }}
                                className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff26] cursor-pointer rounded-md group"
                            >
                                <p className='text-white'>{index + 1}</p>
                                <div className='flex items-center gap-4'>
                                    <img
                                        className='w-10 h-10 rounded object-cover'
                                        src={item.image}
                                        alt={item.name}
                                    />
                                    <div>
                                        <p className='text-white font-medium'>{item.name}</p>
                                        <p className='text-sm'>{item.desc}</p>
                                    </div>
                                </div>
                                <p className='text-[15px]'>{item.album}</p>
                                <p className='text-[15px] text-center'>{item.duration}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-2xl text-gray-400 mb-2">No liked songs yet</p>
                        <p className="text-gray-500">Songs you like will appear here</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default Library
