import { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { url } from '../config';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBar = useRef();
    const seekBg = useRef();

    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [originalSongsData, setOriginalSongsData] = useState([]);
    const [isShuffle, setIsShuffle] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0
        },
        totalTime: {
            second: 0,
            minute: 0
        }
    });

    // Liked songs state
    const [likedSongs, setLikedSongs] = useState(() => {
        const saved = localStorage.getItem('likedSongs');
        return saved ? JSON.parse(saved) : [];
    });

    // Toggle like
    const toggleLike = (songId) => {
        setLikedSongs(prev => {
            const newLiked = prev.includes(songId)
                ? prev.filter(id => id !== songId)
                : [...prev, songId];
            localStorage.setItem('likedSongs', JSON.stringify(newLiked));
            return newLiked;
        });
    };

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            audioRef.current.volume = 0;
            setVolume(0);
        } else {
            audioRef.current.volume = 0.5;
            setVolume(0.5);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.ontimeupdate = () => {
                    seekBar.current.style.width = (Math.floor(audioRef.current.currentTime / audioRef.current.duration * 100)) + "%";
                    setTime({
                        currentTime: {
                            second: Math.floor(audioRef.current.currentTime % 60),
                            minute: Math.floor(audioRef.current.currentTime / 60)
                        },
                        totalTime: {
                            second: Math.floor(audioRef.current.duration % 60),
                            minute: Math.floor(audioRef.current.duration / 60)
                        }
                    })
                }
            }
        }, 1000)

    }, [audioRef])

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    }

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    }

    const toggleLoop = () => {
        setIsLooping(!isLooping);
    };

    const toggleShuffle = () => {
        setIsShuffle(!isShuffle);
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.loop = isLooping;
        }
    }, [isLooping]);

    const shuffleSongs = () => {
        const shuffledSongs = [...songsData];
        for (let i = shuffledSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
        }
        setSongsData(shuffledSongs);
    }

    useEffect(() => {
        if (isShuffle) {
            shuffleSongs();
        } else {
            setSongsData(originalSongsData);
        }
    }, [isShuffle, originalSongsData]);

    const playWithId = async (id) => {
        await songsData.map((item) => {
            if (id === item._id) {
                setTrack(item);
            }
        })
        await audioRef.current.play();
        setPlayStatus(true);
    }

    const previusSong = async () => {
        songsData.map(async (item, index) => {
            if (track._id === item._id && index > 0) {
                await setTrack(songsData[index - 1]);
                await audioRef.current.play();
                setPlayStatus(true);
            }
        })
    }

    const nextSong = async () => {
        songsData.map(async (item, index) => {
            if (track._id === item._id && index < songsData.length - 1) {
                await setTrack(songsData[index + 1]);
                await audioRef.current.play();
                setPlayStatus(true);
            }
        })
    }

    const seekSong = async (e) => {
        audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration)
    }

    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            setSongsData(response.data.songs);
            setTrack(response.data.songs[0]);
            setOriginalSongsData(response.data.songs);
        } catch (error) {
            console.log('error getSongsData', error);
        }
    }

    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums);
        } catch (error) {
            console.log('error getAlbumsData', error);
        }
    }

    useEffect(() => {
        getAlbumsData();
        getSongsData();
    }, [])

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        previusSong, nextSong,
        seekSong,
        songsData, albumsData,
        isLooping, toggleLoop,
        isShuffle, toggleShuffle,
        volume, handleVolumeChange,
        isMuted, toggleMute,
        likedSongs, toggleLike
    }

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    )

}

export default PlayerContextProvider
