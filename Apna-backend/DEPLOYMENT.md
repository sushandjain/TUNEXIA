# RENDER DEPLOYMENT CHECKLIST

## ⚠️ IMPORTANT: Set Environment Variables in Render

Go to your Render dashboard → Your service → Environment → Add the following:

### Required Environment Variables:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_super_secret_jwt_key
PORT=3004
```

## MongoDB Atlas Setup:

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create a Cluster**
   - Choose free tier (M0)
   - Select cloud provider and region

3. **Create Database User**
   - Go to Database Access
   - Add New Database User
   - Choose password authentication
   - Save username and password

4. **Whitelist All IPs (Important for Render)**
   - Go to Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Add IP: `0.0.0.0/0`
   - Click Confirm

5. **Get Connection String**
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `apna-gaana`)

## Cloudinary Setup:

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com
   - Sign up for free tier

2. **Get API Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

## Render Deployment Steps:

1. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - Root Directory: `Apna-backend`

2. **Configure Build Settings**
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

3. **Add Environment Variables**
   - Click "Environment" tab
   - Add all variables listed above
   - Click "Save Changes"

4. **Deploy**
   - Render will automatically deploy
   - Monitor logs for any errors

## Common Issues:

### Error: "querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net"
- **Solution**: MongoDB URI is not set or incorrect
- Check environment variables in Render dashboard
- Verify MongoDB Atlas allows all IPs (0.0.0.0/0)

### Error: "MONGODB_URI is not defined"
- **Solution**: Add MONGODB_URI in Render environment variables

### Error: "Invalid scheme, expected connection string"
- **Solution**: Make sure MONGODB_URI starts with `mongodb+srv://`

### Error: "MongoServerError: bad auth"
- **Solution**: Check username/password in connection string
- Make sure password doesn't contain special characters (or encode them)

## Testing Your Deployment:

Once deployed, test these endpoints:

```
GET https://your-app.onrender.com/
GET https://your-app.onrender.com/api/song/list
GET https://your-app.onrender.com/api/album/list
```

## Next Steps:

After backend is deployed:
1. Copy your Render backend URL
2. Update `apna-gaana-merged/src/config.js` with this URL
3. Deploy frontend on Vercel
