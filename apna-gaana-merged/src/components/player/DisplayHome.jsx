import { useContext, useRef, useEffect, useState } from "react"
import AlbumItem from "./AlbumItem"
import Navbar from "./Navbar"
import SongsItem from "./Songitem"
import { PlayerContext } from '../../context/PlayerContext';
import { useNavigate } from "react-router-dom";

function DisplayHome() {
    const { songsData, albumsData } = useContext(PlayerContext)
    const carouselRef = useRef(null);
    const [activeAlbumIndex, setActiveAlbumIndex] = useState(0);
    const navigate = useNavigate();

    // Auto-scroll carousel every 4 seconds
    useEffect(() => {
        if (albumsData.length === 0) return;
        
        const interval = setInterval(() => {
            setActiveAlbumIndex((prev) => (prev + 1) % albumsData.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [albumsData.length]);

    // Scroll to active album
    useEffect(() => {
        if (carouselRef.current && albumsData.length > 0) {
            const itemWidth = 310; // width + gap
            const scrollPosition = activeAlbumIndex * itemWidth - itemWidth;
            carouselRef.current.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
        }
    }, [activeAlbumIndex, albumsData.length]);
    
    return (
        <>
            <Navbar />
            <div className="mb-8">
                <h1 className="my-5 font-bold text-2xl">Featured Charts</h1>
                <div className="relative">
                    <div 
                        ref={carouselRef}
                        className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {albumsData.map((item, index) => (
                            <div
                                key={item._id}
                                onClick={() => {
                                    setActiveAlbumIndex(index);
                                    navigate(`/album/${item._id}`);
                                }}
                                className={`flex-shrink-0 w-[280px] p-4 rounded-lg cursor-pointer transition-all duration-500 snap-center ${
                                    index === activeAlbumIndex 
                                        ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 scale-110 shadow-2xl border-2 border-purple-500' 
                                        : 'bg-[#ffffff10] hover:bg-[#ffffff20] scale-90 opacity-60'
                                }`}
                            >
                                <img 
                                    className="rounded-lg w-full h-[280px] object-cover mb-4" 
                                    src={item.image} 
                                    alt={item.name} 
                                />
                                <p className="font-bold text-lg text-white truncate">{item.name}</p>
                                <p className="text-slate-200 text-sm mt-1 truncate">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    {/* Navigation dots */}
                    <div className="flex justify-center gap-2 mt-4">
                        {albumsData.slice(0, Math.min(albumsData.length, 10)).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveAlbumIndex(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === activeAlbumIndex 
                                        ? 'bg-purple-500 w-8' 
                                        : 'bg-gray-500 hover:bg-gray-400 w-2'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="mb-20">
                <h1 className="my-5 font-bold text-2xl">Today&apos;s biggest hits</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {songsData.slice(0, 5).map((item, index) => (
                        <SongsItem 
                            key={item._id} 
                            image={item.image} 
                            name={item.name} 
                            desc={item.desc} 
                            id={item._id} 
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default DisplayHome
