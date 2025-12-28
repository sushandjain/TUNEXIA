import React from 'react'
  import { ToastContainer, toast } from 'react-toastify';
  import { Routes,Route } from 'react-router-dom';
import AddSong from './pages/AddSong';
import ListSong from './pages/ListSong';
import AddAlbum from './pages/AddAlbum';
import ListAlbum from './pages/ListAlbum';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

export const url=`http://localhost:3004`

const App = () => {
  return (
    <div  className='flex items-start min-h-screen'>
      <ToastContainer/>
      <Sidebar/>
      <div className='flex-1 h-screen overflow-y-scroll bg-white'>
        <Navbar/>
        <div className='pt-8 pl-5 sm:pt-12'>
          <Routes>
            <Route path="/add-song" element={<AddSong/>} />
            <Route path="/list-song" element={<ListSong/>} />
            <Route path="/add-album" element={<AddAlbum/>} />
            <Route path="/list-album" element={<ListAlbum/>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App