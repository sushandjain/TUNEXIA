# APNA-GAANA Backend

Backend API for APNA-GAANA music streaming application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
PORT=3004
```

4. Create admin user:
```bash
node createAdmin.js
```

5. Start server:
```bash
npm start
```

## 📡 API Endpoints

### Songs
- `GET /api/song/list` - Get all songs
- `POST /api/song/add` - Add new song (requires admin auth)
- `DELETE /api/song/remove/:id` - Delete song (requires admin auth)

### Albums
- `GET /api/album/list` - Get all albums
- `POST /api/album/add` - Add new album (requires admin auth)
- `DELETE /api/album/remove/:id` - Delete album (requires admin auth)

### Admin
- `POST /api/admin/login` - Admin login

## 🌐 Deployment

### Render (Recommended - Free)

1. Push to GitHub
2. Connect to Render
3. Set root directory to `Apna-backend`
4. Add environment variables
5. Deploy!

### Railway

1. Install Railway CLI
2. Run `railway login`
3. Run `railway init`
4. Add environment variables
5. Run `railway up`

## 📦 Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- cloudinary - Media storage
- multer - File upload
- jsonwebtoken - JWT authentication
- bcrypt - Password hashing
- cors - Cross-origin resource sharing
- dotenv - Environment variables
