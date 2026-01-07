import { useParams } from 'react-router-dom'
import Navbar from './Navbar'
import { assets } from '../../assets/frontend-assets/assets';
import { PlayerContext } from '../../context/PlayerContext';
import { useContext, useEffect, useState } from 'react';

const DisplayAlbum = () => {
    const { id } = useParams();
    const [albumData, setAlbumData] = useState(null);
    const { playWithId, albumsData, songsData, track, play, pause, playStatus } = useContext(PlayerContext);
    const [hoveredSongId, setHoveredSongId] = useState(null);

    useEffect(() => {
        const album = albumsData.find((item) => item._id === id);
        if (album) {
            setAlbumData(album);
        }
    }, [albumsData, id]);

    const handleMouseEnter = (songId) => {
        setHoveredSongId(songId);
    };

    const handleMouseLeave = () => {
        setHoveredSongId(null);
    };

    // Filter songs by album name
    const albumSongs = songsData.filter((item) => item.album === albumData?.name);

    return albumData ? (
        <>
            <Navbar />
            <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
                <img className='w-48 h-48 rounded object-cover shadow-2xl' src={albumData.image} alt={albumData.name} />
                <div className="flex flex-col gap-3">
                    <p className='text-sm font-semibold'>Playlist</p>
                    <h2 className='text-5xl font-bold mb-2 md:text-7xl'>{albumData.name}</h2>
                    <h4 className='text-slate-300'>{albumData.desc}</h4>
                    <p className='flex items-center gap-2 mt-2'>
                        <div className='flex items-center'>
                            <img className='inline-block w-5 mr-2' src={assets.spotify_logo} alt="spotify_logo" />
                            <b className='mr-2'>Spotify</b>
                        </div>
                        <div className='text-gray-300 text-sm flex items-center gap-1'>
                            <span>• 1,323,154 likes</span>
                            <b> • {albumSongs.length} songs </b>
                            <span>- about 2 hr. 30 min.</span>
                        </div>
                    </p>
                </div>
            </div>

            {/* Play button */}
            <div className="mt-6 flex items-center gap-5">
                <button 
                    onClick={() => albumSongs.length > 0 && playWithId(albumSongs[0]._id)}
                    className='bg-green-500 hover:bg-green-400 hover:scale-105 transition-all text-black rounded-full p-4'
                >
                    <img className='w-7 h-7' src={assets.play_icon} alt="play" />
                </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-3 sm:grid-cols-[0.5fr_2fr_2fr_0.5fr] mt-10 mb-4 pl-2 text-[#a7a7a7]">
                <p><b className='mr-4'>#</b>Title</p>
                <p>Album</p>
                <p className='hidden sm:block'>Date Added</p>
                <img className='m-auto w-4' src={assets.clock_icon} alt="clock_icon" />
            </div>
            <hr />

            {/* Songs list */}
            {albumSongs.length > 0 ? (
                albumSongs.map((item, index) => (
                    <div
                        key={item._id}
                        onClick={() => {
                            if (track._id === item._id && playStatus) {
                                pause();
                            } else {
                                playWithId(item._id);
                            }
                        }}
                        className="grid grid-cols-3 sm:grid-cols-[0.5fr_2fr_2fr_0.5fr] gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff26] cursor-pointer rounded-md"
                        onMouseEnter={() => handleMouseEnter(item._id)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Index/Play button column */}
                        <div className='flex items-center gap-4'>
                            {track._id === item._id && playStatus ? (
                                <img 
                                    className='w-5 h-5 object-contain' 
                                    src={hoveredSongId === item._id ? assets.pause_icon : assets.music_gif} 
                                    alt="playing" 
                                />
                            ) : hoveredSongId === item._id ? (
                                <img className='w-4 h-4' src={assets.play_icon} alt="play" />
                            ) : (
                                <b className='text-[#a7a7a7] w-4 text-center'>{index + 1}</b>
                            )}
                            <img 
                                className='w-10 h-10 rounded object-cover'
                                src={item.image}
                                alt={item.name}
                            />
                        </div>

                        {/* Song name */}
                        <p className='text-[15px] text-white font-medium'>{item.name}</p>

                        {/* Date added */}
                        <p className='text-[15px] hidden sm:block'>5 days ago</p>

                        {/* Duration */}
                        <p className='text-[15px] text-center'>{item.duration}</p>
                    </div>
                ))
            ) : (
                <p className='text-center text-gray-400 mt-10'>No songs in this album yet.</p>
            )}
        </>
    ) : null
}

export default DisplayAlbum
