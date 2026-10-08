import React, { useContext, useMemo, useState } from "react";
import AlbumItem from "./AlbumItem";
import Navbar from "./Navbar";
import SongsItem from "./Songitem";
import { PlayerContext } from '../../context/PlayerContext';
import OptimizedImage from "../common/OptimizedImage";

const HomeSectionSkeleton = ({ title }) => (
    <div className="mb-8">
        <div className="h-7 w-48 bg-neutral-800 rounded my-5 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-neutral-900/60 p-3 sm:p-4 rounded-lg animate-pulse">
                    <div className="aspect-square bg-neutral-800 rounded-md mb-3" />
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
                </div>
            ))}
        </div>
    </div>
);

const CATEGORY_TABS = [
    { key: 'all', label: 'All Tracks' },
    { key: 'english-full', label: 'English Full Songs' },
    { key: 'hindi-trending', label: 'Hindi Trending' },
    { key: 'kannada-devotional', label: 'Kannada Devotional' },
    { key: 'punjabi-pop', label: 'Punjabi Pop' },
    { key: 'lofi-chill', label: 'Lo-Fi Chill' },
    { key: 'liked', label: '❤️ Liked Songs' }
];

function DisplayHome() {
    const { songsData, albumsData, searchQuery, likedSongs, playWithId, track, playStatus, pause, play } = useContext(PlayerContext);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [songDisplayLimit, setSongDisplayLimit] = useState(15);

    // Filter songs based on search & category
    const filteredSongs = useMemo(() => {
        let result = songsData;

        // Apply category filter
        if (selectedCategory === 'liked') {
            result = result.filter(s => likedSongs.includes(s._id));
        } else if (selectedCategory === 'english-full') {
            result = result.filter(s => !s.previewOnly && (s.category === 'english-hits' || s.album?.toLowerCase().includes('english')));
        } else if (selectedCategory !== 'all') {
            result = result.filter(s => s.category === selectedCategory);
        }

        // Apply search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.desc.toLowerCase().includes(q) ||
                s.album.toLowerCase().includes(q)
            );
        }

        return result;
    }, [songsData, searchQuery, selectedCategory, likedSongs]);

    // Filter albums based on search & category
    const filteredAlbums = useMemo(() => {
        let result = albumsData;

        if (selectedCategory === 'english-full') {
            result = result.filter(a => a.name.toLowerCase().includes('english'));
        } else if (selectedCategory === 'hindi-trending') {
            result = result.filter(a => a.name.toLowerCase().includes('hindi'));
        } else if (selectedCategory === 'kannada-devotional') {
            result = result.filter(a => a.name.toLowerCase().includes('kannada') || a.name.toLowerCase().includes('devotional'));
        } else if (selectedCategory === 'lofi-chill') {
            result = result.filter(a => a.name.toLowerCase().includes('lo-fi'));
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.desc.toLowerCase().includes(q)
            );
        }

        return result;
    }, [albumsData, searchQuery, selectedCategory]);

    // Quick Picks (first 6 prominent tracks)
    const quickPicks = useMemo(() => {
        return songsData.slice(0, 6);
    }, [songsData]);

    const isLoading = songsData.length === 0 && albumsData.length === 0;

    return (
        <div className="pb-28">
            <Navbar />

            {isLoading ? (
                <>
                    <HomeSectionSkeleton title="Featured Charts" />
                    <HomeSectionSkeleton title="Today's biggest hits" />
                </>
            ) : (
                <>
                    {/* Category Filter Pills Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3 sticky top-0 bg-black/60 backdrop-blur-md z-20">
                        {CATEGORY_TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => { setSelectedCategory(tab.key); setSongDisplayLimit(15); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                                    selectedCategory === tab.key
                                        ? 'bg-white text-black shadow-lg scale-105'
                                        : 'bg-neutral-800/90 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                                }`}
                            >
                                {tab.label}
                                {tab.key === 'liked' && likedSongs.length > 0 && ` (${likedSongs.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Search Notice */}
                    {searchQuery.trim() && (
                        <div className="my-4">
                            <h2 className="text-xl font-bold text-white mb-1">Search Results for &ldquo;{searchQuery}&rdquo;</h2>
                            <p className="text-sm text-neutral-400">Found {filteredSongs.length} songs and {filteredAlbums.length} albums</p>
                        </div>
                    )}

                    {/* Spotify-style "Quick Picks / Jump Back In" Grid (when not actively searching) */}
                    {!searchQuery.trim() && selectedCategory === 'all' && quickPicks.length > 0 && (
                        <section className="mt-4 mb-8" aria-label="Quick Picks">
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                                <span>Good Evening</span>
                                <span className="text-xs font-normal text-neutral-400 px-2 py-0.5 rounded-full bg-neutral-800 border border-white/5">
                                    Quick Play
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                                {quickPicks.map(song => {
                                    const isCurrent = track && track._id === song._id;
                                    const isPlayingThis = isCurrent && playStatus;

                                    return (
                                        <div
                                            key={song._id}
                                            onClick={() => playWithId(song._id)}
                                            className="flex items-center gap-3 bg-neutral-900/70 hover:bg-neutral-800 rounded-md overflow-hidden transition-all duration-200 group cursor-pointer border border-white/5 pr-3 shadow-md"
                                        >
                                            <div className="w-14 h-14 flex-shrink-0 relative">
                                                <OptimizedImage
                                                    src={song.image}
                                                    alt={song.name}
                                                    className="w-full h-full object-cover"
                                                    width={56}
                                                    height={56}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-xs sm:text-sm truncate ${isCurrent ? 'text-green-400' : 'text-white'}`}>
                                                    {song.name}
                                                </p>
                                                <p className="text-[11px] text-neutral-400 truncate">{song.desc || song.album}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isPlayingThis) pause();
                                                    else if (isCurrent) play();
                                                    else playWithId(song._id);
                                                }}
                                                className={`w-9 h-9 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer ${
                                                    isPlayingThis ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                                                }`}
                                                aria-label={isPlayingThis ? "Pause" : "Play"}
                                            >
                                                {isPlayingThis ? (
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
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Featured Charts / Albums Section */}
                    {filteredAlbums.length > 0 && (
                        <section className="mb-8" aria-label="Featured Charts">
                            <div className="flex items-center justify-between my-4">
                                <h2 className="font-bold text-xl sm:text-2xl text-white">
                                    {searchQuery.trim() ? "Matching Albums" : "Featured Charts & Albums"}
                                </h2>
                                <span className="text-xs font-semibold text-neutral-400">
                                    {filteredAlbums.length} {filteredAlbums.length === 1 ? 'Album' : 'Albums'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {filteredAlbums.map((item) => (
                                    <AlbumItem 
                                        key={item._id} 
                                        image={item.image} 
                                        name={item.name} 
                                        desc={item.desc} 
                                        id={item._id} 
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Songs Grid Section */}
                    {filteredSongs.length > 0 && (
                        <section className="mb-8" aria-label="Songs">
                            <div className="flex items-center justify-between my-4">
                                <h2 className="font-bold text-xl sm:text-2xl text-white">
                                    {searchQuery.trim() 
                                        ? "Matching Songs" 
                                        : selectedCategory === 'english-full' 
                                            ? "English Full Songs Collection" 
                                            : selectedCategory === 'liked'
                                                ? "Your Liked Collection"
                                                : "Today's Biggest Hits"}
                                </h2>
                                <span className="text-xs font-semibold text-neutral-400">
                                    Showing {Math.min(songDisplayLimit, filteredSongs.length)} of {filteredSongs.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {filteredSongs.slice(0, songDisplayLimit).map((item) => (
                                    <SongsItem 
                                        key={item._id} 
                                        image={item.image} 
                                        name={item.name} 
                                        desc={item.desc} 
                                        id={item._id} 
                                    />
                                ))}
                            </div>

                            {/* Show More Button */}
                            {filteredSongs.length > songDisplayLimit && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => setSongDisplayLimit(prev => prev + 20)}
                                        className="px-6 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs active:scale-95 transition-all shadow-md cursor-pointer border border-white/5"
                                    >
                                        Load More Songs ({filteredSongs.length - songDisplayLimit} remaining)
                                    </button>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Empty State */}
                    {filteredSongs.length === 0 && filteredAlbums.length === 0 && (
                        <div className="text-center py-20 text-neutral-400">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center text-2xl">
                                🎵
                            </div>
                            <p className="text-lg font-semibold text-white mb-1">
                                {searchQuery.trim() 
                                    ? `No results found for "${searchQuery}"` 
                                    : "No tracks found in this category"}
                            </p>
                            <p className="text-sm text-neutral-500">
                                {searchQuery.trim() 
                                    ? "Try searching for a different song, artist, or album."
                                    : "Try selecting 'All Tracks' or explore our featured albums."}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default React.memo(DisplayHome);
