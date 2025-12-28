import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";
import fs from "fs";

const addSong = async (req, res) => {
  try {
    console.log("===== DEBUG INFO =====");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("req.headers['content-type']:", req.headers['content-type']);
    console.log("=====================");

    // Check if files are received
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files received. Make sure you're using multipart/form-data",
      });
    }

    // Check for audio file
    if (!req.files.audio || req.files.audio.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required. Received fields: " + Object.keys(req.files).join(", "),
      });
    }

    // Check for image file
    if (!req.files.image || req.files.image.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image file is required. Received fields: " + Object.keys(req.files).join(", "),
      });
    }

    // Extract data
    const { name, desc, album } = req.body;
    
    // Validate required fields
    if (!name || !desc || !album) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and album are required",
      });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    console.log("Uploading files to Cloudinary...");
    console.log("Audio file:", audioFile.path);
    console.log("Image file:", imageFile.path);

    // Upload to Cloudinary
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
      folder: "songs/audio",
    });
    
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "songs/images",
    });

    console.log("Cloudinary upload successful");

    // Delete local files after upload
    fs.unlinkSync(audioFile.path);
    fs.unlinkSync(imageFile.path);

    // Calculate duration
    const minutes = Math.floor(audioUpload.duration / 60);
    const seconds = Math.floor(audioUpload.duration % 60);
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Create song data
    const songData = {
      name,
      desc,
      album,
      file: audioUpload.secure_url,
      image: imageUpload.secure_url,
      duration,
    };

    // Save to database
    const song = new songModel(songData);
    await song.save();

    res.json({ 
      success: true, 
      message: "Song added successfully", 
      song 
    });

  } catch (error) {
    console.error("Error in addSong:", error);
    
    // Clean up files if they exist
    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        try {
          fs.unlinkSync(req.files.audio[0].path);
        } catch (e) {}
      }
      if (req.files.image && req.files.image[0]) {
        try {
          fs.unlinkSync(req.files.image[0].path);
        } catch (e) {}
      }
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const listSong = async (req, res) => {
  try {
    const songs = await songModel.find({}).sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      count: songs.length,
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
    console.log('removeSong called:', {
      method: req.method,
      contentType: req.headers['content-type'],
      body: req.body,
      params: req.params,
      query: req.query,
    });
    // Accept id from body, params, or query for flexibility
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

export { addSong, listSong, removeSong };