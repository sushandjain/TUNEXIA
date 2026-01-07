# APNA-GAANA Frontend

React-based music streaming application with admin panel.

## 🚀 Quick Start

### Installation

1. Install dependencies:
```bash
npm install
```

2. Update API URL in `src/config.js`:
```javascript
export const url = 'http://localhost:3004'; // For local development
// export const url = 'https://your-backend.onrender.com'; // For production
```

3. Start development server:
```bash
npm run dev
```

4. Open browser at `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## 🌐 Deployment

### Vercel (Recommended - Free)

1. Push to GitHub
2. Import project on Vercel
3. Set root directory to `apna-gaana-merged`
4. Framework: Vite
5. Deploy!

### Netlify

1. Push to GitHub
2. New site from Git
3. Base directory: `apna-gaana-merged`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

## 📱 Features

### User App (/)
- Music player with controls
- Browse songs and albums
- Create playlists
- Like songs

### Admin Panel (/admin)
- Add/delete songs
- Add/delete albums
- Manage content

## 🛠️ Built With

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- React Toastify
