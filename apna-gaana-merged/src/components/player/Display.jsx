import React, { useContext, lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import DisplayHome from './DisplayHome';
import { PlayerContext } from '../../context/PlayerContext';

const DisplayAlbum = lazy(() => import('./DisplayAlbum'));
const Library = lazy(() => import('./Library'));

const RouteSkeleton = () => (
    <div className="p-4 space-y-6 animate-pulse">
        <div className="h-40 bg-neutral-800 rounded-lg w-full"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-44 bg-neutral-800/60 rounded-md"></div>
            ))}
        </div>
    </div>
);

const Display = () => {
    const { albumsData } = useContext(PlayerContext);
    const location = useLocation();
    const isAlbum = location.pathname.includes("album");
    const albumId = isAlbum ? location.pathname.split('/').pop() : "";
    const bgColor = isAlbum && albumsData.length > 0
        ? albumsData.find(x => x._id === albumId)?.bgColor || "#121212"
        : "#121212";

    return (
        <main className='flex-1 m-1 sm:m-2 px-3 sm:px-6 pt-3 sm:pt-4 rounded-lg bg-[#121212] text-white overflow-y-auto overflow-x-hidden min-h-0' role="main">
            {isAlbum && albumsData.length > 0 && (
                <div
                    className='h-28 sm:h-36 rounded-lg mb-4 transition-all duration-500'
                    style={{ background: `linear-gradient(${bgColor}, #121212)` }}
                />
            )}
            <Suspense fallback={<RouteSkeleton />}>
                <Routes>
                    <Route path='/' element={<DisplayHome />} />
                    <Route path='/album/:id' element={<DisplayAlbum />} />
                    <Route path='/library' element={<Library />} />
                </Routes>
            </Suspense>
        </main>
    );
};

export default Display;
