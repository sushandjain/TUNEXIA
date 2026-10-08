import axios from "axios";
import { useState } from "react";
import { url } from "../../config";
import { toast } from "react-toastify";
import { assets } from "../../assets/admin-assets/assets";

function AddAlbum({ token }) {
    const [image, setImage] = useState(false);
    const [colour, setColour] = useState("#121212");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!image) {
            toast.error("Please select an album cover image");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('desc', desc);
            formData.append('image', image);
            formData.append('bgColor', colour);

            const response = await axios.post(`${url}/api/album/add`, formData, {
                headers: { token }
            });

            if (response.data.success) {
                toast.success("Album Created Successfully");
                setName("");
                setDesc("");
                setColour("#121212");
                setImage(false);
            } else {
                toast.error(response.data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error('error', error);
            toast.error(error?.response?.data?.message || "Album Add Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6 pb-20">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create New Album</h1>
                <p className="text-sm text-neutral-400 mt-1">Organize tracks into curated collections and playlists.</p>
            </div>

            <form onSubmit={onSubmitHandler} className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5">
                {/* Upload Image */}
                <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Album Artwork</label>
                    <input
                        onChange={(e) => setImage(e.target.files[0])}
                        type="file"
                        id="album-image"
                        accept="image/*"
                        hidden
                    />
                    <label
                        htmlFor="album-image"
                        className="inline-block cursor-pointer p-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 transition"
                    >
                        <img
                            src={image ? URL.createObjectURL(image) : assets.upload_area}
                            className="w-24 h-24 rounded-lg object-cover"
                            alt="album cover"
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                        Album Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        type="text"
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                        placeholder="e.g. Top Bollywood Hits"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                        Album Description
                    </label>
                    <input
                        onChange={(e) => setDesc(e.target.value)}
                        value={desc}
                        type="text"
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                        placeholder="e.g. The hottest tracks right now"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                        Theme Background Color
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            onChange={(e) => setColour(e.target.value)}
                            value={colour}
                            type="color"
                            className="w-10 h-10 rounded-lg cursor-pointer bg-neutral-800 border border-neutral-700"
                        />
                        <span className="font-mono text-sm text-neutral-300">{colour}</span>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm shadow-xl shadow-green-500/20 active:scale-95 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Album'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddAlbum;
