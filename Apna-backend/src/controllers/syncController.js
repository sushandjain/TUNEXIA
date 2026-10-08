import syncSettingModel from '../models/syncSettingModel.js';
import { runSyncPass, initScheduler } from '../services/syncService.js';

export const getSyncSettings = async (req, res) => {
    try {
        let settings = await syncSettingModel.findOne({ key: "default_sync" });
        if (!settings) {
            settings = await syncSettingModel.create({ key: "default_sync", enabled: false });
        }
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateSyncSettings = async (req, res) => {
    try {
        const { enabled, provider, interval, autoPublish, genre, limit } = req.body;

        const updated = await syncSettingModel.findOneAndUpdate(
            { key: "default_sync" },
            {
                enabled: Boolean(enabled),
                provider: provider || 'itunes',
                interval: interval || 'daily',
                autoPublish: Boolean(autoPublish),
                genre: genre || 'All',
                limit: Number(limit) || 20
            },
            { new: true, upsert: true }
        );

        // Re-initialize scheduler with updated interval
        await initScheduler();

        res.json({
            success: true,
            message: "Sync settings updated successfully",
            settings: updated
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const triggerSyncNow = async (req, res) => {
    try {
        const result = await runSyncPass(true); // true = isManual
        res.json({
            success: result.success,
            message: result.message,
            importedCount: result.importedCount,
            duplicateCount: result.duplicateCount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
