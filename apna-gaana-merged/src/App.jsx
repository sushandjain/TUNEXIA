import { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Player App Components
import Display from './components/player/Display'
import Player from './components/player/Player'
import Sidebar from './components/player/Sidebar'
import { PlayerContext } from './context/PlayerContext'

// Admin App
import AdminApp from './pages/admin/AdminApp'

const App = () => {
  const { audioRef, track, songsData } = useContext(PlayerContext);

  return (
    <div className='min-h-screen bg-black'>
      <ToastContainer />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* Player App Routes */}
        <Route path="/*" element={
          <div className='h-screen bg-black'>
            <div className="h-[90%] flex">
              <Sidebar />
              <Display />
            </div>
            <Player />
            <audio ref={audioRef} src={track ? track.file : ""} preload='auto'></audio>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
