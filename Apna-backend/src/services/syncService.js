import cron from 'node-cron';
import songModel from '../models/songModel.js';
import syncSettingModel from '../models/syncSettingModel.js';
import { getProvider } from './musicProviders/index.js';
import { invalidateSongsCache } from '../controllers/Songcontroller.js';

let cronTask = null;

/**
 * Executes a sync pass against the configured provider
 */
export async function runSyncPass(isManual = false) {
    let settings = await syncSettingModel.findOne({ key: "default_sync" });
    if (!settings) {
        settings = await syncSettingModel.create({ key: "default_sync", enabled: false });
    }

    if (!isManual && !settings.enabled) {
        return { success: false, message: "Auto-sync is currently disabled in settings." };
    }

    const providerName = settings.provider || 'itunes';
    const limit = settings.limit || 20;
    const autoPublish = Boolean(settings.autoPublish);
    const provider = getProvider(providerName);

    console.log(`[SyncService] Starting sync pass using provider: ${providerName} (Limit: ${limit}, AutoPublish: ${autoPublish})`);

    try {
        await syncSettingModel.updateOne(
            { key: "default_sync" },
            { lastRunStatus: "Running...", lastRunAt: new Date() }
        );

        // Fetch trending and new release tracks
        const [trending, newReleases] = await Promise.allSettled([
            provider.getTrendingTracks({ limit, genre: settings.genre }),
            provider.getNewReleases({ limit, genre: settings.genre })
        ]);

        const rawList = [
            ...(trending.status === 'fulfilled' ? trending.value : []),
            ...(newReleases.status === 'fulfilled' ? newReleases.value : [])
        ];

        let addedCount = 0;
        let duplicateCount = 0;

        for (const track of rawList) {
            if (!track || !track.name || !track.file) continue;

            // Check duplicate by externalId or exact title+artist
            const existing = await songModel.findOne({
                $or: [
                    { source: track.source, externalId: track.externalId },
                    { name: track.name, artist: track.artist }
                ]
            });

            if (existing) {
                duplicateCount++;
                continue;
            }

            // Create new song document
            await songModel.create({
                name: track.name,
                artist: track.artist,
                desc: track.desc,
                album: track.album || "Single",
                image: track.image,
                file: track.file,
                duration: track.duration,
                source: track.source,
                externalId: track.externalId,
                externalUrl: track.externalUrl,
                previewOnly: track.previewOnly,
                importedAt: new Date(),
                isPublished: autoPublish
            });

            addedCount++;
        }

        invalidateSongsCache();

        const logMsg = `Successfully imported ${addedCount} new tracks (${duplicateCount} duplicates skipped). Status: ${autoPublish ? 'Published' : 'Drafts'}.`;
        console.log(`[SyncService] ${logMsg}`);

        await syncSettingModel.updateOne(
            { key: "default_sync" },
            {
                lastRunStatus: "Success",
                lastRunResult: logMsg,
                lastRunAt: new Date()
            }
        );

        return {
            success: true,
            importedCount: addedCount,
            duplicateCount,
            message: logMsg
        };

    } catch (err) {
        const errorMsg = `Sync failed: ${err.message}`;
        console.error(`[SyncService] ${errorMsg}`);

        await syncSettingModel.updateOne(
            { key: "default_sync" },
            {
                lastRunStatus: "Failed",
                lastRunResult: errorMsg,
                lastRunAt: new Date()
            }
        );

        return { success: false, message: errorMsg };
    }
}

/**
 * Initializes the cron scheduler from database settings
 */
export async function initScheduler() {
    try {
        let settings = await syncSettingModel.findOne({ key: "default_sync" });
        if (!settings) {
            settings = await syncSettingModel.create({ key: "default_sync", enabled: false });
        }

        if (cronTask) {
            cronTask.stop();
            cronTask = null;
        }

        // Interval to cron map
        let schedule = '0 0 * * *'; // default daily at midnight
        if (settings.interval === 'hourly') schedule = '0 * * * *';
        else if (settings.interval === 'weekly') schedule = '0 0 * * 0';

        if (settings.enabled) {
            console.log(`[SyncService] Scheduling auto-sync cron with pattern: "${schedule}" (${settings.interval})`);
            cronTask = cron.schedule(schedule, () => {
                runSyncPass(false);
            });
        } else {
            console.log('[SyncService] Auto-sync is currently disabled.');
        }
    } catch (e) {
        console.error('[SyncService] Failed to initialize scheduler:', e.message);
    }
}
