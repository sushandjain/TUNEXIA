import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
    {
        name: 'Dashboard',
        to: '/admin',
        exact: true,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        name: 'Songs Library',
        to: '/admin/list-song',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
        )
    },
    {
        name: 'Import Songs',
        to: '/admin/import-songs',
        badge: 'Feeds',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
        )
    },
    {
        name: 'Add Song Manually',
        to: '/admin/add-song',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
        )
    },
    {
        name: 'Sync Engine',
        to: '/admin/sync-settings',
        badge: 'Cron',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        )
    },
    {
        name: 'Albums',
        to: '/admin/list-album',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        )
    },
    {
        name: 'Add Album',
        to: '/admin/add-album',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
        )
    }
];

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col flex-1 overflow-y-auto">
                    {/* Brand */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-800/60">
                        <div
                            onClick={() => { navigate('/admin'); onClose?.(); }}
                            className="flex items-center gap-2.5 cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-black text-black text-base shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                                T
                            </div>
                            <span className="text-lg font-black tracking-wider text-white">
                                TUNEXIA <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20">Admin</span>
                            </span>
                        </div>

                        {/* Mobile close button */}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white lg:hidden"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="p-4 space-y-1.5 flex-1">
                        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Main Navigation</p>
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.exact}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition group ${
                                        isActive
                                            ? 'bg-neutral-800 text-green-400 shadow-sm border border-neutral-700/60'
                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer Switcher */}
                <div className="p-4 border-t border-neutral-800/60 space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition border border-neutral-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Public Player
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
