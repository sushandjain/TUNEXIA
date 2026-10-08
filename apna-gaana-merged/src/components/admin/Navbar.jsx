import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
    '/admin': 'Dashboard Overview',
    '/admin/list-song': 'Songs Library',
    '/admin/add-song': 'Upload Track',
    '/admin/import': 'Discover & Import Songs',
    '/admin/sync-settings': 'Sync Engine & Scheduler',
    '/admin/list-album': 'Album Catalog',
    '/admin/add-album': 'Create Album'
};

const Navbar = ({ setToken, onToggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentTitle = ROUTE_TITLES[location.pathname] || 'Admin Console';
    const adminUsername = localStorage.getItem('adminUsername') || 'sushan';

    const logout = () => {
        setToken('');
        localStorage.removeItem('adminUsername');
        navigate('/admin');
    };

    return (
        <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
            {/* Left: Mobile hamburger & breadcrumbs */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white lg:hidden"
                    aria-label="Toggle menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-500 font-medium hidden sm:inline">Admin /</span>
                    <span className="text-white font-bold text-base sm:text-lg">{currentTitle}</span>
                </div>
            </div>

            {/* Right: Status badge & Actions */}
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-neutral-300 font-medium">Logged in as <strong className="text-white capitalize">{adminUsername}</strong></span>
                </div>

                <button
                    onClick={logout}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-red-500/10 text-neutral-300 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 text-xs font-semibold transition"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
};

export default Navbar;
