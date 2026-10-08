import React, { useContext } from 'react';
import { assets } from '../../assets/frontend-assets/assets';
import { PlayerContext } from '../../context/PlayerContext';
import OptimizedImage from '../common/OptimizedImage';

function Player() {
    const {
        track, seekBar, seekBg, play, pause, playStatus, time, nextSong, previusSong,
        seekSong, toggleLoop, isLooping, isShuffle, toggleShuffle, volume, handleVolumeChange,
        isMuted, toggleMute, likedSongs, toggleLike, isLoadingAudio,
        isPlayerExpanded, setIsPlayerExpanded
    } = useContext(PlayerContext);

    if (!track) return null;

    const isLiked = likedSongs.includes(track._id);

    const getProviderAttribution = (source) => {
        switch (source) {
            case 'deezer': return 'Music via Deezer';
            case 'itunes': return 'Music via Apple';
            case 'jamendo': return 'Music via Jamendo';
            case 'audius': return 'Music via Audius';
            default: return null;
        }
    };

    return (
        <>
            {/* FULL-SCREEN MOBILE NOW PLAYING SHEET */}
            {isPlayerExpanded && (
                <div 
                    className="fixed inset-0 z-50 bg-gradient-to-b from-neutral-900 via-black to-black text-white flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-bottom duration-300"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Now Playing"
                >
                    {/* Top Bar: Collapse Button & Title */}
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => setIsPlayerExpanded(false)}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 transition-all text-neutral-300"
                            aria-label="Minimize player"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="text-center">
                            <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Playing from Album</p>
                            <p className="text-sm font-bold truncate max-w-[200px]">{track.album || 'Tunexia'}</p>
                        </div>
                        <button
                            onClick={() => toggleLike(track._id)}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 transition-all"
                            aria-label={isLiked ? "Unlike song" : "Like song"}
                        >
                            <svg 
                                className={`w-6 h-6 ${isLiked ? 'fill-green-500 text-green-500' : 'fill-none text-neutral-300'} stroke-current`} 
                                viewBox="0 0 24 24" 
                                strokeWidth="2"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                        </button>
                    </div>

                    {/* Centered Large Album Artwork */}
                    <div className="my-auto w-full max-w-[320px] aspect-square mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <OptimizedImage
                            className="w-full h-full"
                            src={track.image}
                            alt={track.name}
                            width={400}
                            height={400}
                        />
                    </div>

                    {/* Track Info */}
                    <div className="w-full max-w-md mx-auto mb-2">
                        <div className="flex items-center justify-between mb-4">
                            <div className="min-w-0 pr-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-white truncate">{track.name}</h2>
                                    {track.previewOnly && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                                            30s Preview
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-neutral-400 truncate">{track.desc || track.album}</p>
                                {getProviderAttribution(track.source) && (
                                    <p className="text-[11px] text-neutral-500 font-medium mt-1 tracking-wide">
                                        {getProviderAttribution(track.source)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Large Touch Scrubber */}
                        <div className="space-y-1 mb-4">
                            <div 
                                onClick={seekSong}
                                onTouchStart={seekSong}
                                className="w-full h-3 py-1 cursor-pointer flex items-center group"
                            >
                                <div className="w-full bg-neutral-700/80 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="h-full bg-green-500 rounded-full" 
                                        style={{ 
                                            width: `${((time.currentTime.minute * 60 + time.currentTime.second) / Math.max(1, (time.totalTime.minute * 60 + time.totalTime.second))) * 100}%` 
                                        }} 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs font-mono text-neutral-400">
                                <span>{time.currentTime.minute}:{time.currentTime.second < 10 ? `0${time.currentTime.second}` : time.currentTime.second}</span>
                                <span>{time.totalTime.minute}:{time.totalTime.second < 10 ? `0${time.totalTime.second}` : time.totalTime.second}</span>
                            </div>
                        </div>

                        {/* Large Controls */}
                        <div className="flex items-center justify-between px-2 mb-4">
                            <button 
                                onClick={toggleShuffle} 
                                className={`w-11 h-11 flex items-center justify-center transition-opacity ${isShuffle ? 'text-green-400 opacity-100' : 'text-neutral-400 opacity-60'}`}
                                aria-label="Toggle shuffle"
                            >
                                <img className="w-5 h-5" src={assets.shuffle_icon} alt="" />
                            </button>
                            <button 
                                onClick={previusSong} 
                                className="w-12 h-12 flex items-center justify-center active:scale-95 transition-transform"
                                aria-label="Previous song"
                            >
                                <img className="w-6 h-6" src={assets.prev_icon} alt="" />
                            </button>
                            <button 
                                onClick={playStatus ? pause : play} 
                                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-95 transition-transform"
                                aria-label={playStatus ? "Pause" : "Play"}
                            >
                                {isLoadingAudio ? (
                                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : playStatus ? (
                                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                ) : (
                                    <svg className="w-7 h-7 fill-current ml-1" viewBox="0 0 24 24">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                )}
                            </button>
                            <button 
                                onClick={nextSong} 
                                className="w-12 h-12 flex items-center justify-center active:scale-95 transition-transform"
                                aria-label="Next song"
                            >
                                <img className="w-6 h-6" src={assets.next_icon} alt="" />
                            </button>
                            <button 
                                onClick={toggleLoop} 
                                className={`w-11 h-11 flex items-center justify-center transition-opacity ${isLooping ? 'text-green-400 opacity-100' : 'text-neutral-400 opacity-60'}`}
                                aria-label="Toggle loop"
                            >
                                <img className="w-5 h-5" src={assets.loop_icon} alt="" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTTOM STICKY BAR (DESKTOP & MOBILE MINI-PLAYER) */}
            <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 text-white px-3 sm:px-6 py-2">
                {/* Thin mobile progress bar on top edge */}
                <div 
                    onClick={seekSong}
                    onTouchStart={seekSong}
                    className="block lg:hidden absolute top-0 left-0 right-0 h-1 bg-neutral-800 cursor-pointer"
                >
                    <div 
                        className="h-full bg-green-500" 
                        style={{ 
                            width: `${((time.currentTime.minute * 60 + time.currentTime.second) / Math.max(1, (time.totalTime.minute * 60 + time.totalTime.second))) * 100}%` 
                        }} 
                    />
                </div>

                <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto h-14 sm:h-16">
                    {/* Track Info (Clickable on Mobile to Expand) */}
                    <div 
                        onClick={() => setIsPlayerExpanded(true)}
                        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 lg:flex-initial lg:w-[280px]"
                        role="button"
                        aria-label="Expand player"
                    >
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded overflow-hidden flex-shrink-0 shadow-md">
                            <OptimizedImage
                                className="w-full h-full"
                                src={track.image}
                                alt={track.name}
                                width={60}
                                height={60}
                            />
                        </div>
                        <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-xs sm:text-sm text-white truncate">{track.name}</p>
                                {track.previewOnly && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                                        Preview
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
                                {track.desc || track.album}
                                {getProviderAttribution(track.source) ? ` • ${getProviderAttribution(track.source)}` : ''}
                            </p>
                        </div>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleLike(track._id); }}
                            className="w-10 h-10 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform flex-shrink-0"
                            aria-label={isLiked ? "Unlike" : "Like"}
                        >
                            <svg 
                                className={`w-5 h-5 ${isLiked ? 'fill-green-500 text-green-500' : 'fill-none text-neutral-400'} stroke-current`} 
                                viewBox="0 0 24 24" 
                                strokeWidth="2"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop Center Controls */}
                    <div className="hidden lg:flex flex-col items-center gap-1.5 flex-1 max-w-xl mx-auto">
                        <div className="flex items-center gap-5">
                            <button 
                                onClick={toggleShuffle} 
                                className={`w-8 h-8 flex items-center justify-center cursor-pointer transition-opacity ${isShuffle ? 'opacity-100 text-green-400' : 'opacity-40 hover:opacity-100'}`}
                                aria-label="Shuffle"
                            >
                                <img className="w-4 h-4" src={assets.shuffle_icon} alt="" />
                            </button>
                            <button 
                                onClick={previusSong} 
                                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                                aria-label="Previous"
                            >
                                <img className="w-4 h-4" src={assets.prev_icon} alt="" />
                            </button>
                            <button 
                                onClick={playStatus ? pause : play} 
                                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-md"
                                aria-label={playStatus ? "Pause" : "Play"}
                            >
                                {playStatus ? (
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                )}
                            </button>
                            <button 
                                onClick={nextSong} 
                                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                                aria-label="Next"
                            >
                                <img className="w-4 h-4" src={assets.next_icon} alt="" />
                            </button>
                            <button 
                                onClick={toggleLoop} 
                                className={`w-8 h-8 flex items-center justify-center cursor-pointer transition-opacity ${isLooping ? 'opacity-100 text-green-400' : 'opacity-40 hover:opacity-100'}`}
                                aria-label="Loop"
                            >
                                <img className="w-4 h-4" src={assets.loop_icon} alt="" />
                            </button>
                        </div>
                        {/* Desktop Scrubber */}
                        <div className="flex items-center gap-3 w-full text-xs font-mono text-neutral-400">
                            <span className="w-8 text-right">{time.currentTime.minute}:{time.currentTime.second < 10 ? `0${time.currentTime.second}` : time.currentTime.second}</span>
                            <div 
                                ref={seekBg} 
                                onClick={seekSong} 
                                onTouchStart={seekSong}
                                className="flex-1 bg-neutral-700/60 rounded-full cursor-pointer h-1.5 flex items-center relative group"
                            >
                                <div ref={seekBar} className="h-full bg-green-500 rounded-full w-0 group-hover:bg-green-400 transition-colors" />
                            </div>
                            <span className="w-8 text-left">{time.totalTime.minute}:{time.totalTime.second < 10 ? `0${time.totalTime.second}` : time.totalTime.second}</span>
                        </div>
                    </div>

                    {/* Mobile Quick Action Buttons (Play/Pause & Next) */}
                    <div className="flex lg:hidden items-center gap-1">
                        <button 
                            onClick={playStatus ? pause : play} 
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-black active:scale-90 transition-transform shadow-md"
                            aria-label={playStatus ? "Pause" : "Play"}
                        >
                            {playStatus ? (
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <rect x="6" y="4" width="4" height="16" />
                                    <rect x="14" y="4" width="4" height="16" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            )}
                        </button>
                        <button 
                            onClick={nextSong} 
                            className="w-11 h-11 flex items-center justify-center text-neutral-300 active:scale-90 transition-transform"
                            aria-label="Next track"
                        >
                            <img className="w-5 h-5" src={assets.next_icon} alt="" />
                        </button>
                    </div>

                    {/* Desktop Right Controls (Volume) */}
                    <div className="hidden lg:flex items-center justify-end gap-2.5 w-[280px]">
                        <button 
                            onClick={toggleMute} 
                            className="w-8 h-8 flex items-center justify-center cursor-pointer text-neutral-400 hover:text-white"
                            aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                            <img className="w-4 h-4" src={!isMuted && volume !== 0 ? assets.volume_icon : assets.speaker_icon} alt="" />
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.02"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1 accent-green-500 bg-neutral-700 rounded-lg cursor-pointer"
                            aria-label="Volume slider"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default React.memo(Player);
