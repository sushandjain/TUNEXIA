import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { url } from '../../config';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function AdminImport({ token }) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRunningKey, setActiveRunningKey] = useState(null);
    const [runningAll, setRunningAll] = useState(false);
    const [autoPublish, setAutoPublish] = useState(false);
    const [syncState, setSyncState] = useState(null);
    const [importLogs, setImportLogs] = useState([]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${url}/api/admin/import/categories`, {
                headers: { token }
            });
            if (res.data.success) {
                setCategories(res.data.categories || []);
                setSyncState(res.data.syncState || null);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load import categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [token]);

    const runImportCategory = async (catKey) => {
        setActiveRunningKey(catKey);
        try {
            const res = await axios.post(`${url}/api/admin/import/run/${catKey}?pages=1`, {
                autoPublish
            }, {
                headers: { token }
            });

            if (res.data.success) {
                toast.success(res.data.message);
                const r = res.data.result;
                setImportLogs(prev => [
                    {
                        time: new Date().toLocaleTimeString(),
                        category: r.name,
                        imported: r.importedCount,
                        skipped: r.skippedCount,
                        found: r.candidatesFound
                    },
                    ...prev
                ]);
                await fetchCategories();
            } else {
                toast.error(res.data.message || 'Import failed');
            }
        } catch (error) {
            console.error('Category import error:', error);
            toast.error(error?.response?.data?.message || 'Error running category import');
        } finally {
            setActiveRunningKey(null);
        }
    };

    const runImportAll = async () => {
        setRunningAll(true);
        try {
            const res = await axios.post(`${url}/api/admin/import/run-all?pages=1`, {
                autoPublish
            }, {
                headers: { token }
            });

            if (res.data.success) {
                toast.success(res.data.message);
                if (Array.isArray(res.data.results)) {
                    res.data.results.forEach(r => {
                        setImportLogs(prev => [
                            {
                                time: new Date().toLocaleTimeString(),
                                category: r.name || r.category,
                                imported: r.importedCount,
                                skipped: r.skippedCount || 0,
                                found: r.candidatesFound || 0
                            },
                            ...prev
                        ]);
                    });
                }
                await fetchCategories();
            } else {
                toast.error(res.data.message || 'Import all failed');
            }
        } catch (error) {
            console.error('Run all error:', error);
            toast.error(error?.response?.data?.message || 'Error importing all categories');
        } finally {
            setRunningAll(false);
        }
    };

    const publishCategory = async (catKey) => {
        try {
            const res = await axios.post(`${url}/api/admin/import/publish-category/${catKey}`, {}, {
                headers: { token }
            });
            if (res.data.success) {
                toast.success(res.data.message);
                await fetchCategories();
            } else {
                toast.error(res.data.message || 'Publishing failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error publishing category');
        }
    };

    const getProviderBadge = (prov) => {
        switch (prov) {
            case 'itunes':
                return <span key={prov} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">Apple/iTunes</span>;
            case 'deezer':
                return <span key={prov} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">Deezer</span>;
            case 'audius':
                return <span key={prov} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/25">Audius</span>;
            case 'jamendo':
                return <span key={prov} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">Jamendo</span>;
            default:
                return <span key={prov} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300">{prov}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl pb-20">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Import Songs</h1>
                    <p className="text-sm text-neutral-400 mt-1">
                        Batch import curated regional & global feeds from Deezer, iTunes, Audius, and Jamendo.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/add-song')}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-semibold transition border border-neutral-700"
                    >
                        + Add Song Manually
                    </button>
                    <button
                        onClick={runImportAll}
                        disabled={runningAll}
                        className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs sm:text-sm font-bold shadow-lg shadow-green-500/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className={`w-4 h-4 ${runningAll ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {runningAll ? 'Importing All...' : 'Import All (1 Page)'}
                    </button>
                </div>
            </div>

            {/* Import Mode Switcher */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase text-neutral-400">Import Mode:</span>
                    <button
                        onClick={() => setAutoPublish(false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            !autoPublish
                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                    >
                        Drafts (Admin Review)
                    </button>
                    <button
                        onClick={() => setAutoPublish(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            autoPublish
                                ? 'bg-green-500 text-black shadow-md shadow-green-500/20'
                                : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                    >
                        Published (Live Immediately)
                    </button>
                </div>

                {syncState && (
                    <div className="text-xs text-neutral-400">
                        Daily Auto-Sync: <span className="text-neutral-300 font-mono">{syncState.lastResult || 'Idle'}</span>
                    </div>
                )}
            </div>

            {/* Categories Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                    const isRunning = activeRunningKey === cat.key;
                    const stats = cat.stats || { totalImported: 0, drafts: 0, published: 0 };
                    const uniqueProviders = Array.from(new Set(cat.providers.map(p => p.provider)));

                    return (
                        <div
                            key={cat.key}
                            className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-neutral-700 transition shadow-lg"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-lg font-bold text-white tracking-tight">{cat.name}</h3>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-neutral-400 bg-neutral-800">
                                        1 Page = 10 Songs
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">{cat.description}</p>

                                {/* Providers badges */}
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {uniqueProviders.map(p => getProviderBadge(p))}
                                </div>

                                {/* Category Stats */}
                                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-800/80 text-center">
                                    <div className="p-2 rounded-xl bg-neutral-800/50">
                                        <p className="text-[10px] font-semibold text-neutral-500 uppercase">Total</p>
                                        <p className="text-base font-bold text-white mt-0.5">{stats.totalImported}</p>
                                    </div>
                                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <p className="text-[10px] font-semibold text-amber-400 uppercase">Drafts</p>
                                        <p className="text-base font-bold text-amber-400 mt-0.5">{stats.drafts}</p>
                                    </div>
                                    <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <p className="text-[10px] font-semibold text-green-400 uppercase">Live</p>
                                        <p className="text-base font-bold text-green-400 mt-0.5">{stats.published}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex items-center justify-between gap-2">
                                {stats.drafts > 0 ? (
                                    <button
                                        onClick={() => publishCategory(cat.key)}
                                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-green-400 text-xs font-semibold transition border border-neutral-700"
                                    >
                                        Publish {stats.drafts} Drafts
                                    </button>
                                ) : (
                                    <span className="text-xs text-neutral-500 font-medium">All Published</span>
                                )}

                                <button
                                    onClick={() => runImportCategory(cat.key)}
                                    disabled={isRunning || runningAll}
                                    className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold transition shadow-md shadow-green-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {isRunning ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            Importing...
                                        </>
                                    ) : (
                                        'Import (1 Page)'
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Import Execution Log Console */}
            {importLogs.length > 0 && (
                <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Recent Import Activity Log
                    </h2>
                    <div className="divide-y divide-neutral-800 text-xs font-mono text-neutral-300">
                        {importLogs.map((log, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between">
                                <div>
                                    <span className="text-neutral-500">[{log.time}]</span>{' '}
                                    <span className="font-semibold text-white">{log.category}</span>
                                </div>
                                <div className="space-x-4">
                                    <span className="text-green-400">+{log.imported} new tracks</span>
                                    <span className="text-neutral-500">({log.skipped} duplicates skipped)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminImport;
