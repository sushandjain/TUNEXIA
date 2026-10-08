import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { url } from '../../config';
import { toast } from 'react-toastify';

const PROVIDERS = [
    { id: 'itunes', name: 'iTunes / Apple Music', badge: 'iTunes', color: 'purple' },
    { id: 'audius', name: 'Audius (Full Stream)', badge: 'Audius', color: 'orange' },
    { id: 'deezer', name: 'Deezer Top Hits', badge: 'Deezer', color: 'red' },
    { id: 'jamendo', name: 'Jamendo (CC Free)', badge: 'Jamendo', color: 'cyan' },
];

function DiscoverImport({ token }) {
    const [selectedProvider, setSelectedProvider] = useState('itunes');
    const [activeTab, setActiveTab] = useState('trending'); // trending, new-releases, search
    const [searchQuery, setSearchQuery] = useState('');

    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Audio preview
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const audioRef = useRef(null);

    // Import options & selection
    const [autoPublish, setAutoPublish] = useState(true);
    const [selectedTrackIds, setSelectedTrackIds] = useState(new Set());
    const [importingSingleId, setImportingSingleId] = useState(null);
    const [bulkImporting, setBulkImporting] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);

    const fetchTracks = async (tab = activeTab, prov = selectedProvider, query = searchQuery) => {
        setLoading(true);
        try {
            let endpoint = `${url}/api/external-music/trending?provider=${prov}&limit=25`;
            if (tab === 'new-releases') {
                endpoint = `${url}/api/external-music/new-releases?provider=${prov}&limit=25`;
            } else if (tab === 'search') {
                if (!query.trim()) {
                    setTracks([]);
                    setLoading(false);
                    return;
                }
                endpoint = `${url}/api/external-music/search?query=${encodeURIComponent(query)}&provider=${prov}&limit=25`;
            }

            const res = await axios.get(endpoint, { headers: { token } });
            if (res.data.success) {
                setTracks(res.data.tracks || []);
            } else {
                toast.error(res.data.message || 'Failed to fetch tracks');
                setTracks([]);
            }
        } catch (error) {
            console.error('fetchTracks error:', error);
            toast.error(error?.response?.data?.message || 'Error fetching external music');
            setTracks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'search') {
            fetchTracks(activeTab, selectedProvider);
        }
    }, [activeTab, selectedProvider]);

    // Handle audio preview playback
    const toggleAudioPreview = (track) => {
        if (!track.file) {
            toast.info('No audio preview URL available for this track');
            return;
        }

        if (playingTrackId === track.externalId) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setPlayingTrackId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const audio = new Audio(track.file);
            audio.play().catch(e => {
                console.error("Audio playback error:", e);
                toast.error("Unable to play preview audio");
            });
            audio.onended = () => {
                setPlayingTrackId(null);
                audioRef.current = null;
            };
            audioRef.current = audio;
            setPlayingTrackId(track.externalId);
        }
    };

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Single track import
    const handleImportSingle = async (track) => {
        setImportingSingleId(track.externalId);
        try {
            const res = await axios.post(`${url}/api/external-music/import`, {
                tracks: [track],
                autoPublish
            }, {
                headers: { token }
            });

            if (res.data.success) {
                toast.success(`Imported "${track.name}"`);
                // Mark track as already imported in local state
                setTracks(prev => prev.map(t => t.externalId === track.externalId ? { ...t, isAlreadyImported: true } : t));
                setSelectedTrackIds(prev => {
                    const next = new Set(prev);
                    next.delete(track.externalId);
                    return next;
                });
            } else {
                toast.error(res.data.message || 'Import failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Import error');
        } finally {
            setImportingSingleId(null);
        }
    };

    // Bulk track import
    const handleImportBulk = async () => {
        const selected = tracks.filter(t => selectedTrackIds.has(t.externalId) && !t.isAlreadyImported);
        if (selected.length === 0) {
            toast.info('No new tracks selected for import');
            return;
        }

        setBulkImporting(true);
        setBulkProgress(20);

        try {
            const res = await axios.post(`${url}/api/external-music/import`, {
                tracks: selected,
                autoPublish
            }, {
                headers: { token }
            });

            setBulkProgress(100);

            if (res.data.success) {
                toast.success(`Successfully imported ${res.data.importedCount} tracks to catalog!`);
                // Update local tracks to imported
                const importedIds = new Set(selected.map(t => t.externalId));
                setTracks(prev => prev.map(t => importedIds.has(t.externalId) ? { ...t, isAlreadyImported: true } : t));
                setSelectedTrackIds(new Set());
            } else {
                toast.error(res.data.message || 'Bulk import failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Bulk import error');
        } finally {
            setBulkImporting(false);
            setTimeout(() => setBulkProgress(0), 1000);
        }
    };

    // Selection toggle
    const toggleSelect = (id) => {
        const next = new Set(selectedTrackIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedTrackIds(next);
    };

    const toggleSelectAll = () => {
        const importableTracks = tracks.filter(t => !t.isAlreadyImported);
        const allSelected = importableTracks.length > 0 && importableTracks.every(t => selectedTrackIds.has(t.externalId));

        if (allSelected) {
            setSelectedTrackIds(new Set());
        } else {
            const next = new Set();
            importableTracks.forEach(t => next.add(t.externalId));
            setSelectedTrackIds(next);
        }
    };

    const getProviderBadge = (provId) => {
        switch (provId) {
            case 'itunes':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">iTunes</span>;
            case 'audius':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/25">Audius</span>;
            case 'deezer':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">Deezer</span>;
            case 'jamendo':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">Jamendo</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Discover & Import Songs</h1>
                    <p className="text-sm text-neutral-400 mt-1">
                        Browse top charts and global catalogs to import tracks into Tunexia with one click.
                    </p>
                </div>

                {/* Import Status Option */}
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl text-xs">
                    <span className="text-neutral-400">Import As:</span>
                    <button
                        onClick={() => setAutoPublish(true)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                            autoPublish ? 'bg-green-500 text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        Published
                    </button>
                    <button
                        onClick={() => setAutoPublish(false)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                            !autoPublish ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        Draft
                    </button>
                </div>
            </div>

            {/* Provider Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-4">
                <span className="text-xs font-semibold uppercase text-neutral-500 mr-2">Music Provider:</span>
                {PROVIDERS.map((prov) => (
                    <button
                        key={prov.id}
                        onClick={() => setSelectedProvider(prov.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            selectedProvider === prov.id
                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                        }`}
                    >
                        <span>{prov.name}</span>
                    </button>
                ))}
            </div>

            {/* Feed Tabs & Search Bar */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-neutral-800/80 p-1 rounded-xl self-start">
                        <button
                            onClick={() => setActiveTab('trending')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                activeTab === 'trending' ? 'bg-green-500 text-black' : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            🔥 Trending Top 25
                        </button>
                        <button
                            onClick={() => setActiveTab('new-releases')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                activeTab === 'new-releases' ? 'bg-green-500 text-black' : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            ✨ New Releases
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                activeTab === 'search' ? 'bg-green-500 text-black' : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            🔍 Search API
                        </button>
                    </div>

                    {activeTab === 'search' && (
                        <form
                            onSubmit={(e) => { e.preventDefault(); fetchTracks('search', selectedProvider, searchQuery); }}
                            className="flex items-center gap-2 flex-1 max-w-md"
                        >
                            <input
                                type="text"
                                placeholder={`Search ${selectedProvider} tracks, artists...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-green-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold transition"
                            >
                                Search
                            </button>
                        </form>
                    )}
                </div>

                {/* Bulk Import Bar */}
                {selectedTrackIds.size > 0 && (
                    <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-sm animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-green-400">{selectedTrackIds.size}</span>
                            <span className="text-neutral-300">tracks selected</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleImportBulk}
                                disabled={bulkImporting}
                                className="px-4 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold shadow-lg shadow-green-500/20 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {bulkImporting ? 'Importing tracks...' : `Import Selected (${selectedTrackIds.size})`}
                            </button>
                            <button
                                onClick={() => setSelectedTrackIds(new Set())}
                                className="text-xs text-neutral-400 hover:text-white"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Bulk Progress */}
                {bulkImporting && (
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{ width: `${bulkProgress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Tracks List */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-300">
                        <thead className="bg-neutral-800/80 text-xs uppercase text-neutral-400 font-semibold border-b border-neutral-700/60">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={
                                            tracks.filter(t => !t.isAlreadyImported).length > 0 &&
                                            tracks.filter(t => !t.isAlreadyImported).every(t => selectedTrackIds.has(t.externalId))
                                        }
                                        className="rounded accent-green-500 cursor-pointer"
                                    />
                                </th>
                                <th className="p-4 w-16">Cover</th>
                                <th className="p-4">Track Title & Artist</th>
                                <th className="p-4">Album</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Provider</th>
                                <th className="p-4 text-center">Preview</th>
                                <th className="p-4 text-right">Import Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                                        <p className="mt-3 text-sm text-neutral-400">Fetching live feed from {selectedProvider}...</p>
                                    </td>
                                </tr>
                            ) : tracks.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center text-neutral-500">
                                        {activeTab === 'search' ? 'Type a query above to search tracks.' : 'No tracks returned.'}
                                    </td>
                                </tr>
                            ) : (
                                tracks.map((track) => {
                                    const isSelected = selectedTrackIds.has(track.externalId);
                                    const isPlaying = playingTrackId === track.externalId;
                                    const isImporting = importingSingleId === track.externalId;

                                    return (
                                        <tr
                                            key={track.externalId}
                                            className={`hover:bg-neutral-800/50 transition-colors ${isSelected ? 'bg-neutral-800/30' : ''}`}
                                        >
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    disabled={track.isAlreadyImported}
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(track.externalId)}
                                                    className="rounded accent-green-500 cursor-pointer disabled:opacity-30"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <img
                                                    src={track.image}
                                                    alt={track.name}
                                                    className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shadow"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-white truncate max-w-xs">{track.name}</p>
                                                <p className="text-xs text-neutral-400 truncate max-w-xs">{track.artist}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-neutral-300 truncate max-w-[160px] block">{track.album || 'Single'}</span>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-neutral-400">
                                                {track.duration || '0:00'}
                                            </td>
                                            <td className="p-4">
                                                {getProviderBadge(track.source || selectedProvider)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => toggleAudioPreview(track)}
                                                    title={isPlaying ? "Pause" : "Listen Preview"}
                                                    className={`w-9 h-9 rounded-full inline-flex items-center justify-center transition active:scale-95 ${
                                                        isPlaying
                                                            ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                                                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                                                    }`}
                                                >
                                                    {isPlaying ? (
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
                                            </td>
                                            <td className="p-4 text-right">
                                                {track.isAlreadyImported ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                                                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Already Added
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleImportSingle(track)}
                                                        disabled={isImporting}
                                                        className="px-3.5 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold shadow-md shadow-green-500/20 transition active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isImporting ? 'Importing...' : '+ Import'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DiscoverImport;
