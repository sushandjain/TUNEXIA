import { v2 as cloudinary } from "cloudinary";
import albumModel from "../models/albumModel.js";
import fs from "fs";

// Lightweight in-memory cache for albums
let albumsCache = {
  data: null,
  timestamp: 0,
  ttl: 60 * 1000 // 60 seconds
};

export const invalidateAlbumsCache = () => {
  albumsCache = { data: null, timestamp: 0, ttl: 60 * 1000 };
};

const addAlbum = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const bgColor = req.body.bgColor || req.body.bgColour;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }

    if (!name || !desc || !bgColor) {
      return res.status(400).json({
        success: false,
        message: "name, desc and bgColor are required"
      });
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "albums",
      transformation: [
        { width: 600, height: 600, crop: "fill" },
        { fetch_format: "auto", quality: "auto" }
      ]
    });

    try { fs.unlinkSync(imageFile.path); } catch (e) {}

    const albumData = {
      name: name.trim(),
      desc: desc.trim(),
      bgColor: bgColor.trim(),
      image: imageUpload.secure_url
    };

    const album = new albumModel(albumData);
    await album.save();

    // Invalidate in-memory cache
    invalidateAlbumsCache();

    res.status(201).json({
      success: true,
      message: "Album added successfully",
      album
    });

  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const listAlbum = async (req, res) => {
  try {
    const now = Date.now();
    if (albumsCache.data && (now - albumsCache.timestamp < albumsCache.ttl)) {
      return res.json({
        success: true,
        cached: true,
        count: albumsCache.data.length,
        albums: albumsCache.data
      });
    }

    const albums = await albumModel.find({}).select('-__v').sort({ createdAt: -1 }).lean();

    albumsCache.data = albums;
    albumsCache.timestamp = now;

    res.json({
      success: true,
      count: albums.length,
      albums
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const removeAlbum = async (req, res) => {
  try {
    const id = req.body?.id || req.params?.id || req.query?.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Album ID is required"
      });
    }

    const deleted = await albumModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Album not found"
      });
    }

    // Invalidate cache
    invalidateAlbumsCache();

    res.json({
      success: true,
      message: "Album removed successfully",
      album: deleted
    });

  } catch (error) {
    console.error("Error in removeAlbum:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export { addAlbum, listAlbum, removeAlbum };