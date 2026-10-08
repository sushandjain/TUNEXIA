import express from 'express';
import cors from 'cors';
import compression from 'compression';
import 'dotenv/config';
import songRoute from './src/routes/songRoute.js';
import connectdb from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRoute from './src/routes/albumRoute.js';
import adminRoute from './src/routes/adminRoute.js';
import debugRoute from './src/routes/debugRoute.js';
import externalMusicRoute from './src/routes/externalMusicRoute.js';
import syncRoute from './src/routes/syncRoute.js';
import { initScheduler } from './src/services/syncService.js';
import adminImportRouter, { startSync } from './src/routes/adminImport.js';

const app = express();
const port = process.env.PORT || 3004;

// Security & Optimization
app.disable('x-powered-by');

// Compression middleware (Gzip / Brotli)
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Caching middleware for read-only catalog lists
app.use(['/api/song/list', '/api/album/list'], (req, res, next) => {
  if (req.method === 'GET' && !req.query.search && !req.query.source) {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  next();
});

// Health check endpoint (for server keep-alive and pinging)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Test root route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Tunexia API server is active',
    version: '2.5.0',
    endpoints: {
      songs: 'GET /api/song/list',
      albums: 'GET /api/album/list',
      externalMusic: '/api/external-music',
      sync: '/api/sync',
      health: 'GET /health'
    }
  });
});

// API Routes
app.use('/api/song', songRoute);
app.use('/api/album', albumRoute);
app.use('/api/admin', adminRoute);
app.use('/api/admin/import', adminImportRouter);
app.use('/api/external-music', externalMusicRoute);
app.use('/api/sync', syncRoute);
app.use('/api/debug', debugRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

// Start server function
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    // Connect to MongoDB
    await connectdb();

    // Initialize Auto-Sync Scheduler
    await initScheduler();

    // Initialize Category AutoSync (tunexia-import)
    startSync();

    const hasCloudinaryConfig =
      process.env.CLOUDINARY_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinaryConfig) {
      connectCloudinary();
    } else {
      console.warn('⚠️ Cloudinary credentials missing: upload endpoints may fail, list/login will still work.');
    }

    app.listen(port, () => {
      console.log('=================================');
      console.log(`✅ Tunexia API Server running successfully!`);
      console.log(`🌐 URL: http://localhost:${port}`);
      console.log(`💓 Health: http://localhost:${port}/health`);
      console.log(`📋 Songs: GET http://localhost:${port}/api/song/list`);
      console.log(`🔍 External API: /api/external-music`);
      console.log(`🔄 Sync Engine: /api/sync`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});
