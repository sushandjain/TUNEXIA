import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../../components/admin/Sidebar';
import AdminNavbar from '../../components/admin/Navbar';

const Dashboard = lazy(() => import('./Dashboard'));
const AddSong = lazy(() => import('./AddSong'));
const ListSong = lazy(() => import('./ListSong'));
const DiscoverImport = lazy(() => import('./DiscoverImport'));
const AdminImport = lazy(() => import('./AdminImport'));
const SyncSettings = lazy(() => import('./SyncSettings'));
const AddAlbum = lazy(() => import('./AddAlbum'));
const ListAlbum = lazy(() => import('./ListAlbum'));
const Login = lazy(() => import('./Login'));

const AdminLoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
    </div>
);

const AdminApp = () => {
    const [token, setToken] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleSetToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('adminToken', newToken);
        } else {
            localStorage.removeItem('adminToken');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-green-500 selection:text-black">
            <Suspense fallback={<AdminLoadingFallback />}>
                {token ? (
                    <div className="flex min-h-screen">
                        {/* Sidebar */}
                        <AdminSidebar
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                        />

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                            <AdminNavbar
                                setToken={handleSetToken}
                                onToggleSidebar={() => setSidebarOpen(prev => !prev)}
                            />

                            <main className="flex-1 p-4 sm:p-8">
                                <Routes>
                                    <Route index element={<Dashboard token={token} />} />
                                    <Route path="list-song" element={<ListSong token={token} />} />
                                    <Route path="add-song" element={<AddSong token={token} />} />
                                    <Route path="import-songs" element={<AdminImport token={token} />} />
                                    <Route path="import" element={<AdminImport token={token} />} />
                                    <Route path="discover" element={<DiscoverImport token={token} />} />
                                    <Route path="sync-settings" element={<SyncSettings token={token} />} />
                                    <Route path="list-album" element={<ListAlbum token={token} />} />
                                    <Route path="add-album" element={<AddAlbum token={token} />} />
                                </Routes>
                            </main>
                        </div>
                    </div>
                ) : (
                    <Login setToken={handleSetToken} />
                )}
            </Suspense>
        </div>
    );
};

export default AdminApp;
