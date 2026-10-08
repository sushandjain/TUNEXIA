import { cachedProviderCall } from '../services/musicProviders/index.js';
import songModel from '../models/songModel.js';
import { invalidateSongsCache } from './Songcontroller.js';

export const searchExternal = async (req, res) => {
    try {
        const { provider = 'itunes', q = '' } = req.query;
        if (!q.trim()) {
            return res.status(400).json({ success: false, message: "Query string 'q' is required." });
        }

        const tracks = await cachedProviderCall(provider, 'search', q.trim());

        // Check which tracks are already imported
        const externalIds = tracks.map(t => t.externalId).filter(Boolean);
        const existing = await songModel.find({
            source: provider,
            externalId: { $in: externalIds }
        }).select('externalId').lean();

        const existingSet = new Set(existing.map(e => e.externalId));
        const enriched = tracks.map(t => ({
            ...t,
            isAlreadyImported: existingSet.has(t.externalId)
        }));

        res.json({ success: true, count: enriched.length, tracks: enriched });
    } catch (err) {
        console.error('searchExternal error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getTrendingExternal = async (req, res) => {
    try {
        const { provider = 'itunes', genre = 'All', limit = 25 } = req.query;
        const tracks = await cachedProviderCall(provider, 'trending', { genre, limit: Number(limit) });

        const externalIds = tracks.map(t => t.externalId).filter(Boolean);
        const existing = await songModel.find({
            source: provider,
            externalId: { $in: externalIds }
        }).select('externalId').lean();

        const existingSet = new Set(existing.map(e => e.externalId));
        const enriched = tracks.map(t => ({
            ...t,
            isAlreadyImported: existingSet.has(t.externalId)
        }));

        res.json({ success: true, count: enriched.length, tracks: enriched });
    } catch (err) {
        console.error('getTrendingExternal error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getNewReleasesExternal = async (req, res) => {
    try {
        const { provider = 'itunes', genre = 'All', limit = 25 } = req.query;
        const tracks = await cachedProviderCall(provider, 'newReleases', { genre, limit: Number(limit) });

        const externalIds = tracks.map(t => t.externalId).filter(Boolean);
        const existing = await songModel.find({
            source: provider,
            externalId: { $in: externalIds }
        }).select('externalId').lean();

        const existingSet = new Set(existing.map(e => e.externalId));
        const enriched = tracks.map(t => ({
            ...t,
            isAlreadyImported: existingSet.has(t.externalId)
        }));

        res.json({ success: true, count: enriched.length, tracks: enriched });
    } catch (err) {
        console.error('getNewReleasesExternal error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const importTracks = async (req, res) => {
    try {
        const { tracks } = req.body;
        const publishImmediately = Boolean(req.body.publishImmediately ?? req.body.autoPublish ?? false);
        const trackList = Array.isArray(tracks) ? tracks : (tracks ? [tracks] : []);

        if (trackList.length === 0) {
            return res.status(400).json({ success: false, message: "No tracks provided to import." });
        }

        let importedCount = 0;
        let skippedCount = 0;
        const savedTracks = [];

        for (const item of trackList) {
            if (!item.name || !item.file) continue;

            // Check if already in database
            const exists = await songModel.findOne({
                $or: [
                    { source: item.source || 'itunes', externalId: item.externalId },
                    { name: item.name, artist: item.artist }
                ]
            });

            if (exists) {
                skippedCount++;
                continue;
            }

            const doc = await songModel.create({
                name: item.name.trim(),
                artist: (item.artist || '').trim(),
                desc: (item.desc || `${item.artist || ''} • ${item.album || ''}`).trim(),
                album: (item.album || 'Single').trim(),
                image: item.image,
                file: item.file,
                duration: item.duration || '3:30',
                source: item.source || 'itunes',
                externalId: item.externalId || null,
                externalUrl: item.externalUrl || '',
                previewOnly: Boolean(item.previewOnly),
                importedAt: new Date(),
                isPublished: Boolean(publishImmediately)
            });

            savedTracks.push(doc);
            importedCount++;
        }

        invalidateSongsCache();

        res.json({
            success: true,
            importedCount,
            skippedCount,
            message: `Imported ${importedCount} track(s)${skippedCount > 0 ? ` (${skippedCount} duplicates skipped)` : ''}.`,
            tracks: savedTracks
        });

    } catch (err) {
        console.error('importTracks error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
