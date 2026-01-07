import { useNavigate } from "react-router-dom";

function AlbumItem({ image, name, desc, id }) {
    const navigate = useNavigate();
    return (
        <div 
            onClick={() => navigate(`/album/${id}`)} 
            className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] transition-all"
        >
            <img 
                className="rounded w-full h-[180px] object-cover" 
                src={image} 
                alt={name} 
            />
            <p className="font-bold mt-2 mb-1 text-white">{name}</p>
            <p className="text-slate-200 text-sm">{desc}</p>
        </div>
    )
}

export default AlbumItem
