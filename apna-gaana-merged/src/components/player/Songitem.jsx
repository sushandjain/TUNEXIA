import { useContext } from "react"
import { PlayerContext } from "../../context/PlayerContext"

function SongsItem({ image, name, desc, id }) {
    const { playWithId } = useContext(PlayerContext);
    return (
        <div 
            onClick={() => playWithId(id)} 
            className="w-[180px] flex-shrink-0 p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] transition-all"
        >
            <img 
                className="rounded w-[180px] h-[180px] object-cover" 
                src={image} 
                alt={name} 
            />
            <p className="font-bold mt-2 mb-1 text-white">{name}</p>
            <p className="text-slate-200 text-sm">{desc}</p>
        </div>
    )
}

export default SongsItem
