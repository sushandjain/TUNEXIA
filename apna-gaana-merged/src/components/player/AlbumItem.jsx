import { useNavigate } from "react-router-dom";

function AlbumItem({ image, name, desc, id }) {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => navigate(`/album/${id}`)} 
            className="p-4 rounded-lg bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer group"
        >
            <div className="relative mb-4">
                <img 
                    className="rounded-md w-full aspect-square object-cover shadow-lg" 
                    src={image} 
                    alt={name} 
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-md"></div>
            </div>
            <p className="font-bold text-base text-white truncate mb-1">{name}</p>
            <p className="text-slate-400 text-sm truncate line-clamp-2">{desc}</p>
        </div>
    )
}

export default AlbumItem
