# Tunexia Import Service — Integration & Setup Guide

This package integrates multi-provider external music catalog imports (Deezer, iTunes / Apple Music, Jamendo, Audius) and an automated cron sync into Tunexia.

---

## 1. Prerequisites
- **node-cron**: Installed in `Apna-backend`:
  ```bash
  npm install node-cron
  ```
- **Dependencies**: Uses native Node `fetch` (Node 18+) and existing Mongoose models.

---

## 2. Directory Structure

```text
tunexia-import/
├── server/
│   ├── SETUP.md               # This setup guide
│   ├── importService.js       # Provider fetchers, categories & toSongDoc adapter
│   └── adminImport.js         # Express router with admin-role protected endpoints & cron sync
└── client/
    └── AdminImport.jsx        # Admin UI page with category import controls & logs
```

---

## 3. The Three ADAPT Spots

### ADAPT Spot 1: Song Field Names in `importService.toSongDoc`
Maps external track objects to Tunexia's Song Mongoose model:
- `name`: Track title
- `artist`: Artist / performer name
- `desc`: Description / subtitle (`${artist} • ${album}`)
- `album`: Album name or 'Single'
- `image`: Cover artwork URL (600x600 high-res)
- `file`: Audio preview stream URL (30s AAC/MP3 or full decentralized stream)
- `duration`: Track duration formatted as `M:SS`
- `source`: Provider identifier (`'deezer'`, `'itunes'`, `'jamendo'`, `'audius'`)
- `externalId`: Unique ID from provider
- `externalUrl`: Web link to track
- `previewOnly`: Boolean (`true` for 30s clips, `false` for full tracks)
- `category`: Category slug (e.g. `'hindi-trending'`, `'kannada-devotional'`)
- `isPublished`: Boolean (`false` on initial import so tracks are drafted)
- `importedAt`: Date timestamp

### ADAPT Spot 2: Auth & Admin-Role Middleware in `adminImport.js`
Uses Tunexia's existing `authAdmin` middleware:
```javascript
import authAdmin from "../middleware/auth.js";
// Mounted on all /api/admin/import routes
router.use(authAdmin);
```

### ADAPT Spot 3: Route Mount & `startSync()` in `server.js`
In `server.js`:
```javascript
import adminImportRouter, { startSync } from "./src/routes/adminImport.js";

// Mount API route
app.use("/api/admin/import", adminImportRouter);

// Start background cron scheduler
startSync();
```

---

## 4. Endpoints
- `GET /api/admin/import/categories` — List available categories with providers, terms, and status.
- `POST /api/admin/import/run/:category` — Run import for a specific category (supports query `?pages=1`).
- `POST /api/admin/import/run-all` — Run import for all categories (`?pages=1`).
- `POST /api/admin/import/publish-category/:category` — Publish all drafts in a category.
- `GET /api/admin/import/stats` — Import metrics and last cron run timestamp.
