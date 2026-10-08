import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: String,
        default: ""
    },
    desc: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true,
        default: "Single"
    },
    image: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true,
        default: "3:30"
    },
    source: {
        type: String,
        enum: ['manual', 'deezer', 'itunes', 'jamendo', 'audius'],
        default: 'manual'
    },
    externalId: {
        type: String,
        default: null
    },
    externalUrl: {
        type: String,
        default: ""
    },
    previewOnly: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        default: ""
    },
    importedAt: {
        type: Date,
        default: null
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for fast lookup, sorting, and deduplication
songSchema.index({ album: 1 });
songSchema.index({ name: 1 });
songSchema.index({ category: 1 });
songSchema.index({ createdAt: -1 });
songSchema.index({ isPublished: 1 });
songSchema.index(
    { source: 1, externalId: 1 },
    {
        unique: true,
        partialFilterExpression: { externalId: { $type: "string" } }
    }
);

const songModel = mongoose.models.song || mongoose.model("song", songSchema);

export default songModel;