import React, { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { assets } from '../../assets/frontend-assets/assets';
import { PlayerContext } from '../../context/PlayerContext';
import OptimizedImage from '../common/OptimizedImage';

const DisplayAlbum = () => {
    const { id } = useParams();
    const { playWithId, albumsData, songsData, track, pause, playStatus } = useContext(PlayerContext);
    const [hoveredSongId, setHoveredSongId] = useState(null);

    const albumData = useMemo(() => {
        return albumsData.find((item) => item._id === id);
    }, [albumsData, id]);

    // Filter songs by album name
    const albumSongs = useMemo(() => {
        if (!albumData) return [];
        return songsData.filter((item) => item.album === albumData.name);
    }, [songsData, albumData]);

    if (!albumData) {
        return (
            <div className="pb-28">
                <Navbar />
                <div className="mt-8 flex gap-6 flex-col sm:flex-row animate-pulse">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 bg-neutral-800 rounded-lg" />
                    <div className="flex-1 space-y-3">
                        <div className="h-4 bg-neutral-800 rounded w-20" />
                        <div className="h-10 bg-neutral-800 rounded w-2/3" />
                        <div className="h-4 bg-neutral-800 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-28">
            <Navbar />
            
            {/* Header Hero */}
            <div className="mt-6 sm:mt-10 flex gap-6 sm:gap-8 flex-col sm:flex-row sm:items-end">
                <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-lg overflow-hidden shadow-2xl flex-shrink-0 self-center sm:self-auto">
                    <OptimizedImage
                        className="w-full h-full"
                        src={albumData.image} 
                        alt={albumData.name}
                        width={400}
                        height={400}
                    />
                </div>
                <div className="flex flex-col gap-2 text-center sm:text-left">
                    <p className='text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-400'>Album</p>
                    <h1 className='text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight'>{albumData.name}</h1>
                    <p className='text-neutral-300 text-sm sm:text-base mt-1'>{albumData.desc}</p>
                    <div className='flex items-center justify-center sm:justify-start gap-2 mt-2 text-xs sm:text-sm text-neutral-400'>
                        <span className="font-semibold text-white">Tunexia</span>
                        <span>•</span>
                        <span>{albumSongs.length} songs</span>
                    </div>
                </div>
            </div>

            {/* Play Button Bar */}
            <div className="mt-6 flex items-center gap-4">
                <button 
                    onClick={() => {
                        if (albumSongs.length > 0) {
                            if (track && track.album === albumData.name && playStatus) {
                                pause();
                            } else {
                                playWithId(albumSongs[0]._id);
                            }
                        }
                    }}
                    className='w-14 h-14 bg-green-500 hover:bg-green-400 hover:scale-105 active:scale-95 transition-all text-black rounded-full flex items-center justify-center shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/50 cursor-pointer'
                    aria-label="Play album"
                >
                    {track && track.album === albumData.name && playStatus ? (
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[36px_1fr_60px] sm:grid-cols-[40px_3fr_2fr_80px] mt-8 mb-2 px-3 text-neutral-400 text-xs font-semibold uppercase tracking-wider border-b border-neutral-800 pb-2">
                <span>#</span>
                <span>Title</span>
                <span className='hidden sm:block'>Album</span>
                <span className='text-right'>Duration</span>
            </div>

            {/* Songs List */}
            {albumSongs.length > 0 ? (
                <div className="space-y-1">
                    {albumSongs.map((item, index) => {
                        const isCurrentTrack = track && track._id === item._id;
                        return (
                            <div
                                key={item._id}
                                onClick={() => {
                                    if (isCurrentTrack && playStatus) {
                                        pause();
                                    } else {
                                        playWithId(item._id);
                                    }
                                }}
                                onMouseEnter={() => setHoveredSongId(item._id)}
                                onMouseLeave={() => setHoveredSongId(null)}
                                className={`grid grid-cols-[36px_1fr_60px] sm:grid-cols-[40px_3fr_2fr_80px] gap-2 p-2 sm:p-2.5 items-center rounded-lg cursor-pointer transition-colors ${
                                    isCurrentTrack ? 'bg-neutral-800/80 text-green-400' : 'hover:bg-neutral-800/50 text-neutral-300'
                                }`}
                                role="button"
                                tabIndex={0}
                                aria-label={`Play ${item.name}`}
                            >
                                {/* Track Number / Play Indicator */}
                                <div className='flex items-center justify-center text-xs'>
                                    {isCurrentTrack && playStatus ? (
                                        <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                                    ) : hoveredSongId === item._id ? (
                                        <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                    ) : (
                                        <span className="text-neutral-500 font-mono">{index + 1}</span>
                                    )}
                                </div>

                                {/* Title + Thumbnail */}
                                <div className='flex items-center gap-3 min-w-0'>
                                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                        <OptimizedImage
                                            className="w-full h-full"
                                            src={item.image}
                                            alt={item.name}
                                            width={60}
                                            height={60}
                                        />
                                    </div>
                                    <div className="min-w-0 truncate">
                                        <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-green-400' : 'text-white'}`}>
                                            {item.name}
                                        </p>
                                        <p className='text-xs text-neutral-400 truncate'>{item.desc}</p>
                                    </div>
                                </div>

                                {/* Album Name (Desktop) */}
                                <p className='text-xs text-neutral-400 truncate hidden sm:block'>{item.album}</p>

                                {/* Duration */}
                                <p className='text-xs text-neutral-400 text-right font-mono'>{item.duration}</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className='text-center text-neutral-500 py-12 text-sm'>No songs found in this album.</p>
            )}
        </div>
    );
};

export default React.memo(DisplayAlbum);
