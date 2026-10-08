/**
 * Base Music Provider Class
 * Defines the standard contract and normalizer for external music catalog services.
 */
export default class BaseProvider {
    constructor(name) {
        this.name = name;
    }

    /**
     * Search songs by keyword
     * @param {string} query
     * @param {object} options
     * @returns {Promise<Array>}
     */
    async searchTracks(query, options = {}) {
        throw new Error(`searchTracks not implemented in ${this.name}`);
    }

    /**
     * Fetch trending / chart tracks
     * @param {object} options
     * @returns {Promise<Array>}
     */
    async getTrendingTracks(options = {}) {
        throw new Error(`getTrendingTracks not implemented in ${this.name}`);
    }

    /**
     * Fetch new music releases
     * @param {object} options
     * @returns {Promise<Array>}
     */
    async getNewReleases(options = {}) {
        throw new Error(`getNewReleases not implemented in ${this.name}`);
    }

    /**
     * Normalize a provider-specific track object into Tunexia Song schema
     * @param {object} raw
     * @returns {object}
     */
    normalize(raw) {
        throw new Error(`normalize not implemented in ${this.name}`);
    }

    /**
     * Helper to format seconds or milliseconds to mm:ss
     */
    formatDuration(secondsOrMs, isMs = false) {
        const totalSeconds = Math.round(isMs ? secondsOrMs / 1000 : secondsOrMs);
        if (!totalSeconds || isNaN(totalSeconds)) return "3:30";
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
