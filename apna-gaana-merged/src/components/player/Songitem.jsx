import React, { useContext } from "react";
import { PlayerContext } from "../../context/PlayerContext";
import OptimizedImage from "../common/OptimizedImage";

function SongsItem({ image, name, desc, id }) {
    const { playWithId, track, playStatus } = useContext(PlayerContext);
    const isCurrentTrack = track && track._id === id;

    return (
        <div 
            onClick={() => playWithId(id)} 
            className={`w-full p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 group flex flex-col h-full ${
                isCurrentTrack ? 'bg-neutral-800 ring-1 ring-green-500' : 'bg-[#181818]/60 hover:bg-[#282828]'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && playWithId(id)}
            aria-label={`Play ${name}`}
        >
            <div className="relative aspect-square rounded-md overflow-hidden shadow-md mb-2">
                <OptimizedImage
                    className="w-full h-full rounded-md"
                    src={image} 
                    alt={name}
                    width={240}
                    height={240}
                />
                <div className={`absolute bottom-2 right-2 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ${
                    isCurrentTrack && playStatus ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                }`}>
                    <svg className="w-4 h-4 text-black fill-current ml-0.5" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                </div>
            </div>
            <p className={`font-semibold text-xs sm:text-sm truncate mb-0.5 ${
                isCurrentTrack ? 'text-green-400' : 'text-white'
            }`}>
                {name}
            </p>
            <p className="text-neutral-400 text-xs truncate mt-auto">{desc}</p>
        </div>
    );
}

export default React.memo(SongsItem);
