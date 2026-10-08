import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../config';

function ListSong({ token }) {
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter, search & sort
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, title, duration

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);

    // Audio preview
    const [activeAudio, setActiveAudio] = useState(null);
    const [playingSongId, setPlayingSongId] = useState(null);

    // Delete confirmation modal
    const [deleteModal, setDeleteModal] = useState({ open: false, song: null, isBulk: false });

    // Quick Edit modal
    const [editModal, setEditModal] = useState({
        open: false,
        songId: null,
        name: '',
        artist: '',
        desc: '',
        album: 'none',
        isPublished: true,
        loading: false
    });

    const fetchSongs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${url}/api/song/list`);
            if (res.data.success) {
                setSongs(res.data.songs || []);
            }
        } catch (error) {
            console.error('fetchSongs error:', error);
            toast.error('Failed to load songs');
        } finally {
            setLoading(false);
        }
    };

    const fetchAlbums = async () => {
        try {
            const res = await axios.get(`${url}/api/album/list`);
            if (res.data.success) {
                setAlbums(res.data.albums || []);
            }
        } catch (error) {
            console.error('fetchAlbums error:', error);
        }
    };

    useEffect(() => {
        fetchSongs();
        fetchAlbums();
    }, []);

    // Stop audio on unmount
    useEffect(() => {
        return () => {
            if (activeAudio) {
                activeAudio.pause();
            }
        };
    }, [activeAudio]);

    const toggleAudioPreview = (song) => {
        if (!song.file) {
            toast.info('No audio preview available for this track');
            return;
        }

        if (playingSongId === song._id && activeAudio) {
            activeAudio.pause();
            setActiveAudio(null);
            setPlayingSongId(null);
        } else {
            if (activeAudio) {
                activeAudio.pause();
            }
            const audio = new Audio(song.file);
            audio.play().catch(e => {
                console.error("Audio playback error:", e);
                toast.error("Could not play audio preview");
            });
            audio.onended = () => {
                setActiveAudio(null);
                setPlayingSongId(null);
            };
            setActiveAudio(audio);
            setPlayingSongId(song._id);
        }
    };

    // Filter & sort logic
    const filteredSongs = useMemo(() => {
        return songs.filter(song => {
            // Search filter
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchesName = song.name?.toLowerCase().includes(term);
                const matchesArtist = song.artist?.toLowerCase().includes(term);
                const matchesAlbum = song.album?.toLowerCase().includes(term);
                if (!matchesName && !matchesArtist && !matchesAlbum) return false;
            }

            // Source filter
            if (sourceFilter !== 'all') {
                const src = song.source || 'manual';
                if (src !== sourceFilter) return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
                const published = song.isPublished !== false;
                if (statusFilter === 'published' && !published) return false;
                if (statusFilter === 'draft' && published) return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === 'title') {
                return (a.name || '').localeCompare(b.name || '');
            } else if (sortBy === 'duration') {
                return (a.duration || '').localeCompare(b.duration || '');
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            }
            // default newest
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    }, [songs, searchTerm, sourceFilter, statusFilter, sortBy]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredSongs.length / pageSize) || 1;
    const paginatedSongs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredSongs.slice(start, start + pageSize);
    }, [filteredSongs, currentPage, pageSize]);

    // Handle select all on current page
    const allPageSelected = paginatedSongs.length > 0 && paginatedSongs.every(s => selectedIds.has(s._id));

    const toggleSelectAllPage = () => {
        const next = new Set(selectedIds);
        if (allPageSelected) {
            paginatedSongs.forEach(s => next.delete(s._id));
        } else {
            paginatedSongs.forEach(s => next.add(s._id));
        }
        setSelectedIds(next);
    };

    const toggleSelectSong = (id) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    // Single remove
    const confirmDeleteSong = async () => {
        const song = deleteModal.song;
        if (!song) return;

        try {
            const res = await axios.delete(`${url}/api/song/remove/${song._id}`, {
                headers: { token }
            });
            if (res.data.success) {
                toast.success(res.data.message || 'Song deleted successfully');
                setDeleteModal({ open: false, song: null, isBulk: false });
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    next.delete(song._id);
                    return next;
                });
                await fetchSongs();
            } else {
                toast.error(res.data.message || 'Failed to remove song');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error removing song');
        }
    };

    // Bulk delete
    const confirmBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        setBulkLoading(true);
        try {
            const res = await axios.post(`${url}/api/song/bulk-delete`, { ids }, {
                headers: { token }
            });
            if (res.data.success) {
                toast.success(res.data.message || `Deleted ${ids.length} songs`);
                setSelectedIds(new Set());
                setDeleteModal({ open: false, song: null, isBulk: false });
                await fetchSongs();
            } else {
                toast.error(res.data.message || 'Bulk delete failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Bulk delete error');
        } finally {
            setBulkLoading(false);
        }
    };

    // Bulk status update
    const handleBulkStatus = async (isPublished) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        setBulkLoading(true);
        try {
            const res = await axios.post(`${url}/api/song/bulk-status`, { ids, isPublished }, {
                headers: { token }
            });
            if (res.data.success) {
                toast.success(res.data.message || `Updated ${ids.length} songs`);
                await fetchSongs();
            } else {
                toast.error(res.data.message || 'Status update failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Bulk status error');
        } finally {
            setBulkLoading(false);
        }
    };

    // Edit modal open
    const openEditModal = (song) => {
        setEditModal({
            open: true,
            songId: song._id,
            name: song.name || '',
            artist: song.artist || '',
            desc: song.desc || '',
            album: song.album || 'none',
            isPublished: song.isPublished !== false,
            loading: false
        });
    };

    // Save edit
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setEditModal(prev => ({ ...prev, loading: true }));
        try {
            const res = await axios.put(`${url}/api/song/edit/${editModal.songId}`, {
                name: editModal.name,
                artist: editModal.artist,
                desc: editModal.desc,
                album: editModal.album,
                isPublished: editModal.isPublished
            }, {
                headers: { token }
            });

            if (res.data.success) {
                toast.success('Song updated successfully');
                setEditModal({ open: false, songId: null, name: '', artist: '', desc: '', album: 'none', isPublished: true, loading: false });
                await fetchSongs();
            } else {
                toast.error(res.data.message || 'Update failed');
                setEditModal(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Update error');
            setEditModal(prev => ({ ...prev, loading: false }));
        }
    };

    const getSourceBadge = (source) => {
        switch (source) {
            case 'itunes':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">iTunes</span>;
            case 'audius':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/25">Audius</span>;
            case 'deezer':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">Deezer</span>;
            case 'jamendo':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">Jamendo</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/25">Manual</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Songs Library</h1>
                    <p className="text-sm text-neutral-400 mt-1">Manage, search, edit, and organize all tracks in Tunexia.</p>
                </div>
                <div className="text-sm text-neutral-400 font-medium">
                    Showing <span className="text-white font-bold">{filteredSongs.length}</span> of {songs.length} tracks
                </div>
            </div>

            {/* Filter / Controls Bar */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <svg className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by title, artist, or album..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-800/90 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-green-500 transition"
                        />
                    </div>

                    {/* Source Selector */}
                    <select
                        value={sourceFilter}
                        onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-green-500"
                    >
                        <option value="all">All Sources</option>
                        <option value="manual">Manual Uploads</option>
                        <option value="itunes">iTunes / Apple</option>
                        <option value="audius">Audius</option>
                        <option value="deezer">Deezer</option>
                        <option value="jamendo">Jamendo</option>
                    </select>

                    {/* Status Selector */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-green-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                    </select>

                    {/* Sort Selector */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-green-500"
                    >
                        <option value="newest">Sort: Newest First</option>
                        <option value="oldest">Sort: Oldest First</option>
                        <option value="title">Sort: Title (A-Z)</option>
                        <option value="duration">Sort: Duration</option>
                    </select>
                </div>

                {/* Bulk Action Strip */}
                {selectedIds.size > 0 && (
                    <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-sm animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-green-400">{selectedIds.size}</span>
                            <span className="text-neutral-300">items selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkStatus(true)}
                                disabled={bulkLoading}
                                className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold border border-green-500/30 transition disabled:opacity-50"
                            >
                                Set Published
                            </button>
                            <button
                                onClick={() => handleBulkStatus(false)}
                                disabled={bulkLoading}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold border border-amber-500/30 transition disabled:opacity-50"
                            >
                                Set Draft
                            </button>
                            <button
                                onClick={() => setDeleteModal({ open: true, song: null, isBulk: true })}
                                disabled={bulkLoading}
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold border border-red-500/30 transition disabled:opacity-50"
                            >
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Table Container */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-300">
                        <thead className="bg-neutral-800/80 text-xs uppercase text-neutral-400 font-semibold border-b border-neutral-700/60">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={allPageSelected}
                                        onChange={toggleSelectAllPage}
                                        className="rounded accent-green-500 cursor-pointer"
                                    />
                                </th>
                                <th className="p-4 w-16">Cover</th>
                                <th className="p-4">Track & Artist</th>
                                <th className="p-4">Album</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Source</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Preview</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="py-16 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                                        <p className="mt-3 text-sm text-neutral-400">Loading catalog...</p>
                                    </td>
                                </tr>
                            ) : paginatedSongs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-16 text-center text-neutral-500">
                                        No songs matched your search criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedSongs.map((song) => {
                                    const isSelected = selectedIds.has(song._id);
                                    const isPublished = song.isPublished !== false;
                                    const isPlaying = playingSongId === song._id;

                                    return (
                                        <tr
                                            key={song._id}
                                            className={`hover:bg-neutral-800/50 transition-colors ${isSelected ? 'bg-neutral-800/30' : ''}`}
                                        >
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectSong(song._id)}
                                                    className="rounded accent-green-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <img
                                                    src={song.image}
                                                    alt={song.name}
                                                    className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shadow"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-white truncate max-w-xs">{song.name}</p>
                                                <p className="text-xs text-neutral-400 truncate max-w-xs">{song.artist || song.desc || 'Unknown Artist'}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-neutral-300 truncate max-w-[140px] block">{song.album || 'None'}</span>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-neutral-400">
                                                {song.duration || '0:00'}
                                            </td>
                                            <td className="p-4">
                                                {getSourceBadge(song.source)}
                                            </td>
                                            <td className="p-4">
                                                {isPublished ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => toggleAudioPreview(song)}
                                                    title={isPlaying ? "Pause Preview" : "Play Preview"}
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
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(song)}
                                                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                                                        title="Quick Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, song, isBulk: false })}
                                                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition"
                                                        title="Delete Song"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 bg-neutral-850 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-3">
                        <span>Items per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 focus:outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>
                            Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 transition"
                        >
                            «
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 transition"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 transition"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 transition"
                        >
                            »
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Edit Modal */}
            {editModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Edit Song Details</h3>
                            <button
                                onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                                className="text-neutral-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Song Title</label>
                                <input
                                    type="text"
                                    value={editModal.name}
                                    onChange={(e) => setEditModal(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Artist</label>
                                <input
                                    type="text"
                                    value={editModal.artist}
                                    onChange={(e) => setEditModal(prev => ({ ...prev, artist: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Description</label>
                                <input
                                    type="text"
                                    value={editModal.desc}
                                    onChange={(e) => setEditModal(prev => ({ ...prev, desc: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">Album</label>
                                <select
                                    value={editModal.album}
                                    onChange={(e) => setEditModal(prev => ({ ...prev, album: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                                >
                                    <option value="none">None</option>
                                    {albums.map((alb) => (
                                        <option key={alb._id} value={alb.name}>{alb.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editModal.isPublished}
                                        onChange={(e) => setEditModal(prev => ({ ...prev, isPublished: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    <span className="ml-3 text-sm font-medium text-neutral-300">
                                        {editModal.isPublished ? 'Published (Live in App)' : 'Draft (Admin Only)'}
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold text-neutral-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editModal.loading}
                                    className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-sm font-bold shadow-lg shadow-green-500/20 transition disabled:opacity-50"
                                >
                                    {editModal.loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Safe Delete Confirmation Dialog */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white">
                                {deleteModal.isBulk ? `Delete ${selectedIds.size} Selected Songs?` : `Delete "${deleteModal.song?.name}"?`}
                            </h3>
                            <p className="text-sm text-neutral-400 mt-2">
                                This action cannot be undone. The song(s) will be permanently removed from the catalog.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, song: null, isBulk: false })}
                                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold text-neutral-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteModal.isBulk ? confirmBulkDelete : confirmDeleteSong}
                                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListSong;
