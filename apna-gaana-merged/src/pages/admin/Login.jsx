import React, { useState } from 'react';
import axios from 'axios';
import { url } from '../../config';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${url}/api/admin/login`, { username, password });
            if (response.data.success) {
                setToken(response.data.token);
                if (response.data.admin?.username) {
                    localStorage.setItem('adminUsername', response.data.admin.username);
                }
                toast.success('Admin authenticated successfully');
            } else {
                toast.error(response.data.message || 'Authentication failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-950 text-white selection:bg-green-500 selection:text-black">
            <div className="w-full max-w-md p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-green-500 text-black flex items-center justify-center text-xl font-black mx-auto shadow-lg shadow-green-500/20">
                        T
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white">Tunexia Admin</h2>
                    <p className="text-xs text-neutral-400">Sign in to access dashboard, music feeds, and library controls</p>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-green-500 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-green-500 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm shadow-xl shadow-green-500/20 active:scale-95 transition disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
                    </button>
                </form>

                <div className="pt-2 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs text-neutral-400 hover:text-white transition"
                    >
                        ← Return to Public Player
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
