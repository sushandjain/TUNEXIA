# Apna Gaana - Full Stack Music Streaming App

Apna Gaana is a full-stack music streaming application built with React, Node.js, Express, and MongoDB. It allows users to browse, play, and enjoy music, while providing an admin panel for managing songs and albums.

## Features

- **User Interface**: Modern, responsive UI built with React and Tailwind CSS
- **Music Playback**: Audio player with controls for play, pause, next, previous
- **Album Management**: Browse and display music albums
- **Song Library**: Access to a collection of songs
- **Admin Panel**: Dedicated interface for administrators to add, edit, and manage songs and albums
- **Cloud Storage**: Image uploads handled via Cloudinary
- **Authentication**: User login and signup functionality

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Cloudinary for image storage
- Multer for file uploads
- CORS for cross-origin requests

### Admin Panel
- React 19
- Vite
- Tailwind CSS
- Axios
- React Toastify for notifications

## Screenshots

### Home Page
![Home Page](./readmeph/Screenshot%202025-12-28%20124250.png)


### Add Album
![Add Album](./readmeph/Screenshot%202025-12-28%20124250.png)

### Add Song
![playlist](./readmeph/Screenshot%202025-12-28%20124305.png)

### List Collections
![List Albums](./readmeph/Screenshot%202025-12-28%20124353.png)

### Album Display
![Album Display](./readmeph/Screenshot%202025-12-28%20124104.png)

### Song List
![Song List](./readmeph/Screenshot%202025-12-28%20124114.png)

### Player Interface
![Player Interface](./readmeph/Screenshot%202025-12-28%20124126.png)

### Admin Dashboard
![Admin Dashboard](./readmeph/Screenshot%202025-12-28%20124141.png)



## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account for image storage

### Backend Setup
1. Navigate to the `Apna-backend` directory:
   ```
   cd Apna-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `Apna-backend` directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
   ```

4. Start the server:
   ```
   npm run server
   ```

### Frontend Setup
1. Navigate to the `APNA-GAANA-APP/Apna-gaana` directory:
   ```
   cd APNA-GAANA-APP/Apna-gaana
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Admin Panel Setup
1. Navigate to the `apnaadmin` directory:
   ```
   cd apnaadmin
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Start the backend server
2. Start the frontend application
3. Start the admin panel
4. Access the app at `http://localhost:5173` (or the port shown by Vite)
5. Access the admin panel at `http://localhost:5174` (or the port shown by Vite)

## API Endpoints

### Songs
- `GET /api/song/list` - Get all songs
- `POST /api/song/add` - Add a new song
- `DELETE /api/song/remove` - Remove a song

### Albums
- `GET /api/album/list` - Get all albums
- `POST /api/album/add` - Add a new album
- `DELETE /api/album/remove` - Remove an album

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Open a Pull Request

## License

This project is licensed under the ISC License.