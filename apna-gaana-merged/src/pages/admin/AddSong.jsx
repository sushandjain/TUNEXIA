import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { url } from '../../config';
import { toast } from 'react-toastify';

function AddSong({ token }) {
    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');
    const [desc, setDesc] = useState('');
    const [album, setAlbum] = useState('none');
    const [albumData, setAlbumData] = useState([]);

    const [audioFile, setAudioFile] = useState(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const audioRef = useRef(null);
    const [audioDragOver, setAudioDragOver] = useState(false);
    const [imageDragOver, setImageDragOver] = useState(false);

    // Track dirty state
    const isDirty = Boolean(name || artist || desc || audioFile || imageFile);

    // Unsaved changes confirmation on tab close / reload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty && !isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, isSubmitting]);

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        };
    }, [audioPreviewUrl, imagePreviewUrl]);

    const loadAlbumData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            if (response.data.success) {
                setAlbumData(response.data.albums || []);
            }
        } catch (error) {
            console.error('loadAlbumData Error:', error);
        }
    };

    useEffect(() => {
        loadAlbumData();
    }, []);

    // File handlers
    const handleAudioSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('audio/')) {
            toast.error('Please select a valid audio file (MP3, WAV, AAC, etc.)');
            return;
        }
        if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
        const objUrl = URL.createObjectURL(file);
        setAudioFile(file);
        setAudioPreviewUrl(objUrl);
        setIsPlayingPreview(false);

        // Pre-fill name if empty
        if (!name) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            setName(cleanName);
        }
    };

    const handleImageSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file (JPG, PNG, WebP)');
            return;
        }
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        const objUrl = URL.createObjectURL(file);
        setImageFile(file);
        setImagePreviewUrl(objUrl);
    };

    const togglePlayPreview = () => {
        if (!audioRef.current) return;
        if (isPlayingPreview) {
            audioRef.current.pause();
            setIsPlayingPreview(false);
        } else {
            audioRef.current.play();
            setIsPlayingPreview(true);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!audioFile) {
            toast.error('Please select or drop an audio file');
            return;
        }
        if (!imageFile) {
            toast.error('Please select or drop a cover artwork image');
            return;
        }
        if (!name.trim()) {
            toast.error('Song name is required');
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(10);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('desc', desc || (artist ? `By ${artist}` : name));
            formData.append('artist', artist);
            formData.append('album', album);
            formData.append('audio', audioFile);
            formData.append('image', imageFile);

            const response = await axios.post(`${url}/api/song/add`, formData, {
                headers: {
                    token,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
                        setUploadProgress(percent);
                    }
                }
            });

            setUploadProgress(100);

            if (response.data.success) {
                toast.success('Track uploaded and published to catalog!');
                // Reset form
                setName('');
                setArtist('');
                setDesc('');
                setAlbum('none');
                setAudioFile(null);
                setAudioPreviewUrl(null);
                setImageFile(null);
                setImagePreviewUrl(null);
                setIsPlayingPreview(false);
            } else {
                toast.error(response.data.message || 'Failed to upload song');
            }
        } catch (error) {
            console.error('Song upload error:', error);
            toast.error(error?.response?.data?.message || 'Error uploading song to Cloudinary');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    return (
        <div className="max-w-4xl space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Upload Manual Track</h1>
                <p className="text-sm text-neutral-400 mt-1">
                    Upload audio and cover art directly to Cloudinary with audio preview.
                </p>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
                {/* Upload Zones (Drag & Drop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Audio Dropzone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setAudioDragOver(true); }}
                        onDragLeave={() => setAudioDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setAudioDragOver(false);
                            if (e.dataTransfer.files?.[0]) handleAudioSelect(e.dataTransfer.files[0]);
                        }}
                        className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer relative min-h-[220px] ${
                            audioDragOver
                                ? 'border-green-500 bg-green-500/10'
                                : audioFile
                                ? 'border-green-500/50 bg-neutral-900/90'
                                : 'border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900'
                        }`}
                        onClick={() => document.getElementById('audio-input')?.click()}
                    >
                        <input
                            id="audio-input"
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => { if (e.target.files?.[0]) handleAudioSelect(e.target.files[0]); }}
                        />

                        {audioFile ? (
                            <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-white text-sm truncate max-w-xs mx-auto">{audioFile.name}</p>
                                <p className="text-xs text-neutral-400 font-mono">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>

                                {/* Audio Preview Player */}
                                {audioPreviewUrl && (
                                    <div className="pt-2 flex items-center justify-center gap-3">
                                        <audio
                                            ref={audioRef}
                                            src={audioPreviewUrl}
                                            onEnded={() => setIsPlayingPreview(false)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePlayPreview}
                                            className="px-4 py-1.5 rounded-full bg-green-500 hover:bg-green-400 text-black text-xs font-bold flex items-center gap-2 transition"
                                        >
                                            {isPlayingPreview ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                                        <rect x="6" y="4" width="4" height="16" />
                                                        <rect x="14" y="4" width="4" height="16" />
                                                    </svg>
                                                    Pause Preview
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                                        <polygon points="5 3 19 12 5 21 5 3" />
                                                    </svg>
                                                    Listen Preview
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (audioRef.current) audioRef.current.pause();
                                                setAudioFile(null);
                                                setAudioPreviewUrl(null);
                                                setIsPlayingPreview(false);
                                            }}
                                            className="text-xs text-red-400 hover:text-red-300"
                                        >
                                            Replace
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2 pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-white text-sm">Drop audio file here</p>
                                <p className="text-xs text-neutral-400">or click to browse MP3, WAV, AAC</p>
                            </div>
                        )}
                    </div>

                    {/* Image Dropzone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
                        onDragLeave={() => setImageDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setImageDragOver(false);
                            if (e.dataTransfer.files?.[0]) handleImageSelect(e.dataTransfer.files[0]);
                        }}
                        className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer relative min-h-[220px] ${
                            imageDragOver
                                ? 'border-green-500 bg-green-500/10'
                                : imageFile
                                ? 'border-green-500/50 bg-neutral-900/90'
                                : 'border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900'
                        }`}
                        onClick={() => document.getElementById('image-input')?.click()}
                    >
                        <input
                            id="image-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { if (e.target.files?.[0]) handleImageSelect(e.target.files[0]); }}
                        />

                        {imagePreviewUrl ? (
                            <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
                                <img
                                    src={imagePreviewUrl}
                                    alt="Cover preview"
                                    className="w-24 h-24 rounded-xl object-cover mx-auto shadow-md ring-1 ring-white/10"
                                />
                                <p className="font-semibold text-white text-sm truncate max-w-xs mx-auto">{imageFile.name}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreviewUrl(null);
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Replace Artwork
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="font-semibold text-white text-sm">Drop cover image here</p>
                                <p className="text-xs text-neutral-400">Square 1:1 image recommended (PNG, JPG)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Inputs Card */}
                <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                                Song Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Starboy"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                                Artist Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. The Weeknd, Daft Punk"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                                Description
                            </label>
                            <input
                                type="text"
                                placeholder="Short description or tagline"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                                Assign to Album
                            </label>
                            <select
                                value={album}
                                onChange={(e) => setAlbum(e.target.value)}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                            >
                                <option value="none">None (Single Track)</option>
                                {albumData.map((item, index) => (
                                    <option key={index} value={item.name}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Upload Progress Bar */}
                {isSubmitting && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-white">Uploading to Cloudinary...</span>
                            <span className="font-mono text-green-400">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm shadow-xl shadow-green-500/20 active:scale-95 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Uploading to Cloudinary...' : 'Upload & Publish Song'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddSong;
