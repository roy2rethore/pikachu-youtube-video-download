# Quick Start Guide

## 🚀 Starting the Application

### Option 1: Using PowerShell Scripts (Recommended)

**Terminal 1 - Start Backend:**
```powershell
.\start-backend.ps1
```

**Terminal 2 - Start Frontend:**
```powershell
.\start-frontend.ps1
```

### Option 2: Manual Start

**Terminal 1 - Start Backend:**
```powershell
cd backend
npm install
npm run dev
```

**Terminal 2 - Start Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

## ✅ Verify Everything is Working

1. **Backend should be running on:** http://localhost:5000
   - Test it: Open http://localhost:5000/api/health in your browser
   - You should see: `{"status":"ok","message":"Server is running"}`

2. **Frontend should be running on:** http://localhost:5173
   - Open this URL in your browser to use the application

## 🔧 Troubleshooting

### "Connection Failed" Error

**Problem:** Frontend can't connect to backend

**Solutions:**
1. Make sure the backend is running first (check Terminal 1)
2. Verify backend is accessible: Open http://localhost:5000/api/health
3. Check that both servers are running:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173
4. Make sure no other application is using port 5000 or 5173
5. Check firewall settings - ports 5000 and 5173 should be allowed

### Backend Won't Start

**Check:**
- Node.js is installed: `node --version` (should be v18+)
- Dependencies are installed: `cd backend && npm install`
- Port 5000 is not in use by another application

### Frontend Won't Start

**Check:**
- Node.js is installed: `node --version` (should be v18+)
- Dependencies are installed: `cd frontend && npm install`
- Port 5173 is not in use by another application

## 📝 Important Notes

- **Always start the backend first**, then the frontend
- Keep both terminal windows open while using the application
- The backend must be running for the frontend to work
- If you see "Unable to connect to server" error, the backend is not running

## 🎯 Next Steps

Once both servers are running:
1. Open http://localhost:5173 in your browser
2. Paste a YouTube URL in the input field
3. Click "Get Info" to fetch video details
4. Select format (Video/Audio) and quality
5. Click "Download" to start the download

