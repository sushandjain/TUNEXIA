import express from 'express';
import { 
  addSong, 
  editSong,
  listSong, 
  removeSong, 
  bulkDeleteSongs, 
  bulkUpdateStatus, 
  getDashboardStats 
} from '../controllers/Songcontroller.js';
import upload from '../middleware/multer.js';
import authAdmin from '../middleware/auth.js';
import fs from 'fs';

const songRoute = express.Router();

// Dashboard analytics & KPIs
songRoute.get('/stats', authAdmin, getDashboardStats);

// Manual Song Addition
songRoute.post('/add', 
  authAdmin,
  (req, res, next) => {
    upload.fields([
      {name:'image', maxCount:1},
      {name:'audio', maxCount:1}
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
      }
      next();
    });
  },
  addSong
);

// Edit Song Metadata
songRoute.put('/edit/:id', authAdmin, editSong);

// List Songs (supports search, filter, pagination)
songRoute.get('/list', listSong);

// Single Song Removal
songRoute.delete('/remove/:id',
  authAdmin,
  (req, res, next) => { 
    upload.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'Invalid form data: ' + err.message });
      }
      if (req.files && req.files.length) {
        req.files.forEach((f) => {
          try { fs.unlinkSync(f.path); } catch (e) {}
        });
      }
      next(); 
    });
  },
  removeSong
);

// Bulk Operations
songRoute.post('/bulk-delete', authAdmin, bulkDeleteSongs);
songRoute.post('/bulk-status', authAdmin, bulkUpdateStatus);

export default songRoute;