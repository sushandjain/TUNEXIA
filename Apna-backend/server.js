import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import songRoute from './src/routes/songRoute.js';
import connectdb from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRoute from './src/routes/albumRoute.js';
import adminRoute from './src/routes/adminRoute.js';

const app = express();
const port = process.env.PORT || 3004;

// Middleware - MUST be BEFORE routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectCloudinary();

// Test route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is working!',
    endpoints: {
      addSong: 'POST /api/song/add',
      listSongs: 'GET /api/song/list'
    }
  });
});

// API Routes
app.use('/api/song', songRoute);
app.use('/api/album', albumRoute);
app.use('/api/admin', adminRoute);

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
    // Connect to MongoDB first
    await connectdb();
    console.log('✅ MongoDB connected');

    // Connect to Cloudinary
    connectCloudinary();
    console.log('✅ Cloudinary configured');

    // Start listening
    app.listen(port, () => {
      console.log('=================================');
      console.log(`✅ Server running successfully!`);
      console.log(`🌐 URL: http://localhost:${port}`);
      console.log(`📝 Test: http://localhost:${port}/`);
      console.log(`🎵 Add Song: POST http://localhost:${port}/api/song/add`);
      console.log(`📋 List Songs: GET http://localhost:${port}/api/song/list`);
      console.log(`🅰️ Add Album: POST http://localhost:${port}/api/album/add`);
      console.log(`📚 List Albums: GET http://localhost:${port}/api/album/list`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.log('\n⚠️  Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your .env file exists');
    console.log('3. Verify port 3004 is not in use');
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});