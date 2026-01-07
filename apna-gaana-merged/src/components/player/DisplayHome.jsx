import { useContext } from "react"
import AlbumItem from "./AlbumItem"
import Navbar from "./Navbar"
import SongsItem from "./Songitem"
import { PlayerContext } from '../../context/PlayerContext';

function DisplayHome() {
    const { songsData, albumsData } = useContext(PlayerContext)
    
    return (
        <>
            <Navbar />
            <div className="mb-8">
                <h1 className="my-5 font-bold text-2xl">Featured Charts</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {albumsData.slice(0, 5).map((item, index) => (
                        <AlbumItem 
                            key={item._id} 
                            image={item.image} 
                            name={item.name} 
                            desc={item.desc} 
                            id={item._id} 
                        />
                    ))}
                </div>
            </div>
            <div className="mb-20">
                <h1 className="my-5 font-bold text-2xl">Today&apos;s biggest hits</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {songsData.slice(0, 5).map((item, index) => (
                        <SongsItem 
                            key={item._id} 
                            image={item.image} 
                            name={item.name} 
                            desc={item.desc} 
                            id={item._id} 
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default DisplayHome
