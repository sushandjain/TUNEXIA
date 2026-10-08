import React, { useContext, useMemo } from "react";
import AlbumItem from "./AlbumItem";
import Navbar from "./Navbar";
import SongsItem from "./Songitem";
import { PlayerContext } from '../../context/PlayerContext';

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

function DisplayHome() {
    const { songsData, albumsData, searchQuery } = useContext(PlayerContext);

    const filteredSongs = useMemo(() => {
        if (!searchQuery.trim()) return songsData;
        const q = searchQuery.toLowerCase();
        return songsData.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.desc.toLowerCase().includes(q) ||
            s.album.toLowerCase().includes(q)
        );
    }, [songsData, searchQuery]);

    const filteredAlbums = useMemo(() => {
        if (!searchQuery.trim()) return albumsData;
        const q = searchQuery.toLowerCase();
        return albumsData.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.desc.toLowerCase().includes(q)
        );
    }, [albumsData, searchQuery]);

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
                    {searchQuery.trim() && (
                        <div className="my-4">
                            <h2 className="text-xl font-bold text-white mb-2">Search Results for &ldquo;{searchQuery}&rdquo;</h2>
                            <p className="text-sm text-neutral-400">Found {filteredSongs.length} songs and {filteredAlbums.length} albums</p>
                        </div>
                    )}

                    {/* Featured Charts / Albums */}
                    {filteredAlbums.length > 0 && (
                        <section className="mb-8" aria-label="Featured Charts">
                            <h2 className="my-4 font-bold text-xl sm:text-2xl text-white">
                                {searchQuery.trim() ? "Matching Albums" : "Featured Charts"}
                            </h2>
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

                    {/* Today's biggest hits / Songs */}
                    {filteredSongs.length > 0 && (
                        <section className="mb-8" aria-label="Songs">
                            <h2 className="my-4 font-bold text-xl sm:text-2xl text-white">
                                {searchQuery.trim() ? "Matching Songs" : "Today's Biggest Hits"}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {(searchQuery.trim() ? filteredSongs : filteredSongs.slice(0, 10)).map((item) => (
                                    <SongsItem 
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

                    {searchQuery.trim() && filteredSongs.length === 0 && filteredAlbums.length === 0 && (
                        <div className="text-center py-16 text-neutral-400">
                            <p className="text-lg mb-1">No results found for &ldquo;{searchQuery}&rdquo;</p>
                            <p className="text-sm text-neutral-500">Try searching for a different song, artist, or album.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default React.memo(DisplayHome);
