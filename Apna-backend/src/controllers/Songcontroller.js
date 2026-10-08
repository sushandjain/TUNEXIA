import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import fs from "fs";

// Lightweight in-memory cache for fast read performance
let songsCache = {
  data: null,
  timestamp: 0,
  ttl: 300 * 1000 // 5 minutes
};

export const invalidateSongsCache = () => {
  songsCache = { data: null, timestamp: 0, ttl: 300 * 1000 };
};

const addSong = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files received. Make sure you're using multipart/form-data",
      });
    }

    if (!req.files.audio || req.files.audio.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required.",
      });
    }

    if (!req.files.image || req.files.image.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image file is required.",
      });
    }

    const { name, desc, album, artist } = req.body;
    
    if (!name || !desc || !album) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and album are required",
      });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    // Upload to Cloudinary with modern format and quality transformations
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
      folder: "songs/audio",
    });
    
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "songs/images",
      transformation: [
        { width: 600, height: 600, crop: "fill" },
        { fetch_format: "auto", quality: "auto" }
      ]
    });

    // Delete local files after upload
    try { fs.unlinkSync(audioFile.path); } catch (e) {}
    try { fs.unlinkSync(imageFile.path); } catch (e) {}

    // Calculate duration
    const minutes = Math.floor((audioUpload.duration || 0) / 60);
    const seconds = Math.floor((audioUpload.duration || 0) % 60);
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const songData = {
      name: name.trim(),
      artist: (artist || "").trim(),
      desc: desc.trim(),
      album: album.trim(),
      file: audioUpload.secure_url,
      image: imageUpload.secure_url,
      duration,
      source: 'manual',
      isPublished: true, // Manual admin uploads are published by default
      previewOnly: false
    };

    const song = new songModel(songData);
    await song.save();

    invalidateSongsCache();

    res.json({ 
      success: true, 
      message: "Song added successfully", 
      song 
    });

  } catch (error) {
    console.error("Error in addSong:", error);
    
    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        try { fs.unlinkSync(req.files.audio[0].path); } catch (e) {}
      }
      if (req.files.image && req.files.image[0]) {
        try { fs.unlinkSync(req.files.image[0].path); } catch (e) {}
      }
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, artist, desc, album, isPublished } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Song ID is required" });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (artist !== undefined) updates.artist = artist.trim();
    if (desc !== undefined) updates.desc = desc.trim();
    if (album !== undefined) updates.album = album.trim();
    if (isPublished !== undefined) updates.isPublished = Boolean(isPublished);

    const updatedSong = await songModel.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedSong) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    invalidateSongsCache();

    res.json({
      success: true,
      message: "Song updated successfully",
      song: updatedSong
    });
  } catch (error) {
    console.error("Error in editSong:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listSong = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const album = req.query.album;
    const source = req.query.source;
    const search = req.query.search;
    const status = req.query.status; // 'published', 'draft'

    // Fast path: In-memory cache for full unpaginated query with no filters
    const now = Date.now();
    if (!page && !limit && !album && !source && !search && !status && songsCache.data && (now - songsCache.timestamp < songsCache.ttl)) {
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      return res.json({ 
        success: true, 
        cached: true,
        count: songsCache.data.length,
        songs: songsCache.data 
      });
    }

    const query = {};
    if (album) query.album = album;
    if (source && source !== 'all') query.source = source;

    // Filter drafts: public requests (default) exclude drafts ({ $ne: false })
    if (status === 'all') {
      // Admin requested all songs including drafts
    } else if (status === 'draft') {
      query.isPublished = false;
    } else {
      // Default: Only published tracks visible in public player, albums, search
      query.isPublished = { $ne: false };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { artist: regex }, { album: regex }, { desc: regex }];
    }

    let queryBuilder = songModel.find(query).select('-__v').sort({ createdAt: -1 }).lean();

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const songs = await queryBuilder;
    const totalCount = (page && limit) ? await songModel.countDocuments(query) : songs.length;

    if (!page && !limit && !album && !source && !search && !status) {
      songsCache.data = songs;
      songsCache.timestamp = now;
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    } else if (status === 'all' || status === 'draft') {
      res.set('Cache-Control', 'no-store');
    }

    res.json({ 
      success: true, 
      total: totalCount,
      count: songs.length,
      page: page || 1,
      totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      songs 
    });
  } catch (error) {
    console.error("Error in listSong:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const removeSong = async (req, res) => {
  try {
    const id = req.body?.id || req.params?.id || req.query?.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Song ID is required",
      });
    }

    const deleted = await songModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    invalidateSongsCache();

    res.json({
      success: true,
      message: "Song removed successfully",
      song: deleted,
    });
  } catch (error) {
    console.error("Error in removeSong:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const bulkDeleteSongs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Array of 'ids' is required" });
    }

    const result = await songModel.deleteMany({ _id: { $in: ids } });
    invalidateSongsCache();

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} song(s)`
    });
  } catch (error) {
    console.error("Error in bulkDeleteSongs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, isPublished } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Array of 'ids' is required" });
    }

    const result = await songModel.updateMany(
      { _id: { $in: ids } },
      { $set: { isPublished: Boolean(isPublished) } }
    );
    invalidateSongsCache();

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Updated status for ${result.modifiedCount} song(s)`
    });
  } catch (error) {
    console.error("Error in bulkUpdateStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalSongs,
      publishedSongs,
      draftSongs,
      manualSongs,
      importedSongs,
      totalAlbums,
      recentSongs,
      sourceBreakdown
    ] = await Promise.all([
      songModel.countDocuments(),
      songModel.countDocuments({ isPublished: true }),
      songModel.countDocuments({ isPublished: false }),
      songModel.countDocuments({ source: 'manual' }),
      songModel.countDocuments({ source: { $ne: 'manual' } }),
      albumModel.countDocuments(),
      songModel.find().select('name artist album image createdAt source isPublished').sort({ createdAt: -1 }).limit(5).lean(),
      songModel.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } }
      ])
    ]);

    const sourceStats = {};
    sourceBreakdown.forEach(item => {
      sourceStats[item._id || 'manual'] = item.count;
    });

    res.json({
      success: true,
      stats: {
        totalSongs,
        publishedSongs,
        draftSongs,
        manualSongs,
        importedSongs,
        totalAlbums,
        recentSongs,
        sources: sourceStats
      }
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { 
  addSong, 
  editSong,
  listSong, 
  removeSong, 
  bulkDeleteSongs, 
  bulkUpdateStatus, 
  getDashboardStats 
};