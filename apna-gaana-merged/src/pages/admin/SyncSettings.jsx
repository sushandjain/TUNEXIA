import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../config';
import { toast } from 'react-toastify';

function SyncSettings({ token }) {
    const [settings, setSettings] = useState({
        enabled: false,
        provider: 'itunes',
        interval: 'daily',
        autoPublish: false,
        genre: 'All',
        limit: 20,
        lastRunAt: null,
        lastRunStatus: 'Idle',
        lastRunResult: 'No sync history'
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [runningSync, setRunningSync] = useState(false);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${url}/api/sync/settings`, {
                headers: { token }
            });
            if (res.data.success && res.data.settings) {
                setSettings(res.data.settings);
            }
        } catch (error) {
            console.error('loadSettings error:', error);
            toast.error('Failed to load auto-sync settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, [token]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put(`${url}/api/sync/settings`, {
                enabled: settings.enabled,
                provider: settings.provider,
                interval: settings.interval,
                autoPublish: settings.autoPublish,
                genre: settings.genre,
                limit: Number(settings.limit)
            }, {
                headers: { token }
            });

            if (res.data.success) {
                toast.success('Sync settings saved and scheduler updated!');
                if (res.data.settings) setSettings(res.data.settings);
            } else {
                toast.error(res.data.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('handleSaveSettings error:', error);
            toast.error(error?.response?.data?.message || 'Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleRunSyncNow = async () => {
        setRunningSync(true);
        try {
            const res = await axios.post(`${url}/api/sync/run`, {}, {
                headers: { token }
            });

            if (res.data.success) {
                toast.success(res.data.message || 'Sync pass completed!');
                loadSettings();
            } else {
                toast.error(res.data.message || 'Sync pass failed');
            }
        } catch (error) {
            console.error('handleRunSyncNow error:', error);
            toast.error(error?.response?.data?.message || 'Error triggering sync pass');
        } finally {
            setRunningSync(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sync Engine & Cron Settings</h1>
                    <p className="text-sm text-neutral-400 mt-1">
                        Configure periodic catalog synchronization from external music streaming APIs.
                    </p>
                </div>
                <button
                    onClick={handleRunSyncNow}
                    disabled={runningSync}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-sm font-bold shadow-lg shadow-green-500/20 active:scale-95 transition disabled:opacity-50"
                >
                    <svg className={`w-4 h-4 ${runningSync ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {runningSync ? 'Executing Sync...' : 'Run Sync Now'}
                </button>
            </div>

            {/* Execution Status Card */}
            <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                            settings.lastRunStatus === 'Success' ? 'bg-green-400' :
                            settings.lastRunStatus === 'Running' ? 'bg-amber-400 animate-pulse' :
                            settings.lastRunStatus === 'Failed' ? 'bg-red-400' : 'bg-neutral-500'
                        }`}></span>
                        Execution Status & History
                    </h2>
                    <span className="text-xs font-mono text-neutral-400">
                        Last Run: {settings.lastRunAt ? new Date(settings.lastRunAt).toLocaleString() : 'Never'}
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 font-mono text-xs text-neutral-300">
                    <p className="text-neutral-400 mb-1">Status Output:</p>
                    <p className="font-semibold text-white">{settings.lastRunResult || 'No sync runs recorded yet.'}</p>
                </div>
            </div>

            {/* Config Form */}
            <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-6">
                <h2 className="text-base font-bold text-white">Automated Scheduler Configuration</h2>

                {/* Enable Auto-Sync Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <div>
                        <p className="text-sm font-bold text-white">Enable Background Auto-Sync</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            When enabled, Tunexia automatically runs node-cron jobs to fetch fresh tracks.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>

                {/* Auto Publish Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <div>
                        <p className="text-sm font-bold text-white">Auto-Publish Imported Songs</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            If turned off, new tracks from the sync engine are saved as drafts for admin review.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoPublish}
                            onChange={(e) => setSettings(prev => ({ ...prev, autoPublish: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Provider Select */}
                    <div>
                        <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                            Default API Provider
                        </label>
                        <select
                            value={settings.provider}
                            onChange={(e) => setSettings(prev => ({ ...prev, provider: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                        >
                            <option value="itunes">iTunes / Apple Music</option>
                            <option value="audius">Audius (Decentralized)</option>
                            <option value="deezer">Deezer Charts</option>
                            <option value="jamendo">Jamendo Free Music</option>
                        </select>
                    </div>

                    {/* Frequency Interval */}
                    <div>
                        <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                            Sync Frequency Interval
                        </label>
                        <select
                            value={settings.interval}
                            onChange={(e) => setSettings(prev => ({ ...prev, interval: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                        >
                            <option value="hourly">Hourly (Every hour at minute 0)</option>
                            <option value="every6h">Every 6 Hours</option>
                            <option value="daily">Daily (Every midnight UTC)</option>
                            <option value="weekly">Weekly (Sunday midnight)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tracks to fetch */}
                    <div>
                        <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                            Tracks to Fetch Per Pass
                        </label>
                        <select
                            value={settings.limit}
                            onChange={(e) => setSettings(prev => ({ ...prev, limit: Number(e.target.value) }))}
                            className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                        >
                            <option value={10}>10 Tracks</option>
                            <option value={20}>20 Tracks</option>
                            <option value={30}>30 Tracks</option>
                            <option value={50}>50 Tracks</option>
                        </select>
                    </div>

                    {/* Genre / Category Filter */}
                    <div>
                        <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                            Genre / Category Focus
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Pop, Bollywood, Electronic, All"
                            value={settings.genre || 'All'}
                            onChange={(e) => setSettings(prev => ({ ...prev, genre: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-green-500"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-sm font-bold shadow-lg transition active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SyncSettings;
