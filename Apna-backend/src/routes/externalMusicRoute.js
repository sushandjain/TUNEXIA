import express from 'express';
import { 
  searchExternal, 
  getTrendingExternal, 
  getNewReleasesExternal, 
  importTracks 
} from '../controllers/externalMusicController.js';
import authAdmin from '../middleware/auth.js';

const externalMusicRoute = express.Router();

externalMusicRoute.get('/search', authAdmin, searchExternal);
externalMusicRoute.get('/trending', authAdmin, getTrendingExternal);
externalMusicRoute.get('/new-releases', authAdmin, getNewReleasesExternal);
externalMusicRoute.post('/import', authAdmin, importTracks);

export default externalMusicRoute;
