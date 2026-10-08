import { createContext, useEffect, useRef, useState, useCallback } from "react";
import axios from 'axios';
import { url } from '../config';
import { toast } from 'react-toastify';

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
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    // Liked songs state (persisted)
    const [likedSongs, setLikedSongs] = useState(() => {
        try {
            const saved = localStorage.getItem('likedSongs');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const toggleLike = useCallback((songId) => {
        setLikedSongs(prev => {
            const newLiked = prev.includes(songId)
                ? prev.filter(id => id !== songId)
                : [...prev, songId];
            try {
                localStorage.setItem('likedSongs', JSON.stringify(newLiked));
            } catch (e) {
                console.warn('Failed to save likedSongs', e);
            }
            return newLiked;
        });
    }, []);

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            if (!isMuted) {
                audioRef.current.volume = 0;
            } else {
                audioRef.current.volume = volume || 0.7;
            }
        }
    };

    // Time update listener
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => {
            if (seekBar.current && audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                seekBar.current.style.width = `${percent}%`;
            }
            setTime({
                currentTime: {
                    second: Math.floor(audio.currentTime % 60),
                    minute: Math.floor(audio.currentTime / 60)
                },
                totalTime: {
                    second: Math.floor((audio.duration || 0) % 60),
                    minute: Math.floor((audio.duration || 0) / 60)
                }
            });
        };

        const onWaiting = () => setIsLoadingAudio(true);
        const onPlaying = () => {
            setIsLoadingAudio(false);
            setPlayStatus(true);
        };
        const onPause = () => setPlayStatus(false);
        const onEnded = () => {
            if (!isLooping) {
                nextSong();
            }
        };

        const onError = (e) => {
            console.warn('Audio playback error on track:', track?.name, e);
            setIsLoadingAudio(false);
            setPlayStatus(false);
            if (track) {
                toast.info(`Playback error on "${track.name}". Skipping to next track...`);
                setTimeout(() => {
                    nextSong();
                }, 1000);
            }
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('waiting', onWaiting);
            audio.removeEventListener('playing', onPlaying);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    }, [isLooping, songsData, track]);

    const play = async () => {
        if (audioRef.current) {
            try {
                await audioRef.current.play();
                setPlayStatus(true);
            } catch (e) {
                console.warn('Playback play() was blocked or interrupted:', e);
            }
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setPlayStatus(false);
        }
    };

    const toggleLoop = () => {
        setIsLooping(!isLooping);
    };

    const toggleShuffle = () => {
        setIsShuffle(!isShuffle);
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.loop = isLooping;
        }
    }, [isLooping]);

    useEffect(() => {
        if (isShuffle) {
            const shuffled = [...songsData];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setSongsData(shuffled);
        } else {
            setSongsData(originalSongsData);
        }
    }, [isShuffle, originalSongsData]);

    const playWithId = async (id) => {
        const song = songsData.find((item) => item._id === id);
        if (!song) return;
        setTrack(song);
        setIsLoadingAudio(true);
        setTimeout(async () => {
            try {
                if (audioRef.current) {
                    await audioRef.current.play();
                    setPlayStatus(true);
                }
            } catch (e) {
                console.warn('playWithId play error:', e);
            } finally {
                setIsLoadingAudio(false);
            }
        }, 100);
    };

    const previusSong = async () => {
        if (!track || songsData.length === 0) return;
        const index = songsData.findIndex((item) => item._id === track._id);
        const prevIndex = index > 0 ? index - 1 : songsData.length - 1;
        setTrack(songsData[prevIndex]);
        setTimeout(async () => {
            try {
                if (audioRef.current) {
                    await audioRef.current.play();
                    setPlayStatus(true);
                }
            } catch (e) {
                console.warn('previusSong error:', e);
            }
        }, 100);
    };

    const nextSong = async () => {
        if (!track || songsData.length === 0) return;
        const index = songsData.findIndex((item) => item._id === track._id);
        const nextIndex = index < songsData.length - 1 ? index + 1 : 0;
        setTrack(songsData[nextIndex]);
        setTimeout(async () => {
            try {
                if (audioRef.current) {
                    await audioRef.current.play();
                    setPlayStatus(true);
                }
            } catch (e) {
                console.warn('nextSong error:', e);
            }
        }, 100);
    };

    // Mobile + Desktop touch/click seek handler
    const seekSong = (e) => {
        if (!seekBg.current || !audioRef.current || !audioRef.current.duration) return;
        const rect = seekBg.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audioRef.current.currentTime = ratio * audioRef.current.duration;
    };

    // Stale-While-Revalidate data fetching
    const getSongsData = async () => {
        try {
            const cached = sessionStorage.getItem('tunexia_songs_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setSongsData(parsed);
                    setOriginalSongsData(parsed);
                    setTrack(parsed[0]);
                }
            }

            const response = await axios.get(`${url}/api/song/list`);
            if (response.data.success && response.data.songs) {
                setSongsData(response.data.songs);
                setOriginalSongsData(response.data.songs);
                sessionStorage.setItem('tunexia_songs_cache', JSON.stringify(response.data.songs));
                if (!track) {
                    setTrack(response.data.songs[0]);
                }
            }
        } catch (error) {
            console.error('getSongsData error:', error);
        }
    };

    const getAlbumsData = async () => {
        try {
            const cached = sessionStorage.getItem('tunexia_albums_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setAlbumsData(parsed);
                }
            }

            const response = await axios.get(`${url}/api/album/list`);
            if (response.data.success && response.data.albums) {
                setAlbumsData(response.data.albums);
                sessionStorage.setItem('tunexia_albums_cache', JSON.stringify(response.data.albums));
            }
        } catch (error) {
            console.error('getAlbumsData error:', error);
        }
    };

    useEffect(() => {
        getAlbumsData();
        getSongsData();
    }, []);

    // Media Session API integration for lock-screen & mobile system controls
    useEffect(() => {
        if ('mediaSession' in navigator && track) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.name,
                artist: track.desc || 'Tunexia Music',
                album: track.album || 'Tunexia',
                artwork: [
                    { src: track.image, sizes: '96x96', type: 'image/jpeg' },
                    { src: track.image, sizes: '256x256', type: 'image/jpeg' },
                    { src: track.image, sizes: '512x512', type: 'image/jpeg' }
                ]
            });

            try {
                navigator.mediaSession.setActionHandler('play', () => play());
                navigator.mediaSession.setActionHandler('pause', () => pause());
                navigator.mediaSession.setActionHandler('previoustrack', () => previusSong());
                navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
            } catch (e) {
                console.warn('MediaSession handler setup error:', e);
            }
        }
    }, [track]);

    useEffect(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = playStatus ? 'playing' : 'paused';
        }
    }, [playStatus]);

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
        likedSongs, toggleLike,
        isLoadingAudio,
        searchQuery, setSearchQuery,
        isPlayerExpanded, setIsPlayerExpanded
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
