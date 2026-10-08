import mongoose from "mongoose";

const syncSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        default: "default_sync",
        unique: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    provider: {
        type: String,
        enum: ['itunes', 'deezer', 'audius', 'jamendo'],
        default: 'itunes'
    },
    interval: {
        type: String,
        default: 'daily' // 'hourly', 'daily', 'weekly'
    },
    cronSchedule: {
        type: String,
        default: '0 0 * * *' // At midnight
    },
    autoPublish: {
        type: Boolean,
        default: false // Imported songs saved as drafts by default
    },
    genre: {
        type: String,
        default: 'All'
    },
    limit: {
        type: Number,
        default: 20
    },
    lastRunAt: {
        type: Date,
        default: null
    },
    lastRunStatus: {
        type: String,
        default: "Idle"
    },
    lastRunResult: {
        type: String,
        default: "No sync has been performed yet."
    }
}, {
    timestamps: true
});

const syncSettingModel = mongoose.models.syncSetting || mongoose.model("syncSetting", syncSettingSchema);

export default syncSettingModel;
