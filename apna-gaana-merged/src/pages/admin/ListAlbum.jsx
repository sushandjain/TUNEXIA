import { useEffect, useState } from "react";
import { url } from "../../config";
import axios from "axios";
import { toast } from "react-toastify";

function ListAlbum({ token }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, album: null });

    const fetchAlbums = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/album/list`);
            if (response.data.success) {
                setData(response.data.albums || []);
            }
        } catch (error) {
            console.error('error', error);
            toast.error("Album List Error");
        } finally {
            setLoading(false);
        }
    };

    const confirmRemoveAlbum = async () => {
        const album = deleteModal.album;
        if (!album) return;

        try {
            const response = await axios.delete(`${url}/api/album/remove/${album._id}`, {
                headers: { token }
            });

            if (response.data.success) {
                toast.success(response.data.message || "Album removed");
                setDeleteModal({ open: false, album: null });
                await fetchAlbums();
            } else {
                toast.error(response.data.message || "Failed to remove album");
            }
        } catch (error) {
            console.error('error', error);
            toast.error(error?.response?.data?.message || "Album Remove Error");
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    return (
        <div className="space-y-6 max-w-7xl pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Albums Catalog</h1>
                    <p className="text-sm text-neutral-400 mt-1">Curate and manage playlist collections.</p>
                </div>
                <span className="text-sm text-neutral-400 font-medium">
                    Total: <strong className="text-white">{data.length}</strong> albums
                </span>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-300">
                        <thead className="bg-neutral-800/80 text-xs uppercase text-neutral-400 font-semibold border-b border-neutral-700/60">
                            <tr>
                                <th className="p-4 w-16">Artwork</th>
                                <th className="p-4">Album Name</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Theme Color</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                                        <p className="mt-3 text-sm text-neutral-400">Loading albums...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-neutral-500">
                                        No albums created yet.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item._id} className="hover:bg-neutral-800/50 transition">
                                        <td className="p-4">
                                            <img className="w-12 h-12 rounded-lg object-cover bg-neutral-800" src={item.image} alt={item.name} />
                                        </td>
                                        <td className="p-4 font-bold text-white">
                                            {item.name}
                                        </td>
                                        <td className="p-4 text-neutral-400">
                                            {item.desc || 'No description'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full border border-neutral-700" style={{ backgroundColor: item.bgColor || '#121212' }} />
                                                <span className="font-mono text-xs text-neutral-400">{item.bgColor || '#121212'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setDeleteModal({ open: true, album: item })}
                                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition"
                                                title="Delete Album"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white">Delete "{deleteModal.album?.name}"?</h3>
                        <p className="text-sm text-neutral-400">Are you sure you want to delete this album? This action cannot be undone.</p>
                        <div className="flex items-center justify-end gap-3 pt-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, album: null })}
                                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold text-neutral-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveAlbum}
                                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition"
                            >
                                Delete Album
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListAlbum;
