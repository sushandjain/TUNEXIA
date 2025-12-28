import express from 'express';
import { addAlbum, listAlbum, removeAlbum } from '../controllers/albumController.js';
import upload from '../middleware/multer.js';

const albumRoute = express.Router();

// Log incoming album requests for debugging
albumRoute.use((req, res, next) => {
  console.log('albumRoute request:', { method: req.method, path: req.path, contentType: req.headers['content-type'] });
  next();
});

// Helpful GET to guide correct usage when someone navigates to /add in a browser
albumRoute.get('/add', (req, res) => {
  return res.status(405).json({
    success: false,
    message: "Use POST /api/album/add with multipart/form-data. Include 'image' file and fields: name, desc, bgColor"
  });
});

albumRoute.post('/add', upload.single('image'), addAlbum);
albumRoute.get('/list', listAlbum);
albumRoute.delete('/remove/:id', upload.none(), removeAlbum);  // Add upload.none() here

export default albumRoute;