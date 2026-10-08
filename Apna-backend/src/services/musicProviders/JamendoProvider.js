import BaseProvider from './BaseProvider.js';

export default class JamendoProvider extends BaseProvider {
    constructor() {
        super('jamendo');
        this.baseUrl = 'https://api.jamendo.com/v3.0';
        this.clientId = process.env.JAMENDO_CLIENT_ID || '56d30c95'; // Jamendo demo client id
    }

    async searchTracks(query, options = {}) {
        const limit = options.limit || 25;
        const res = await fetch(`${this.baseUrl}/tracks/?client_id=${this.clientId}&format=json&limit=${limit}&namesearch=${encodeURIComponent(query)}&include=musicinfo`);
        if (!res.ok) throw new Error(`Jamendo API HTTP ${res.status}`);
        const data = await res.json();
        return (data.results || []).map(item => this.normalize(item)).filter(Boolean);
    }

    async getTrendingTracks(options = {}) {
        const limit = options.limit || 25;
        const genreParam = options.genre && options.genre !== 'All' ? `&fuzzytags=${encodeURIComponent(options.genre)}` : '';
        const res = await fetch(`${this.baseUrl}/tracks/?client_id=${this.clientId}&format=json&limit=${limit}&order=popularity_total${genreParam}&include=musicinfo`);
        if (!res.ok) throw new Error(`Jamendo API HTTP ${res.status}`);
        const data = await res.json();
        return (data.results || []).map(item => this.normalize(item)).filter(Boolean);
    }

    async getNewReleases(options = {}) {
        const limit = options.limit || 25;
        const res = await fetch(`${this.baseUrl}/tracks/?client_id=${this.clientId}&format=json&limit=${limit}&order=releasedate_desc&include=musicinfo`);
        if (!res.ok) throw new Error(`Jamendo API HTTP ${res.status}`);
        const data = await res.json();
        return (data.results || []).map(item => this.normalize(item)).filter(Boolean);
    }

    normalize(raw) {
        if (!raw || !raw.id || !raw.name || !raw.audio) return null;

        const artist = raw.artist_name || 'Jamendo Artist';
        const album = raw.album_name || 'Jamendo Release';
        const cover = raw.image || raw.album_image || 'https://placehold.co/600x600/121212/ffffff.png?text=Jamendo';

        return {
            name: raw.name.trim(),
            artist: artist.trim(),
            desc: `${artist} • CC Licensed`,
            album: album.trim(),
            image: cover,
            file: raw.audio,
            duration: this.formatDuration(raw.duration || 200, false),
            source: 'jamendo',
            externalId: String(raw.id),
            externalUrl: raw.shareurl || '',
            previewOnly: false // Full length Creative Commons track!
        };
    }
}
