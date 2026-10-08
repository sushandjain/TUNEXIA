import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('TuneXIA ErrorBoundary caught error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleHardReset = async () => {
        try {
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
            }
        } catch (e) {
            console.error('Failed clearing caches during hard reset:', e);
        }
        window.location.href = window.location.origin + '/?reset=' + Date.now();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 selection:bg-green-500 selection:text-black font-sans">
                    <div className="max-w-md w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center text-2xl font-bold mx-auto">
                            ♫
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white tracking-tight">Playback or UI Interruption</h2>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                                A stale cache or unexpected script error occurred. You can reload the page or reset the offline cache to load the latest release.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm shadow-lg shadow-green-500/20 active:scale-95 transition"
                            >
                                Reload App
                            </button>
                            <button
                                onClick={this.handleHardReset}
                                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs border border-neutral-700 active:scale-95 transition"
                            >
                                Clear Offline Cache & Hard Reset
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
