import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { url } from '../../config';
import { toast } from 'react-toastify';

const Dashboard = ({ token }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [syncSettings, setSyncSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [previewingAudio, setPreviewingAudio] = useState(null);

    const loadData = async () => {
        try {
            const [statsRes, syncRes] = await Promise.allSettled([
                axios.get(`${url}/api/song/stats`, { headers: { token } }),
                axios.get(`${url}/api/sync/settings`, { headers: { token } })
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
                setStats(statsRes.value.data.stats);
            }
            if (syncRes.status === 'fulfilled' && syncRes.value.data.success) {
                setSyncSettings(syncRes.value.data.settings);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const handleRunSyncNow = async () => {
        setSyncing(true);
        try {
            const res = await axios.post(`${url}/api/sync/run`, {}, { headers: { token } });
            if (res.data.success) {
                toast.success(res.data.message || 'Sync completed successfully');
                loadData();
            } else {
                toast.error(res.data.message || 'Sync failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Sync error');
        } finally {
            setSyncing(false);
        }
    };

    const toggleAudioPreview = (fileUrl) => {
        if (!fileUrl) return;
        if (previewingAudio && previewingAudio.src === fileUrl) {
            previewingAudio.pause();
            setPreviewingAudio(null);
        } else {
            if (previewingAudio) previewingAudio.pause();
            const audio = new Audio(fileUrl);
            audio.play();
            audio.onended = () => setPreviewingAudio(null);
            setPreviewingAudio(audio);
        }
    };

    useEffect(() => {
        return () => {
            if (previewingAudio) previewingAudio.pause();
        };
    }, [previewingAudio]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const total = stats?.totalSongs || 0;
    const published = stats?.publishedSongs || 0;
    const drafts = stats?.draftSongs || 0;
    const manual = stats?.manualSongs || 0;
    const imported = stats?.importedSongs || 0;
    const albums = stats?.totalAlbums || 0;
    const recentSongs = stats?.recentSongs || [];

    const sourceBreakdown = stats?.sources || {};

    return (
        <div className="space-y-8 max-w-7xl pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin Overview</h1>
                    <p className="text-sm text-neutral-400 mt-1">Manage Tunexia catalog, imports, and auto-sync services.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRunSyncNow}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold transition border border-neutral-700 disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 text-green-400 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button
                        onClick={() => navigate('/admin/import')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-sm font-bold shadow-lg shadow-green-500/20 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Discover & Import
                    </button>
                </div>
            </div>

            {/* Sync Status Banner */}
            {syncSettings && (
                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${syncSettings.enabled ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`}></span>
                        <div>
                            <span className="font-semibold text-white">Auto-Sync Engine: </span>
                            <span className={syncSettings.enabled ? 'text-green-400' : 'text-neutral-400'}>
                                {syncSettings.enabled ? `Active (${syncSettings.interval || 'daily'} via ${syncSettings.provider})` : 'Disabled'}
                            </span>
                        </div>
                    </div>
                    <div className="text-xs text-neutral-400 truncate max-w-md">
                        Last Run: <span className="text-neutral-300">{syncSettings.lastRunStatus || 'None'}</span> ({syncSettings.lastRunResult || 'No history'})
                    </div>
                </div>
            )}

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Songs</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{total}</p>
                    <p className="text-xs text-neutral-500 mt-1">Catalog items</p>
                </div>

                <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Published</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-green-400 mt-1">{published}</p>
                    <p className="text-xs text-neutral-500 mt-1">Live in app</p>
                </div>

                <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Drafts</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">{drafts}</p>
                    <p className="text-xs text-neutral-500 mt-1">Hidden from public</p>
                </div>

                <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Manual Uploads</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">{manual}</p>
                    <p className="text-xs text-neutral-500 mt-1">Cloudinary assets</p>
                </div>

                <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">API Imports</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-1">{imported}</p>
                    <p className="text-xs text-neutral-500 mt-1">External streams</p>
                </div>

                <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
                    <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Albums</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-pink-400 mt-1">{albums}</p>
                    <p className="text-xs text-neutral-500 mt-1">Curated playlists</p>
                </div>
            </div>

            {/* Quick Actions & Source Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Source Distribution */}
                <div className="lg:col-span-1 bg-neutral-900/80 border border-neutral-800 p-6 rounded-2xl space-y-4">
                    <h2 className="text-lg font-bold text-white">Source Distribution</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-neutral-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Manual Cloudinary
                            </span>
                            <span className="font-semibold text-white">{sourceBreakdown.manual || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-neutral-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> iTunes / Apple
                            </span>
                            <span className="font-semibold text-white">{sourceBreakdown.itunes || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-neutral-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Audius
                            </span>
                            <span className="font-semibold text-white">{sourceBreakdown.audius || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-neutral-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Deezer
                            </span>
                            <span className="font-semibold text-white">{sourceBreakdown.deezer || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-neutral-300">
                                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Jamendo
                            </span>
                            <span className="font-semibold text-white">{sourceBreakdown.jamendo || 0}</span>
                        </div>
                    </div>

                    <hr className="border-neutral-800" />

                    <div className="pt-2">
                        <p className="text-xs text-neutral-400">
                            Tunexia automatically bridges manual Cloudinary files with high-res external music feeds for an endless catalog.
                        </p>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 p-6 rounded-2xl space-y-4">
                    <h2 className="text-lg font-bold text-white">Admin Workflows</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                            onClick={() => navigate('/admin/import')}
                            className="p-4 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 cursor-pointer transition flex items-start gap-3 group"
                        >
                            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">Discover & Import</h3>
                                <p className="text-xs text-neutral-400 mt-1">Browse trending charts from iTunes, Deezer & Audius to instantly add songs.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/admin/add-song')}
                            className="p-4 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 cursor-pointer transition flex items-start gap-3 group"
                        >
                            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Upload Manual Track</h3>
                                <p className="text-xs text-neutral-400 mt-1">Direct Cloudinary audio and cover upload with live preview.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/admin/list-song')}
                            className="p-4 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 cursor-pointer transition flex items-start gap-3 group"
                        >
                            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Manage Songs</h3>
                                <p className="text-xs text-neutral-400 mt-1">Bulk publish, draft, edit metadata, or delete catalog tracks.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/admin/sync-settings')}
                            className="p-4 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 cursor-pointer transition flex items-start gap-3 group"
                        >
                            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Sync Engine Config</h3>
                                <p className="text-xs text-neutral-400 mt-1">Configure automated cron sync intervals and provider defaults.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Songs */}
            <div className="bg-neutral-900/80 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Recently Added Songs</h2>
                        <p className="text-xs text-neutral-400">Latest songs entered into Tunexia</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/list-song')}
                        className="text-xs font-semibold text-green-400 hover:text-green-300 transition"
                    >
                        View All →
                    </button>
                </div>

                <div className="divide-y divide-neutral-800/80">
                    {recentSongs.length === 0 ? (
                        <p className="py-6 text-sm text-neutral-500 text-center">No songs found in catalog.</p>
                    ) : (
                        recentSongs.map((song) => (
                            <div key={song._id} className="py-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <img
                                        src={song.image}
                                        alt={song.name}
                                        className="w-11 h-11 rounded-lg object-cover bg-neutral-800 flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{song.name}</p>
                                        <p className="text-xs text-neutral-400 truncate">{song.album || 'No album'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleAudioPreview(song.file)}
                                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
                                    >
                                        {previewingAudio && previewingAudio.src === song.file ? 'Pause' : 'Play'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
