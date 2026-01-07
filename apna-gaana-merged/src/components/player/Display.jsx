import { useContext } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import DisplayHome from './DisplayHome'
import DisplayAlbum from './DisplayAlbum'
import Library from './Library'
import { PlayerContext } from '../../context/PlayerContext'

const Display = () => {
    const { albumsData } = useContext(PlayerContext);
    const location = useLocation();
    const isAlbum = location.pathname.includes("album");
    const albumId = isAlbum ? location.pathname.split('/').pop() : "";
    const bgColor = isAlbum && albumsData.length > 0
        ? albumsData.find(x => x._id === albumId)?.bgColor || "#121212"
        : "#121212";

    return (
        <div className='w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0'>
            {albumsData.length > 0 ? (
                <>
                    {isAlbum ? (
                        <div
                            className='h-36 rounded'
                            style={{ background: `linear-gradient(${bgColor}, #121212)` }}
                        ></div>
                    ) : null}
                    <Routes>
                        <Route path='/' element={<DisplayHome />} />
                        <Route path='/album/:id' element={<DisplayAlbum />} />
                        <Route path='/library' element={<Library />} />
                    </Routes>
                </>
            ) : null}
        </div>
    )
}

export default Display
