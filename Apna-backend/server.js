import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import songRoute from './src/routes/songRoute.js';
import connectdb from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRoute from './src/routes/albumRoute.js';
import adminRoute from './src/routes/adminRoute.js';
import debugRoute from './src/routes/debugRoute.js';

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
    // Check required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }
    if (!process.env.CLOUDINARY_NAME) {
      throw new Error('CLOUDINARY_NAME environment variable is missing');
    }

    // Connect to MongoDB first
    await connectdb();

    // Connect to Cloudinary
    connectCloudinary();

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
    console.log('\n⚠️  Environment Variables Required:');
    console.log('   MONGODB_URI - Your MongoDB Atlas connection string');
    console.log('   CLOUDINARY_NAME - Your Cloudinary cloud name');
    console.log('   CLOUDINARY_API_KEY - Your Cloudinary API key');
    console.log('   CLOUDINARY_API_SECRET - Your Cloudinary API secret');
    console.log('\n⚠️  Troubleshooting:');
    console.log('1. Add all environment variables in Render dashboard');
    console.log('2. Make sure MongoDB Atlas allows connections from all IPs (0.0.0.0/0)');
    console.log('3. Verify MongoDB connection string format');
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