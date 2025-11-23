# Spurz.ai Backend Setup Guide

## Prerequisites to Complete

Before running the backend, you'll need to set up:

### 1. Firebase Project Setup (Required)

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "spurz-ai" (or use existing)
3. Enable **Authentication** → **Phone** sign-in method
4. Go to **Project Settings** → **Service Accounts**
5. Click "Generate New Private Key"
6. Download the JSON file
7. Copy these values to `.env`:
   - `FIREBASE_PROJECT_ID` (from JSON)
   - `FIREBASE_CLIENT_EMAIL` (from JSON)
   - `FIREBASE_PRIVATE_KEY` (from JSON - keep the \n characters)

### 2. MongoDB Setup (Choose One)

#### Option A: MongoDB Atlas (Cloud - Recommended for Production)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a new cluster (M0 Free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/spurz-ai?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your credentials
7. Add to `.env` as `MONGODB_URI`

#### Option B: Local MongoDB (Development)
1. Install MongoDB locally:
   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo apt-get install mongodb
   sudo systemctl start mongodb
   ```
2. Use this connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/spurz-ai
   ```

### 3. Environment Variables

Create `.env` file in backend root with:

```env
NODE_ENV=development
PORT=4000

# MongoDB (fill with your connection string)
MONGODB_URI=mongodb://localhost:27017/spurz-ai

# Firebase Admin SDK (fill with your credentials)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# CORS
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19006,http://localhost:8081

# Logging
LOG_LEVEL=debug
```

---

## Quick Start After Setup

Once you have Firebase & MongoDB configured:

```bash
cd spurz-ai-backend
npm install
npm run dev
```

You should see:
```
✅ Connected to MongoDB
✅ Firebase Admin initialized
🚀 Server running on http://localhost:4000
```

Test with:
```bash
curl http://localhost:4000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T...",
  "uptime": 123.456
}
```

---

## What I'm Setting Up Now

While you configure Firebase & MongoDB, I'm creating:
- ✅ Backend folder structure
- ✅ package.json with all dependencies
- ✅ TypeScript configuration
- ✅ Basic Express app with middleware
- ✅ MongoDB connection handler (will work once you add URI)
- ✅ Firebase Admin setup (will work once you add credentials)
- ✅ Health check endpoint
- ✅ Environment config loader

You can run the backend as soon as you:
1. Add MongoDB connection string to `.env`
2. Add Firebase credentials to `.env`

---

## Timeline

**Now**: I'm building Phase 1 (backend bootstrap)
**Next 10 mins**: You set up Firebase + MongoDB
**After that**: I continue with Phase 2 (database models)

Let me know when you have the credentials ready!
