import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ setToken }) => {
    const navigate = useNavigate();
    
    const logout = () => {
        setToken('');
        navigate('/');
    };

    return (
        <div className='navbar w-full border-b-2 border-gray-800 px-5 sm:px-12 py-4 text-lg flex justify-between items-center'>
            <p>Admin Panel</p>
            <button onClick={logout} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>Logout</button>
        </div>
    )
}

export default Navbar
