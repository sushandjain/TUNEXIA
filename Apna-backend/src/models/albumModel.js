import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true
    },
    bgColor: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Indexes for fast lookup and sorting
albumSchema.index({ name: 1 });
albumSchema.index({ createdAt: -1 });

const albumModel = mongoose.models.album || mongoose.model("album", albumSchema);

export default albumModel;