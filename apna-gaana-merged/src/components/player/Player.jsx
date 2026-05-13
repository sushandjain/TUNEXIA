import { useContext } from 'react';
import { assets } from '../../assets/frontend-assets/assets';
import { PlayerContext } from '../../context/PlayerContext';

function Player() {

    const { track, seekBar, seekBg, play, pause, playStatus, time, nextSong, previusSong,
        seekSong, toggleLoop, isLooping, isShuffle, toggleShuffle, volume, handleVolumeChange,
        isMuted, toggleMute, likedSongs, toggleLike } = useContext(PlayerContext)

    const isLiked = track && likedSongs.includes(track._id);

    return track ? (
        <div className="h-[10%] bg-black flex justify-between items-center text-white px-2 lg:px-4">
            <div className="flex items-center gap-2 lg:gap-4 w-[25%] lg:w-auto overflow-hidden">
                <img className="w-8 h-8 lg:w-12 lg:h-12 rounded" src={track.image} alt="song img" />
                <div className="hidden sm:block">
                    <p className="font-semibold text-sm lg:text-base truncate w-20 lg:w-auto">{track.name}</p>
                    <p className="text-xs text-gray-400 truncate w-20 lg:w-auto">{track.desc}</p>
                </div>
                <button 
                    onClick={() => toggleLike(track._id)}
                    className='ml-1 lg:ml-2 hover:scale-110 transition-all'
                >
                    <svg 
                        className={`w-5 h-5 ${isLiked ? 'fill-green-500' : 'fill-none'} stroke-current`} 
                        viewBox="0 0 24 24" 
                        strokeWidth="2"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                </button>
            </div>
            <div className="flex flex-col items-center gap-1 w-[50%] lg:w-auto m-auto">
                <div className="flex gap-2 lg:gap-4 items-center">
                    <img onClick={toggleShuffle} className={!isShuffle ? "w-4 cursor-pointer opacity-40 hover:opacity-100" : "w-4 cursor-pointer"} src={assets.shuffle_icon} alt="shuffle_icon" />
                    <img onClick={previusSong} className='w-4 cursor-pointer hover:scale-110' src={assets.prev_icon} alt="prev_icon" />
                    {!playStatus ? (
                        <img onClick={play} className='w-4 lg:w-6 h-4 lg:h-6 cursor-pointer hover:scale-110' src={assets.play_icon} alt="play_icon" />
                    ) : (
                        <img onClick={pause} className='w-4 lg:w-6 h-4 lg:h-6 cursor-pointer hover:scale-110' src={assets.pause_icon} alt="pause_icon" />
                    )}
                    <img onClick={nextSong} className='w-4 cursor-pointer hover:scale-110' src={assets.next_icon} alt="next_icon" />
                    <img onClick={toggleLoop} className={isLooping ? "w-4 cursor-pointer" : "w-4 cursor-pointer opacity-40 hover:opacity-100"} src={assets.loop_icon} alt="loop_icon" />
                </div>
                <div className="flex items-center gap-2 lg:gap-5 w-full justify-center text-xs lg:text-sm mt-1">
                    <p className="w-10 text-right">{time.currentTime.minute}:{time.currentTime.second < 10 ? `0${time.currentTime.second}` : time.currentTime.second}</p>
                    <div ref={seekBg} onClick={seekSong} className='w-full max-w-[500px] bg-gray-600 rounded-full cursor-pointer h-1 flex items-center'>
                        <hr ref={seekBar} className='h-1 border-none w-0 bg-green-500 rounded-full' />
                    </div>
                    <p className="w-10 text-left">{time.totalTime.minute}:{time.totalTime.second < 10 ? `0${time.totalTime.second}` : time.totalTime.second}</p>
                </div>
            </div>
            <div className="hidden lg:flex flex-1 justify-end items-center gap-2 opacity-75">
                <img className='w-4' src={assets.plays_icon} alt="plays_icon" />
                <img className='w-4' src={assets.mic_icon} alt="mic_icon" />
                <img className='w-4' src={assets.queue_icon} alt="queue_icon" />
                <img className='w-4' src={assets.speaker_icon} alt="speaker_icon" />
                <img onClick={toggleMute} className='w-4 cursor-pointer' src={!isMuted && volume !== 0 ? assets.volume_icon : assets.mute_icon} alt="volume_icon" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="bg-gray-300 appearance-auto h-1 w-20 opacity-70 hover:opacity-100 rounded-lg cursor-pointer"
                />
                <img className='w-4' src={assets.mini_player_icon} alt="mini_player_icon" />
                <img className='w-4' src={assets.zoom_icon} alt="zoom_icon" />
            </div>
        </div>
    ) : null
}

export default Player
