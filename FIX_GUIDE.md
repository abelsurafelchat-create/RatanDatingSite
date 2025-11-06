# Quick Fix Guide - IndiDate Setup

## ✅ Issue Fixed: Vite Compatibility Error

**Error:** `Unexpected token '??='`  
**Cause:** Vite 5 compatibility issue with Node.js  
**Solution:** Downgraded to Vite 4.5.0

---

## 🚀 Setup Steps (In Order)

### 1. Install Dependencies (Currently Running)
```bash
npm install
```
Wait for this to complete...

### 2. Setup PostgreSQL Database

**Option A: Using PostgreSQL Command Line**
```bash
# Open PostgreSQL command line (psql)
psql -U postgres

# Create database
CREATE DATABASE indidate;

# Create user (optional but recommended)
CREATE USER indidate_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE indidate TO indidate_user;

# Exit
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `indidate`
4. Click "Save"

### 3. Configure Environment Variables

Edit your `.env` file (currently open in your IDE):

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/indidate
JWT_SECRET=my_super_secret_jwt_key_12345
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Important:** Replace `your_password` with your actual PostgreSQL password!

### 4. Initialize Database Tables

```bash
node server/database/init.js
```

**Expected Output:**
```
✅ Database connected successfully
✅ Database initialized successfully!
Tables created:
  - users
  - profile_photos
  - swipes
  - matches
  - messages
  - video_calls
  - user_preferences
  - blocked_users
```

### 5. Start Backend Server

**Terminal 1:**
```bash
npm run server
```

**Expected Output:**
```
✅ Database connected successfully
🚀 Server running on port 3001
📡 Socket.io server ready
🌐 API available at http://localhost:3001/api
```

### 6. Start Frontend Development Server

**Terminal 2:**
```bash
npm run dev
```

**Expected Output:**
```
VITE v4.5.0  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 7. Open Application

Visit: **http://localhost:5173**

---

## 🔍 Troubleshooting

### If PostgreSQL Connection Fails

**Check PostgreSQL is running:**
```bash
# Windows (PowerShell)
Get-Service -Name postgresql*

# If not running, start it:
Start-Service postgresql-x64-14
```

**Test connection:**
```bash
psql -U postgres -d indidate
```

### If Port 3001 is Already in Use

**Kill the process:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

Or change the port in `.env`:
```env
PORT=3002
```

### If "Module Not Found" Error

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📋 Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `indidate` created
- [ ] `.env` file configured with correct credentials
- [ ] Dependencies installed (`npm install` completed)
- [ ] Database initialized (`node server/database/init.js`)
- [ ] Backend server running (`npm run server`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Application accessible at http://localhost:5173

---

## 🎯 Quick Test

Once everything is running:

1. **Register a user:**
   - Go to http://localhost:5173
   - Click "Sign up"
   - Fill in the form
   - Choose "Dating" or "Marriage"
   - Submit

2. **Check backend logs:**
   - Should see "Registration successful" in Terminal 1

3. **Login:**
   - Use the credentials you just created
   - Should redirect to home page

---

## 💡 Common Mistakes

1. **Forgot to create database** → Run `CREATE DATABASE indidate;` in psql
2. **Wrong password in .env** → Check your PostgreSQL password
3. **PostgreSQL not running** → Start the service
4. **Didn't initialize tables** → Run `node server/database/init.js`
5. **Wrong port** → Make sure 3001 and 5173 are free

---

## 📞 Need Help?

Check these files:
- `SETUP_GUIDE.md` - Detailed setup instructions
- `README.md` - Main documentation
- `QUICK_REFERENCE.md` - Quick reference

---

**Current Status:** Dependencies installing... Please wait for completion.
