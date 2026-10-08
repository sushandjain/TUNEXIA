import BaseProvider from './BaseProvider.js';

export default class AudiusProvider extends BaseProvider {
    constructor() {
        super('audius');
        this.appName = 'tunexia_app';
        this.host = 'https://api.audius.co';
    }

    async resolveHost() {
        try {
            const res = await fetch('https://api.audius.co', { signal: AbortSignal.timeout(4000) });
            if (res.ok) {
                const json = await res.json();
                if (json.data && json.data.length > 0) {
                    this.host = json.data[0];
                }
            }
        } catch (e) {
            // Fallback to default host
            this.host = 'https://api.audius.co';
        }
    }

    async searchTracks(query, options = {}) {
        await this.resolveHost();
        const limit = options.limit || 25;
        const url = `${this.host}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${this.appName}&limit=${limit}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`Audius API HTTP ${res.status}`);
        const data = await res.json();
        return (data.data || []).map(item => this.normalize(item)).filter(Boolean);
    }

    async getTrendingTracks(options = {}) {
        await this.resolveHost();
        const limit = options.limit || 25;
        const genreParam = options.genre && options.genre !== 'All' ? `&genre=${encodeURIComponent(options.genre)}` : '';
        const url = `${this.host}/v1/tracks/trending?app_name=${this.appName}&limit=${limit}${genreParam}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`Audius API HTTP ${res.status}`);
        const data = await res.json();
        return (data.data || []).map(item => this.normalize(item)).filter(Boolean);
    }

    async getNewReleases(options = {}) {
        // Audius underground/trending serves as fresh independent releases
        return this.getTrendingTracks(options);
    }

    normalize(raw) {
        if (!raw || !raw.id || !raw.title) return null;

        const streamUrl = `${this.host}/v1/tracks/${raw.id}/stream?app_name=${this.appName}`;
        const artwork = raw.artwork?.['1000x1000'] || raw.artwork?.['480x480'] || raw.artwork?.['150x150'] || 'https://placehold.co/600x600/121212/ffffff.png?text=Audius';
        const artist = raw.user?.name || raw.user?.handle || 'Audius Artist';
        const album = raw.genre || 'Independent';

        return {
            name: raw.title.trim(),
            artist: artist.trim(),
            desc: raw.description?.slice(0, 120) || `${artist} • ${album}`,
            album: album.trim(),
            image: artwork,
            file: streamUrl,
            duration: this.formatDuration(raw.duration || 180, false),
            source: 'audius',
            externalId: String(raw.id),
            externalUrl: `https://audius.co${raw.permalink || ''}`,
            previewOnly: false // Full-length streamable!
        };
    }
}
