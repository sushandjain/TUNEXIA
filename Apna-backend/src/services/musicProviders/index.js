import iTunesProvider from './iTunesProvider.js';
import DeezerProvider from './DeezerProvider.js';
import AudiusProvider from './AudiusProvider.js';
import JamendoProvider from './JamendoProvider.js';

/**
 * ARCHITECTURE NOTE:
 * External music providers are implemented behind a common BaseProvider contract.
 * - iTunes: Free public catalog, 30s previews, high-res covers (No key required).
 * - Deezer: Public search & charts, 30s previews (No key required for basic search).
 * - Audius: Decentralized independent music, FULL-LENGTH free audio streaming.
 * - Jamendo: Creative Commons licensed music, FULL-LENGTH streaming.
 * 
 * LEGAL & COMPLIANCE NOTE:
 * Unofficial or scraping-based providers (such as reverse-engineered JioSaavn, Spotify, or YouTube
 * scrapers) carry severe Terms of Service and copyright infringement risks. They are deliberately
 * NOT included by default. Any future provider must implement BaseProvider.
 */

const providers = {
    itunes: new iTunesProvider(),
    deezer: new DeezerProvider(),
    audius: new AudiusProvider(),
    jamendo: new JamendoProvider()
};

// In-memory cache for provider search/chart responses (5-minute TTL)
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(providerName, action, param) {
    return `${providerName}:${action}:${param}`;
}

export function getProvider(name) {
    const key = (name || 'itunes').toLowerCase();
    return providers[key] || providers.itunes;
}

export async function cachedProviderCall(providerName, action, queryOrOptions) {
    const provider = getProvider(providerName);
    const paramKey = typeof queryOrOptions === 'string' ? queryOrOptions : JSON.stringify(queryOrOptions || {});
    const cacheKey = getCacheKey(provider.name, action, paramKey);

    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data;
    }

    let results = [];
    if (action === 'search') {
        results = await provider.searchTracks(queryOrOptions);
    } else if (action === 'trending') {
        results = await provider.getTrendingTracks(queryOrOptions);
    } else if (action === 'newReleases') {
        results = await provider.getNewReleases(queryOrOptions);
    }

    cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
    });

    return results;
}

export { providers };
