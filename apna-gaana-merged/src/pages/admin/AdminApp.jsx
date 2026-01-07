import React, { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AddSong from './AddSong';
import ListSong from './ListSong';
import AddAlbum from './AddAlbum';
import ListAlbum from './ListAlbum';
import AdminSidebar from '../../components/admin/Sidebar';
import AdminNavbar from '../../components/admin/Navbar';
import Login from './Login';

const AdminApp = () => {
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleSetToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('adminToken', newToken);
        } else {
            localStorage.removeItem('adminToken');
        }
    };

    return (
        <div>
            {token ? (
                <div className='flex items-start min-h-screen'>
                    <AdminSidebar />
                    <div className='flex-1 h-screen overflow-y-scroll bg-white'>
                        <AdminNavbar setToken={handleSetToken} />
                        <div className='pt-8 pl-5 sm:pt-12'>
                            <Routes>
                                <Route path="/" element={<Navigate to="/admin/add-song" replace />} />
                                <Route path="/add-song" element={<AddSong token={token} />} />
                                <Route path="/list-song" element={<ListSong token={token} />} />
                                <Route path="/add-album" element={<AddAlbum token={token} />} />
                                <Route path="/list-album" element={<ListAlbum token={token} />} />
                            </Routes>
                        </div>
                    </div>
                </div>
            ) : (
                <Login setToken={handleSetToken} />
            )}
        </div>
    )
}

export default AdminApp
