import { v2 as cloudinary } from "cloudinary";
import albumModel from "../models/albumModel.js";

const addAlbum = async (req, res) => {
  try {
    const name = req.body.name;
    const desc = req.body.desc;
    const bgColor = req.body.bgColor;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
      folder: "albums"
    });

    const albumData = {
      name,
      desc,
      bgColor,
      image: imageUpload.secure_url
    };

    const album = new albumModel(albumData);
    await album.save();

    res.status(201).json({
      success: true,
      message: "Album added successfully",
      album
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const listAlbum = async (req, res) => {
  try {
    const albums = await albumModel.find({}).sort({ createdAt: -1 });
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
    console.log('removeAlbum called:', {
      method: req.method,
      contentType: req.headers['content-type'],
      body: req.body,
      params: req.params,
      query: req.query,
    });

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