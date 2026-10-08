import BaseProvider from './BaseProvider.js';

export default class iTunesProvider extends BaseProvider {
    constructor() {
        super('itunes');
        this.baseUrl = 'https://itunes.apple.com';
    }

    async searchTracks(query, options = {}) {
        const limit = options.limit || 25;
        const res = await fetch(`${this.baseUrl}/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`);
        if (!res.ok) throw new Error(`iTunes API HTTP ${res.status}`);
        const data = await res.json();
        return (data.results || []).map(item => this.normalize(item)).filter(Boolean);
    }

    async getTrendingTracks(options = {}) {
        const limit = options.limit || 25;
        const term = options.genre && options.genre !== 'All' ? `${options.genre} Hits` : 'Top Hits';
        const res = await fetch(`${this.baseUrl}/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}`);
        if (!res.ok) throw new Error(`iTunes API HTTP ${res.status}`);
        const data = await res.json();
        return (data.results || []).map(item => this.normalize(item)).filter(Boolean);
    }

    async getNewReleases(options = {}) {
        const limit = options.limit || 25;
        const term = options.genre && options.genre !== 'All' ? `${options.genre} New Release` : 'New Releases';
        const res = await fetch(`${this.baseUrl}/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}`);
        if (!res.ok) throw new Error(`iTunes API HTTP ${res.status}`);
        const data = await res.json();
        return (data.results || []).map(item => this.normalize(item)).filter(Boolean);
    }

    normalize(raw) {
        if (!raw || !raw.trackId || !raw.trackName || !raw.previewUrl) return null;

        // Upgrade 100x100 artwork to crisp 600x600 resolution
        const highResArt = (raw.artworkUrl100 || raw.artworkUrl60 || '')
            .replace(/\/\d+x\d+bb\./, '/600x600bb.');

        const artist = raw.artistName || 'Unknown Artist';
        const album = raw.collectionName || 'Single';

        return {
            name: raw.trackName.trim(),
            artist: artist.trim(),
            desc: `${artist} • ${album}`,
            album: album.trim(),
            image: highResArt || 'https://placehold.co/600x600/121212/ffffff.png?text=Cover',
            file: raw.previewUrl,
            duration: this.formatDuration(raw.trackTimeMillis || 30000, true),
            source: 'itunes',
            externalId: String(raw.trackId),
            externalUrl: raw.trackViewUrl || raw.collectionViewUrl || '',
            previewOnly: true // 30-second licensed preview
        };
    }
}
