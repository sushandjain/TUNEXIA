import songModel from "../src/models/songModel.js";

// Categories with prioritized providers and targeted regional/genre search terms
export const IMPORT_CATEGORIES = [
    {
        key: 'hindi-trending',
        name: 'Hindi Trending',
        description: 'Latest trending Bollywood and Hindi pop releases',
        providers: [
            { provider: 'itunes', terms: ['Hindi Hits 2026', 'Arijit Singh Top', 'Bollywood Hits'], country: 'in' },
            { provider: 'deezer', terms: ['Hindi Top Hits', 'Bollywood 2026'] },
            { provider: 'audius', terms: ['Bollywood Hindi'] }
        ]
    },
    {
        key: 'kannada-devotional',
        name: 'Kannada Devotional',
        description: 'Traditional and sacred devotional Kannada songs & chants',
        providers: [
            { provider: 'itunes', terms: ['Kannada Devotional', 'Bhakti Geethegalu', 'Kannada Aarti'], country: 'in' },
            { provider: 'deezer', terms: ['Kannada Devotional', 'Kannada Bhakti'] },
            { provider: 'audius', terms: ['Kannada devotional'] },
            { provider: 'jamendo', terms: ['meditation chant ambient'] }
        ]
    },
    {
        key: 'english-hits',
        name: 'English Global Hits',
        description: 'Worldwide billboard and pop charting singles',
        providers: [
            { provider: 'itunes', terms: ['Top Hits Today', 'Pop Chart 2026'], country: 'us' },
            { provider: 'deezer', terms: ['Top Chart Global', 'Pop 2026'] },
            { provider: 'audius', terms: ['Pop Electronic'] }
        ]
    },
    {
        key: 'punjabi-pop',
        name: 'Punjabi Pop',
        description: 'High-energy Punjabi dance and urban pop',
        providers: [
            { provider: 'itunes', terms: ['Punjabi Hits', 'Diljit Dosanjh Top'], country: 'in' },
            { provider: 'deezer', terms: ['Punjabi pop', 'Bhangra 2026'] }
        ]
    },
    {
        key: 'lofi-chill',
        name: 'Lo-Fi Study & Chill',
        description: 'Relaxing ambient beats for concentration and focus',
        providers: [
            { provider: 'audius', terms: ['lofi study chill'] },
            { provider: 'jamendo', terms: ['lofi chillout ambient'] },
            { provider: 'itunes', terms: ['Lofi Beats', 'Chillhop'], country: 'us' }
        ]
    }
];

