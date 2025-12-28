import express from 'express';
import { addSong, listSong, removeSong } from '../controllers/Songcontroller.js';
import upload from '../middleware/multer.js';
import fs from 'fs';

const songRoute = express.Router();

songRoute.post('/add', 
  (req, res, next) => {
    upload.fields([
      {name:'image', maxCount:1},
      {name:'audio', maxCount:1}
    ])(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
      }
      
      console.log('Files received by multer:', req.files);
      console.log('Body received:', req.body);
      
      next();
    });
  },
  addSong
);

songRoute.get('/list', listSong);

// Accept multipart form-data (may include files) and clean up any uploaded files
songRoute.delete('/remove/:id',
  (req, res, next) => { 
    upload.any()(req, res, (err) => {
      if (err) {
        console.error('Multer error on remove:', err);
        return res.status(400).json({ success: false, message: 'Invalid form data: ' + err.message });
      }

      console.log('Body received on remove:', req.body);
      console.log('Files received on remove:', req.files);

      // If client accidentally uploaded files, delete them to avoid storage bloat
      if (req.files && req.files.length) {
        req.files.forEach((f) => {
          try { fs.unlinkSync(f.path); } catch (e) { /* ignore */ }
        });
      }

      next(); 
    });
  },
  removeSong
);

export default songRoute;