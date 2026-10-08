import React, { useContext, useMemo } from 'react';
import Navbar from './Navbar';
import { PlayerContext } from '../../context/PlayerContext';
import OptimizedImage from '../common/OptimizedImage';

const Library = () => {
    const { songsData, likedSongs, playWithId, playStatus, pause, track } = useContext(PlayerContext);

    // Filter liked songs with useMemo
    const likedSongsData = useMemo(() => {
        return songsData.filter(song => likedSongs.includes(song._id));
    }, [songsData, likedSongs]);

    return (
        <div className="pb-28">
            <Navbar />

            {/* Library Header */}
            <div className="mt-6 sm:mt-10 flex gap-6 sm:gap-8 flex-col sm:flex-row sm:items-end">
                <div className="w-40 h-40 sm:w-52 sm:h-52 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0 self-center sm:self-auto">
                    <svg className="w-20 h-20 text-white fill-current drop-shadow-md" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </div>
                <div className="flex flex-col gap-2 text-center sm:text-left">
                    <p className='text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-400'>Playlist</p>
                    <h1 className='text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white'>Liked Songs</h1>
                    <p className='text-neutral-300 text-sm sm:text-base'>Your personal favorite collection</p>
                    <p className='text-xs sm:text-sm text-neutral-400 mt-1'>
                        <span className="font-semibold text-white">You</span>
                        <span> • {likedSongsData.length} saved {likedSongsData.length === 1 ? 'song' : 'songs'}</span>
                    </p>
                </div>
            </div>

            {/* Play All Button */}
            {likedSongsData.length > 0 && (
                <div className="mt-6 flex items-center gap-4">
                    <button
                        onClick={() => playWithId(likedSongsData[0]._id)}
                        className='w-14 h-14 bg-green-500 hover:bg-green-400 hover:scale-105 active:scale-95 transition-all text-black rounded-full flex items-center justify-center shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/50 cursor-pointer'
                        aria-label="Play all liked songs"
                    >
                        <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Songs List */}
            <div className="mt-8">
                {likedSongsData.length > 0 ? (
                    <div className="space-y-1">
                        {likedSongsData.map((item, index) => {
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
                                    className={`grid grid-cols-[36px_1fr_60px] sm:grid-cols-[40px_3fr_2fr_80px] gap-2 p-2 sm:p-2.5 items-center rounded-lg cursor-pointer transition-colors ${
                                        isCurrentTrack ? 'bg-neutral-800/80 text-green-400' : 'hover:bg-neutral-800/50 text-neutral-300'
                                    }`}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Play ${item.name}`}
                                >
                                    <span className="text-neutral-500 text-xs font-mono text-center">
                                        {isCurrentTrack && playStatus ? '▶' : index + 1}
                                    </span>
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
                                    <p className='text-xs text-neutral-400 truncate hidden sm:block'>{item.album}</p>
                                    <p className='text-xs text-neutral-400 text-right font-mono'>{item.duration}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-neutral-900/40 rounded-xl border border-neutral-800/60 mt-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-500">
                            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </div>
                        <p className="text-xl font-bold text-white mb-2">No liked songs yet</p>
                        <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                            Tap the heart icon on any song while playing to save it here for quick listening.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(Library);
