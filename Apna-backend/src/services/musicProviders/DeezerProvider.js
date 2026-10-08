import BaseProvider from './BaseProvider.js';

export default class DeezerProvider extends BaseProvider {
    constructor() {
        super('deezer');
        this.baseUrl = 'https://api.deezer.com';
    }

    async searchTracks(query, options = {}) {
        const limit = options.limit || 25;
        const res = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (!res.ok) throw new Error(`Deezer API HTTP ${res.status}`);
        const data = await res.json();
        return (data.data || []).map(item => this.normalize(item)).filter(Boolean);
    }

    async getTrendingTracks(options = {}) {
        // Fallback to top hits search if public chart requires session
        try {
            const res = await fetch(`${this.baseUrl}/chart/0/tracks?limit=${options.limit || 25}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data && data.data.length > 0) {
                    return data.data.map(item => this.normalize(item)).filter(Boolean);
                }
            }
        } catch (e) {}

        return this.searchTracks(options.genre && options.genre !== 'All' ? `${options.genre} Top` : 'Top Hits 2026', options);
    }

    async getNewReleases(options = {}) {
        return this.searchTracks(options.genre && options.genre !== 'All' ? `${options.genre} 2026` : 'New Releases 2026', options);
    }

    normalize(raw) {
        if (!raw || !raw.id || !raw.title || !raw.preview) return null;

        const artist = raw.artist?.name || 'Deezer Artist';
        const album = raw.album?.title || 'Single';
        const cover = raw.album?.cover_xl || raw.album?.cover_big || raw.album?.cover_medium || 'https://placehold.co/600x600/121212/ffffff.png?text=Cover';

        return {
            name: raw.title.trim(),
            artist: artist.trim(),
            desc: `${artist} • ${album}`,
            album: album.trim(),
            image: cover,
            file: raw.preview,
            duration: this.formatDuration(raw.duration || 30, false),
            source: 'deezer',
            externalId: String(raw.id),
            externalUrl: raw.link || '',
            previewOnly: true // 30-second licensed preview
        };
    }
}