// Helper: Format seconds or milliseconds to M:SS
export function formatDuration(secondsOrMs) {
    let sec = typeof secondsOrMs === 'number' ? secondsOrMs : parseInt(secondsOrMs) || 0;
    if (sec > 1000) sec = Math.floor(sec / 1000); // Convert ms to sec
    const mins = Math.floor(sec / 60);
    const rem = Math.floor(sec % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

// ADAPT SPOT 1: toSongDoc maps external track objects to Tunexia Song model
export function toSongDoc(raw, categoryKey, isPublished = false) {
    return {
        name: (raw.name || raw.title || 'Untitled Track').trim(),
        artist: (raw.artist || raw.artistName || 'Unknown Artist').trim(),
        desc: (raw.desc || `${raw.artist || 'Unknown Artist'} • ${raw.album || 'Single'}`).trim(),
        album: (raw.album || 'Single').trim(),
        image: raw.image || raw.artwork || 'https://picsum.photos/seed/music/600/600',
        file: raw.file || raw.previewUrl || raw.streamUrl,
        duration: raw.duration || '3:30',
        source: raw.source || 'itunes',
        externalId: String(raw.externalId || raw.id || `${Date.now()}_${Math.random()}`),
        externalUrl: raw.externalUrl || '',
        previewOnly: Boolean(raw.previewOnly ?? true),
        category: categoryKey,
        isPublished: Boolean(isPublished), // Defaults to false (drafts) as required
        importedAt: new Date()
    };
}

// ==========================================
// PROVIDER FETCH IMPLEMENTATIONS
// ==========================================

export async function fetchFromDeezer(term, limit = 10) {
    try {
        const url = `https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=${limit}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.data || !Array.isArray(data.data)) return [];

        return data.data.map(item => ({
            name: item.title,
            artist: item.artist?.name || 'Unknown Artist',
            album: item.album?.title || 'Single',
            image: item.album?.cover_big || item.album?.cover_medium || item.album?.cover || 'https://picsum.photos/seed/deezer/600/600',
            file: item.preview,
            duration: formatDuration(item.duration),
            source: 'deezer',
            externalId: String(item.id),
            externalUrl: item.link || '',
            previewOnly: true
        })).filter(t => t.file);
    } catch (err) {
        console.error(`[Deezer] Fetch error for "${term}":`, err.message);
        return [];
    }
}

export async function fetchFromITunes(term, country = 'in', limit = 10) {
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&media=music&entity=song&limit=${limit}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.results || !Array.isArray(data.results)) return [];

        return data.results.map(item => ({
            name: item.trackName,
            artist: item.artistName || 'Unknown Artist',
            album: item.collectionName || 'Single',
            image: (item.artworkUrl100 || '').replace(/100x100bb/, '600x600bb') || 'https://picsum.photos/seed/itunes/600/600',
            file: item.previewUrl,
            duration: formatDuration(item.trackTimeMillis || 210000),
            source: 'itunes',
            externalId: String(item.trackId),
            externalUrl: item.trackViewUrl || '',
            previewOnly: true
        })).filter(t => t.file);
    } catch (err) {
        console.error(`[iTunes] Fetch error for "${term}":`, err.message);
        return [];
    }
}

export async function fetchFromJamendo(tagsOrQuery, limit = 10) {
    try {
        const clientId = process.env.JAMENDO_CLIENT_ID || 'b2a03f47'; // Public read-only client id
        const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=jsonpretty&limit=${limit}&namesearch=${encodeURIComponent(tagsOrQuery)}&include=musicinfo&audioformat=mp32`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.results || !Array.isArray(data.results)) return [];

        return data.results.map(item => ({
            name: item.name,
            artist: item.artist_name || 'Jamendo Artist',
            album: item.album_name || 'Jamendo CC',
            image: item.image || item.album_image || 'https://picsum.photos/seed/jamendo/600/600',
            file: item.audio,
            duration: formatDuration(item.duration || 180),
            source: 'jamendo',
            externalId: String(item.id),
            externalUrl: item.shareurl || '',
            previewOnly: false
        })).filter(t => t.file);
    } catch (err) {
        console.error(`[Jamendo] Fetch error for "${tagsOrQuery}":`, err.message);
        return [];
    }
}

export async function fetchFromAudius(query, limit = 10) {
    try {
        const url = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&app_name=TunexiaMusic`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.data || !Array.isArray(data.data)) return [];

        return data.data.map(item => ({
            name: item.title,
            artist: item.user?.name || item.user?.handle || 'Audius Creator',
            album: 'Audius Stream',
            image: item.artwork?.['480x480'] || item.artwork?.['150x150'] || 'https://picsum.photos/seed/audius/600/600',
            file: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=TunexiaMusic`,
            duration: formatDuration(item.duration || 200),
            source: 'audius',
            externalId: String(item.id),
            externalUrl: `https://audius.co${item.permalink || ''}`,
            previewOnly: false
        })).filter(t => t.file);
    } catch (err) {
        console.error(`[Audius] Fetch error for "${query}":`, err.message);
        return [];
    }
}

// ==========================================
// CATEGORY IMPORT ENGINE
// ==========================================

export async function importCategory(categoryKey, options = {}) {
    const { pages = 1, limitPerPage = 10, autoPublish = false } = options;
    const cat = IMPORT_CATEGORIES.find(c => c.key === categoryKey);

    if (!cat) {
        throw new Error(`Category "${categoryKey}" not recognized.`);
    }

    const targetLimit = Math.max(1, pages * limitPerPage);
    const gathered = [];
    const providerResults = {};

    for (const provConfig of cat.providers) {
        const { provider, terms, country } = provConfig;
        providerResults[provider] = { attempted: 0, fetched: 0, termsTested: [] };

        for (const term of terms) {
            let tracks = [];
            providerResults[provider].termsTested.push(term);

            if (provider === 'itunes') {
                tracks = await fetchFromITunes(term, country || 'in', Math.min(15, targetLimit));
            } else if (provider === 'deezer') {
                tracks = await fetchFromDeezer(term, Math.min(15, targetLimit));
            } else if (provider === 'jamendo') {
                tracks = await fetchFromJamendo(term, Math.min(15, targetLimit));
            } else if (provider === 'audius') {
                tracks = await fetchFromAudius(term, Math.min(15, targetLimit));
            }

            providerResults[provider].fetched += tracks.length;
            gathered.push(...tracks);

            if (gathered.length >= targetLimit * 2) break; // Gathered sufficient candidates
        }
    }

    let importedCount = 0;
    let skippedCount = 0;
    const insertedSongs = [];

    for (const raw of gathered) {
        if (!raw.name || !raw.file) continue;

        // Check if track already exists by (source, externalId) or (name, artist)
        const exists = await songModel.findOne({
            $or: [
                { source: raw.source, externalId: String(raw.externalId) },
                { name: raw.name.trim(), artist: raw.artist.trim() }
            ]
        });

        if (exists) {
            skippedCount++;
            continue;
        }

        // Convert to Song Doc (Drafted by default: isPublished = false)
        const songDoc = toSongDoc(raw, categoryKey, autoPublish);
        const created = await songModel.create(songDoc);
        insertedSongs.push(created);
        importedCount++;

        if (importedCount >= targetLimit) break;
    }

    return {
        category: categoryKey,
        name: cat.name,
        importedCount,
        skippedCount,
        candidatesFound: gathered.length,
        providerStats: providerResults,
        insertedSongs
    };
}
