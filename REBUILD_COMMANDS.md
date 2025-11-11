# Quick Rebuild and Deploy Commands

## On Your Local Machine

```bash
# 1. Pull latest changes (if needed)
git pull

# 2. Clean old build
rm -rf dist/

# 3. Rebuild
npm run build

# 4. Test locally
npm run preview
# Open http://localhost:4173 and test

# 5. Commit and push
git add .
git commit -m "Fix axios Request error with intro polyfills"
git push
```

## On EC2 Server

```bash
# SSH into server
ssh ubuntu@your-ec2-ip

# Navigate to project
cd ~/RatanDatingSite

# Pull latest changes
git pull

# Clean old build
rm -rf dist/

# Rebuild on server
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/html/

# Restart backend (if needed)
pm2 restart all

# Check status
pm2 status
```

## Quick One-Liner for EC2

```bash
cd ~/RatanDatingSite && git pull && rm -rf dist/ && npm run build && sudo cp -r dist/* /var/www/html/ && pm2 restart all
```

## Verify the Fix

After deployment, open browser DevTools (F12) and check:

1. **Console tab** - Should have NO errors
2. **Network tab** - Should see these files load:
   - `react-vendor-[hash].js`
   - `axios-vendor-[hash].js` ← This should load without errors
   - `socket-vendor-[hash].js`
   - `webrtc-vendor-[hash].js`
   - `framer-vendor-[hash].js`
   - `vendor-[hash].js`
   - `index-[hash].js`

3. **Test functionality**:
   - Login
   - View profile
   - Send message
   - All API calls should work

## If Error Persists

Check in browser console:
```javascript
console.log(typeof Request);   // Should be "function"
console.log(typeof Response);  // Should be "function"
console.log(typeof fetch);     // Should be "function"
console.log(window.process);   // Should be an object
```

If any are undefined, the polyfills didn't load correctly.

## Clear All Caches

```bash
# On EC2 - clear nginx cache (if applicable)
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx

# In browser - hard refresh
# Chrome/Edge: Ctrl+Shift+R
# Firefox: Ctrl+F5
# Or: DevTools → Application → Clear storage → Clear site data
```
