# IndiDate - cPanel Shared Hosting Deployment Guide

## 📋 Prerequisites

### What You Need:
1. **cPanel Hosting Account** with:
   - Node.js support (v18 or higher)
   - PostgreSQL database
   - SSL certificate (Let's Encrypt free SSL)
   - Sufficient storage (at least 1GB)
   - Domain name pointed to your hosting

2. **Local Requirements:**
   - Node.js installed
   - Git installed
   - FTP client (FileZilla) or use cPanel File Manager

---

## 🗄️ Step 1: Setup PostgreSQL Database

### 1.1 Create Database
1. Log into **cPanel**
2. Go to **PostgreSQL Databases**
3. Create a new database:
   - Database name: `indidate_db`
   - Click **Create Database**

### 1.2 Create Database User
1. Scroll to **PostgreSQL Users**
2. Create new user:
   - Username: `indidate_user`
   - Password: Generate strong password
   - Click **Create User**

### 1.3 Add User to Database
1. Scroll to **Add User To Database**
2. Select user: `indidate_user`
3. Select database: `indidate_db`
4. Click **Add**
5. Grant **ALL PRIVILEGES**
6. Click **Make Changes**

### 1.4 Note Database Connection Details
```
Host: localhost (or your cPanel server hostname)
Port: 5432
Database: cpanelusername_indidate_db
Username: cpanelusername_indidate_user
Password: [your password]
```

### 1.5 Run Database Schema
1. Go to **phpPgAdmin** in cPanel
2. Select your database
3. Go to **SQL** tab
4. Copy and paste your schema from `server/database/schema.sql`
5. Click **Execute**

---

## 🚀 Step 2: Prepare Your Application

### 2.1 Build Frontend
On your local machine:

```bash
cd indidate

# Install dependencies
npm install

# Build frontend for production
npm run build
```

This creates a `dist` folder with optimized static files.

### 2.2 Prepare Backend Files
Create a production-ready backend structure:

```bash
# Create deployment folder
mkdir deploy
cd deploy

# Copy necessary files
cp -r ../server ./
cp ../package.json ./
cp ../.env.example ./.env
```

### 2.3 Update Environment Variables
Edit `.env` file with your cPanel details:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cpanelusername_indidate_db
DB_USER=cpanelusername_indidate_user
DB_PASSWORD=your_database_password

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# CORS
CORS_ORIGIN=https://yourdomain.com

# Session Secret
SESSION_SECRET=your_session_secret_here
```

---

## 📤 Step 3: Upload Files to cPanel

### Method 1: Using File Manager (Recommended for beginners)

#### 3.1 Upload Frontend (Static Files)
1. In cPanel, go to **File Manager**
2. Navigate to `public_html` (or your domain's document root)
3. Upload all files from your local `dist` folder
4. Your structure should look like:
```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── dating-illustration.png
```

#### 3.2 Upload Backend
1. Go back to home directory (one level up from public_html)
2. Create folder: `indidate-backend`
3. Upload:
   - `server/` folder
   - `package.json`
   - `.env` file
   - `ecosystem.config.js` (if using PM2)

### Method 2: Using FTP (FileZilla)

1. **Connect via FTP:**
   - Host: ftp.yourdomain.com
   - Username: your cPanel username
   - Password: your cPanel password
   - Port: 21

2. **Upload Frontend:**
   - Navigate to `/public_html/`
   - Upload contents of `dist` folder

3. **Upload Backend:**
   - Navigate to `/home/username/`
   - Create `indidate-backend` folder
   - Upload backend files

---

## ⚙️ Step 4: Setup Node.js Application

### 4.1 Enable Node.js in cPanel
1. Go to **Setup Node.js App** in cPanel
2. Click **Create Application**
3. Configure:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `indidate-backend`
   - **Application URL:** Choose subdomain or path (e.g., `api.yourdomain.com`)
   - **Application startup file:** `server/index.js`
   - **Passenger log file:** Leave default

4. Click **Create**

### 4.2 Install Dependencies
1. After creating the app, cPanel shows a command to run
2. Click **Run NPM Install** button, or
3. Use **Terminal** in cPanel:

```bash
cd ~/indidate-backend
source /home/username/nodevenv/indidate-backend/18/bin/activate
npm install --production
```

### 4.3 Set Environment Variables
In the Node.js app interface:
1. Scroll to **Environment Variables**
2. Add each variable from your `.env` file:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `DB_HOST=localhost`
   - etc.

### 4.4 Start Application
1. Click **Restart** button in Node.js App interface
2. Check if status shows "Running"

---

## 🔧 Step 5: Configure Reverse Proxy

### 5.1 Update Frontend API URLs
Your frontend needs to point to the correct backend URL.

Edit `src/config.js` before building:

```javascript
const config = {
  API_URL: import.meta.env.PROD 
    ? 'https://yourdomain.com/api'  // Production API
    : 'http://localhost:3001/api',
  
  SOCKET_URL: import.meta.env.PROD
    ? 'https://yourdomain.com'  // Production Socket
    : 'http://localhost:3001'
};

export default config;
```

### 5.2 Setup .htaccess for API Routing
Create `.htaccess` in `public_html`:

```apache
# Enable RewriteEngine
RewriteEngine On

# API Proxy - Forward /api requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/(.*)$ [OR]
RewriteCond %{REQUEST_URI} ^/socket.io/(.*)$
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# SPA Routing - All other requests go to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Enable CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

---

## 🔒 Step 6: Setup SSL Certificate

### 6.1 Install Free SSL (Let's Encrypt)
1. In cPanel, go to **SSL/TLS Status**
2. Select your domain
3. Click **Run AutoSSL**
4. Wait for certificate installation

### 6.2 Force HTTPS
Add to top of `.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🧪 Step 7: Testing

### 7.1 Test Frontend
1. Visit `https://yourdomain.com`
2. Check if landing page loads
3. Check browser console for errors

### 7.2 Test Backend API
```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Should return: {"status":"ok"}
```

### 7.3 Test Database Connection
1. Try to register a new user
2. Check if data is saved in PostgreSQL
3. Try logging in

### 7.4 Test Socket.io
1. Open browser console
2. Try video call feature
3. Check for WebSocket connection

---

## 📊 Step 8: Monitoring & Logs

### 8.1 View Application Logs
In cPanel:
1. Go to **Setup Node.js App**
2. Click on your application
3. Click **Show Log** button

Or via Terminal:
```bash
tail -f ~/nodevenv/indidate-backend/18/logs/passenger.log
```

### 8.2 View Error Logs
```bash
# Application errors
tail -f ~/indidate-backend/logs/error.log

# cPanel error logs
tail -f ~/public_html/error_log
```

### 8.3 Monitor Database
1. Use **phpPgAdmin** in cPanel
2. Check tables for data
3. Monitor active connections

---

## 🔄 Step 9: Updates & Maintenance

### 9.1 Update Frontend
```bash
# Local machine
npm run build

# Upload new dist files to public_html via FTP/File Manager
```

### 9.2 Update Backend
```bash
# Upload new server files
# Then in cPanel Terminal:
cd ~/indidate-backend
source /home/username/nodevenv/indidate-backend/18/bin/activate
npm install --production

# Restart app
# Go to Setup Node.js App → Click Restart
```

### 9.3 Database Migrations
```bash
# Connect to PostgreSQL via phpPgAdmin
# Run migration SQL scripts
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Cannot connect to database"
**Solution:**
- Check database credentials in `.env`
- Verify database user has correct privileges
- Check if PostgreSQL is running: `ps aux | grep postgres`

### Issue 2: "502 Bad Gateway"
**Solution:**
- Check if Node.js app is running in cPanel
- Check application logs for errors
- Restart the Node.js application
- Verify PORT in `.env` matches cPanel configuration

### Issue 3: "404 on page refresh"
**Solution:**
- Verify `.htaccess` is in `public_html`
- Check RewriteEngine is enabled
- Ensure mod_rewrite is available

### Issue 4: "WebSocket connection failed"
**Solution:**
- Check if Socket.io proxy is configured in `.htaccess`
- Verify CORS settings in backend
- Check if WebSocket is allowed by hosting

### Issue 5: "Images not loading"
**Solution:**
- Check file permissions (644 for files, 755 for folders)
- Verify image paths are correct
- Check if images are uploaded to correct location

### Issue 6: "High memory usage"
**Solution:**
- Optimize Node.js app
- Use PM2 with cluster mode (if available)
- Contact hosting provider for resource limits

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression
Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Browser Caching
Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. Optimize Database
```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_matches_users ON matches(user_id, matched_user_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);
```

---

## 💰 Cost Estimate (Shared Hosting)

| Service | Cost | Notes |
|---------|------|-------|
| **Shared Hosting** | $5-15/month | With Node.js support |
| **Domain Name** | $10-15/year | .com domain |
| **SSL Certificate** | Free | Let's Encrypt |
| **Total** | **$5-15/month** | Very affordable! |

**Recommended Hosts with Node.js Support:**
- A2 Hosting
- HostGator
- Bluehost (with Node.js addon)
- Namecheap

---

## 🎯 Quick Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Database user created with privileges
- [ ] Database schema imported
- [ ] Frontend built (`npm run build`)
- [ ] Frontend uploaded to `public_html`
- [ ] Backend uploaded to `indidate-backend`
- [ ] `.env` file configured
- [ ] Node.js app created in cPanel
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set
- [ ] Application started
- [ ] `.htaccess` configured
- [ ] SSL certificate installed
- [ ] HTTPS forced
- [ ] API endpoints tested
- [ ] Registration/Login tested
- [ ] WebSocket/Video call tested

---

## 📞 Support & Troubleshooting

### Check Application Status
```bash
# Via cPanel Terminal
cd ~/indidate-backend
source /home/username/nodevenv/indidate-backend/18/bin/activate
node server/index.js
```

### Restart Application
1. cPanel → Setup Node.js App
2. Click your app
3. Click **Restart**

### Clear Cache
```bash
# Clear Node.js cache
rm -rf ~/nodevenv/indidate-backend/18/lib/node_modules/.cache
```

---

## 🚀 Alternative: Using Subdomain for API

If you want cleaner URLs:

1. **Create Subdomain:**
   - cPanel → Subdomains
   - Create: `api.yourdomain.com`

2. **Point Node.js App to Subdomain:**
   - Setup Node.js App
   - Application URL: `api.yourdomain.com`

3. **Update Frontend Config:**
```javascript
API_URL: 'https://api.yourdomain.com/api'
SOCKET_URL: 'https://api.yourdomain.com'
```

---

## 📝 Notes

- **Shared hosting limitations:** May have memory/CPU limits
- **WebSocket support:** Not all shared hosts support WebSockets well
- **For high traffic:** Consider VPS or cloud hosting (AWS, DigitalOcean)
- **Backup regularly:** Use cPanel backup feature
- **Monitor resources:** Check CPU/Memory usage in cPanel

---

**Your IndiDate app is now deployed on cPanel shared hosting!** 🎉

For production with high traffic, consider upgrading to VPS or using the AWS deployment guide.
