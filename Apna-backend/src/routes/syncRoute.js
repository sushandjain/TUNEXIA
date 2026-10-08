import express from 'express';
import { 
  getSyncSettings, 
  updateSyncSettings, 
  triggerSyncNow 
} from '../controllers/syncController.js';
import authAdmin from '../middleware/auth.js';

const syncRoute = express.Router();

syncRoute.get('/settings', authAdmin, getSyncSettings);
syncRoute.post('/settings', authAdmin, updateSyncSettings);
syncRoute.post('/run', authAdmin, triggerSyncNow);

export default syncRoute;
