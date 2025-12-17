# Troubleshooting Guide

## "URL Not Working" / "Connection Failed" - Solutions

### ✅ Step 1: Verify Both Servers Are Running

You need **TWO terminal windows** running simultaneously:

**Terminal 1 - Backend (Port 5000):**
```powershell
cd backend
npm run dev
```
You should see: `Server is running on port 5000`

**Terminal 2 - Frontend (Port 5173):**
```powershell
cd frontend
npm run dev
```
You should see: `Local: http://localhost:5173`

### ✅ Step 2: Access the Correct URLs

- **Frontend Application:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Backend Health Check:** http://localhost:5000/api/health

### ✅ Step 3: Test Backend Connection

Open this in your browser to test:
```
http://localhost:5000/api/health
```

You should see:
```json
{"status":"ok","message":"Server is running"}
```

If you see this, the backend is working!

### ❌ Common Issues & Fixes

#### Issue 1: "Unable to connect to server"
**Cause:** Backend is not running
**Fix:** Start the backend server in Terminal 1

#### Issue 2: Frontend page won't load
**Cause:** Frontend server is not running
**Fix:** Start the frontend server in Terminal 2

#### Issue 3: CORS Error in Browser Console
**Cause:** Backend CORS not configured properly
**Fix:** Already fixed in the code - make sure backend is using the latest code

#### Issue 4: Port Already in Use
**Error:** `Port 5000 is already in use` or `Port 5173 is already in use`
**Fix:** 
1. Find what's using the port: `netstat -ano | findstr :5000`
2. Kill the process or change the port in `.env` file

#### Issue 5: "Failed to fetch" Error
**Cause:** Backend not accessible
**Fix:**
1. Check backend is running: http://localhost:5000/api/health
2. Check firewall isn't blocking ports 5000/5173
3. Make sure you're using `http://` not `https://`

### 🔍 Debug Steps

1. **Check Browser Console (F12)**
   - Look for red error messages
   - Check Network tab for failed requests

2. **Check Terminal Output**
   - Backend terminal should show request logs
   - Frontend terminal should show Vite dev server info

3. **Test Backend Directly**
   - Open: http://localhost:5000/api/health
   - Should return JSON response

4. **Check Environment Variables**
   - Backend `.env` should have `PORT=5000`
   - Frontend `.env` should have `VITE_API_URL=http://localhost:5000/api`

### 🚀 Quick Start Commands

**Option 1: Use Startup Scripts**
```powershell
# Terminal 1
.\start-backend.ps1

# Terminal 2
.\start-frontend.ps1
```

**Option 2: Manual Start**
```powershell
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

### 📝 Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can access http://localhost:5000/api/health
- [ ] Can access http://localhost:5173
- [ ] No errors in browser console (F12)
- [ ] No errors in terminal windows

### 💡 Still Not Working?

1. **Restart both servers** (Ctrl+C, then restart)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Try a different browser**
4. **Check Windows Firewall** settings
5. **Verify Node.js version:** `node --version` (should be v18+)

---

**Need more help?** Check the browser console (F12) for specific error messages and share them.


