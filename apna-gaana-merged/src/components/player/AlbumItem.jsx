import React from "react";
import { useNavigate } from "react-router-dom";
import OptimizedImage from "../common/OptimizedImage";

function AlbumItem({ image, name, desc, id }) {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/album/${id}`)} 
            className="p-3 sm:p-4 rounded-lg bg-[#181818]/90 hover:bg-[#282828] transition-all duration-200 cursor-pointer group flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-green-500"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/album/${id}`)}
            aria-label={`Open album ${name}`}
        >
            <div className="relative mb-3 aspect-square rounded-md overflow-hidden shadow-lg">
                <OptimizedImage
                    className="w-full h-full rounded-md"
                    src={image} 
                    alt={name}
                    width={260}
                    height={260}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            </div>
            <p className="font-bold text-sm sm:text-base text-white truncate mb-1">{name}</p>
            <p className="text-neutral-400 text-xs sm:text-sm line-clamp-2 mt-auto">{desc}</p>
        </div>
    );
}

export default React.memo(AlbumItem);
