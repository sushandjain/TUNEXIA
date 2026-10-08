import React, { useContext, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Player App Components
import Display from './components/player/Display';
import Player from './components/player/Player';
import Sidebar from './components/player/Sidebar';
import BottomNav from './components/player/BottomNav';
import { PlayerContext } from './context/PlayerContext';

// Code-split Admin App bundle
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

const LoadingScreen = () => (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-neutral-700 border-t-green-500 rounded-full animate-spin"></div>
    </div>
);

const App = () => {
    const { audioRef, track, playStatus } = useContext(PlayerContext);

    return (
        <div className='min-h-screen bg-black text-white selection:bg-green-500 selection:text-black font-sans'>
            <ToastContainer 
                position="top-right" 
                autoClose={2500} 
                theme="dark" 
            />
            <Routes>
                {/* Lazy-Loaded Admin Routes */}
                <Route 
                    path="/admin/*" 
                    element={
                        <Suspense fallback={<LoadingScreen />}>
                            <AdminApp />
                        </Suspense>
                    } 
                />
                
                {/* Main Player App Routes */}
                <Route 
                    path="/*" 
                    element={
                        <div className='h-[100dvh] flex flex-col overflow-hidden bg-black'>
                            {/* Main Body */}
                            <div className="flex-1 flex overflow-hidden">
                                <Sidebar />
                                <Display />
                            </div>

                            {/* Sticky Mini Player & Desktop Player */}
                            <Player />

                            {/* Mobile Thumb Navigation */}
                            <BottomNav />

                            {/* Audio Element with deferred preloading to prevent network lockup on page load */}
                            <audio 
                                ref={audioRef} 
                                src={track ? track.file : ""} 
                                preload={playStatus ? "auto" : "none"}
                            />
                        </div>
                    } 
                />
            </Routes>
        </div>
    );
};

export default App;
