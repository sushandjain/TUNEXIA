import express from "express";
import cron from "node-cron";
import { IMPORT_CATEGORIES, importCategory } from "./importService.js";
import songModel from "../src/models/songModel.js";
import authAdmin from "../src/middleware/auth.js";

const adminImportRouter = express.Router();

// ADAPT SPOT 2: Protect all import management endpoints with existing authAdmin middleware
adminImportRouter.use(authAdmin);

// In-memory sync state
let syncState = {
    isRunning: false,
    lastRunAt: null,
    lastResult: "No sync performed yet."
};

/**
 * GET /api/admin/import/categories
 * Returns all configured categories with real-time stats from database
 */
adminImportRouter.get("/categories", async (req, res) => {
    try {
        const categoriesWithStats = await Promise.all(
            IMPORT_CATEGORIES.map(async (cat) => {
                const [totalImported, drafts, published] = await Promise.all([
                    songModel.countDocuments({ category: cat.key }),
                    songModel.countDocuments({ category: cat.key, isPublished: false }),
                    songModel.countDocuments({ category: cat.key, isPublished: { $ne: false } })
                ]);

                return {
                    ...cat,
                    stats: {
                        totalImported,
                        drafts,
                        published
                    }
                };
            })
        );

        res.json({
            success: true,
            categories: categoriesWithStats,
            syncState
        });
    } catch (error) {
        console.error("Error in GET /categories:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/admin/import/run/:category
 * Runs import for a single category with pages=1 by default
 */
adminImportRouter.post("/run/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const pages = parseInt(req.query.pages || req.body.pages || 1);
        const autoPublish = Boolean(req.body.autoPublish || false);

        const result = await importCategory(category, {
            pages,
            limitPerPage: 10,
            autoPublish
        });

        res.json({
            success: true,
            message: `Imported ${result.importedCount} track(s) for ${result.name}. (Skipped ${result.skippedCount} duplicates)`,
            result
        });
    } catch (error) {
        console.error("Error in POST /run/:category:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/admin/import/run-all
 * Runs import for all categories sequentially
 */
adminImportRouter.post("/run-all", async (req, res) => {
    try {
        const pages = parseInt(req.query.pages || req.body.pages || 1);
        const autoPublish = Boolean(req.body.autoPublish || false);

        const results = [];
        for (const cat of IMPORT_CATEGORIES) {
            try {
                const r = await importCategory(cat.key, { pages, limitPerPage: 10, autoPublish });
                results.push(r);
            } catch (err) {
                results.push({ category: cat.key, error: err.message, importedCount: 0 });
            }
        }

        const totalImported = results.reduce((acc, curr) => acc + (curr.importedCount || 0), 0);
        const totalSkipped = results.reduce((acc, curr) => acc + (curr.skippedCount || 0), 0);

        res.json({
            success: true,
            message: `Processed all categories: ${totalImported} imported, ${totalSkipped} duplicates skipped.`,
            totalImported,
            totalSkipped,
            results
        });
    } catch (error) {
        console.error("Error in POST /run-all:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/admin/import/publish-category/:category
 * Bulk publishes all drafts in a given category
 */
adminImportRouter.post("/publish-category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const result = await songModel.updateMany(
            { category, isPublished: false },
            { $set: { isPublished: true } }
        );

        res.json({
            success: true,
            message: `Published ${result.modifiedCount} tracks in category ${category}.`,
            publishedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error in publish-category:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * ADAPT SPOT 3: startSync() background cron job
 * Runs daily at midnight UTC to automatically fetch fresh tracks
 */
export function startSync() {
    try {
        // Runs daily at midnight (0 0 * * *)
        cron.schedule("0 0 * * *", async () => {
            console.log("[AutoSync] Triggering scheduled category sync...");
            syncState.isRunning = true;
            try {
                let totalAdded = 0;
                for (const cat of IMPORT_CATEGORIES) {
                    const r = await importCategory(cat.key, { pages: 1, limitPerPage: 5, autoPublish: false });
                    totalAdded += r.importedCount;
                }
                syncState.lastRunAt = new Date();
                syncState.lastResult = `Success: Added ${totalAdded} fresh draft tracks across categories.`;
                console.log(`[AutoSync] Completed: ${syncState.lastResult}`);
            } catch (err) {
                syncState.lastResult = `Failed: ${err.message}`;
                console.error("[AutoSync] Error during sync:", err);
            } finally {
                syncState.isRunning = false;
            }
        });

        console.log("✅ Tunexia AutoSync scheduler registered (daily midnight)");
    } catch (err) {
        console.error("❌ Failed to register AutoSync cron:", err.message);
    }
}

export default adminImportRouter;
