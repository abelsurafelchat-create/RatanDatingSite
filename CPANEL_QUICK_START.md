# IndiDate - cPanel Quick Start Guide

## 🚀 5-Minute Deployment

### Prerequisites
- ✅ cPanel hosting with Node.js support
- ✅ Domain name
- ✅ PostgreSQL database access

---

## Step 1: Build Application (2 minutes)

**On your computer:**

```bash
# Windows
deploy-cpanel.bat

# Mac/Linux
chmod +x deploy-cpanel.sh
./deploy-cpanel.sh
```

This creates:
- `deploy/frontend/` - Upload to public_html
- `deploy/backend/` - Upload to ~/indidate-backend
- `indidate-cpanel-deployment.zip` - Ready to upload

---

## Step 2: Setup Database (1 minute)

**In cPanel:**

1. **PostgreSQL Databases** → Create database: `indidate_db`
2. **PostgreSQL Users** → Create user: `indidate_user`
3. **Add User To Database** → Grant ALL PRIVILEGES
4. **phpPgAdmin** → Import `server/database/schema.sql`

**Note your credentials:**
```
Database: cpanelusername_indidate_db
User: cpanelusername_indidate_user
Password: [your password]
```

---

## Step 3: Upload Files (1 minute)

**Using File Manager:**

1. **Frontend:**
   - Navigate to `public_html`
   - Upload all files from `deploy/frontend/`
   - Verify `.htaccess` is uploaded

2. **Backend:**
   - Go to home directory
   - Create folder: `indidate-backend`
   - Upload all files from `deploy/backend/`

---

## Step 4: Configure Backend (30 seconds)

**Edit `~/indidate-backend/.env`:**

```env
DB_NAME=cpanelusername_indidate_db
DB_USER=cpanelusername_indidate_user
DB_PASSWORD=your_actual_password
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=change_this_to_random_string
SESSION_SECRET=change_this_too
```

---

## Step 5: Start Node.js App (30 seconds)

**In cPanel:**

1. **Setup Node.js App** → Create Application
2. Configure:
   - Node.js version: **18.x**
   - Application root: `indidate-backend`
   - Application startup file: `server/index.js`
   - Application mode: **Production**
3. Click **Create**
4. Click **Run NPM Install**
5. Click **Restart**

---

## Step 6: Enable SSL (30 seconds)

**In cPanel:**

1. **SSL/TLS Status**
2. Select your domain
3. Click **Run AutoSSL**
4. Wait for installation

---

## ✅ Done! Test Your App

Visit: `https://yourdomain.com`

**Test checklist:**
- [ ] Landing page loads
- [ ] Can register new user
- [ ] Can login
- [ ] Can upload profile photo
- [ ] Can view matches
- [ ] Can send messages
- [ ] Video call works

---

## 🔧 Troubleshooting

### App not loading?
```bash
# Check Node.js app status in cPanel
# View logs: Setup Node.js App → Show Log
```

### Database connection error?
- Verify credentials in `.env`
- Check database exists in phpPgAdmin
- Ensure user has privileges

### 502 Bad Gateway?
- Restart Node.js app in cPanel
- Check if PORT=3000 in `.env`
- View error logs

### API calls failing?
- Verify `.htaccess` in public_html
- Check CORS_ORIGIN in `.env`
- Test: `curl https://yourdomain.com/api/health`

---

## 📊 File Structure After Deployment

```
/home/username/
├── public_html/              # Frontend
│   ├── index.html
│   ├── assets/
│   ├── .htaccess            # Important!
│   └── virtualrelationship.png
│
└── indidate-backend/         # Backend
    ├── server/
    │   ├── index.js
    │   ├── controllers/
    │   ├── database/
    │   └── middleware/
    ├── package.json
    └── .env                  # Important!
```

---

## 🔄 How to Update

### Update Frontend:
```bash
npm run build
# Upload new dist files to public_html
```

### Update Backend:
```bash
# Upload new server files
# In cPanel: Setup Node.js App → Restart
```

---

## 💡 Pro Tips

1. **Backup regularly** - Use cPanel backup feature
2. **Monitor logs** - Check for errors daily
3. **Update dependencies** - Keep packages updated
4. **Use strong secrets** - Change JWT_SECRET and SESSION_SECRET
5. **Enable caching** - .htaccess already configured
6. **Optimize images** - Compress before upload
7. **Test before deploy** - Always test locally first

---

## 📞 Need Help?

**Common Commands:**

```bash
# View logs
tail -f ~/nodevenv/indidate-backend/18/logs/passenger.log

# Restart app
# cPanel → Setup Node.js App → Restart

# Check database
# cPanel → phpPgAdmin
```

**Check Application Status:**
- cPanel → Setup Node.js App
- Should show "Running" status
- Green indicator

---

## 🎯 Performance Checklist

- [ ] SSL enabled (HTTPS)
- [ ] Gzip compression enabled (.htaccess)
- [ ] Browser caching configured (.htaccess)
- [ ] Database indexes created
- [ ] Images optimized
- [ ] Node.js app running in production mode
- [ ] Error logging enabled

---

## 📈 Monitoring

**Daily checks:**
1. Application status (Running?)
2. Error logs (Any errors?)
3. Database size (Growing normally?)
4. Disk space (Enough free?)
5. Memory usage (Within limits?)

**Weekly checks:**
1. Backup database
2. Review error logs
3. Check for updates
4. Test all features
5. Monitor user feedback

---

## 🚨 Emergency Procedures

### Site Down?
1. Check Node.js app status
2. Restart application
3. Check error logs
4. Verify database connection
5. Contact hosting support

### Database Issues?
1. Check phpPgAdmin
2. Verify credentials
3. Check disk space
4. Restore from backup if needed

### High Traffic?
1. Monitor resource usage
2. Optimize database queries
3. Enable caching
4. Consider upgrading plan

---

## 📚 Additional Resources

- **Full Guide:** `CPANEL_DEPLOYMENT_GUIDE.md`
- **AWS Alternative:** `AWS_DEPLOYMENT_GUIDE.md`
- **Deployment Checklist:** `DEPLOYMENT_CHECKLIST.md`

---

**Your IndiDate app should now be live!** 🎉

For detailed troubleshooting and advanced configuration, see the full deployment guide.
