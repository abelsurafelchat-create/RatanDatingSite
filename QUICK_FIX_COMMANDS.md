# Quick Fix Commands for Circular Dependency Error

## On Your EC2 Server

Run these commands in order:

### 1. Pull Latest Changes
```bash
cd ~/RatanDatingSite
git pull origin main
```

### 2. Clean and Rebuild
```bash
rm -rf dist/
npm run build
```

### 3. Copy to Web Directory
```bash
sudo cp -r dist/* /var/www/html/
```

### 4. Restart Backend (if needed)
```bash
pm2 restart all
```

### 5. Verify
```bash
ls -lh /var/www/html/assets/ | grep vendor
```

You should see multiple vendor files:
- `react-vendor-[hash].js`
- `framer-vendor-[hash].js`
- `webrtc-vendor-[hash].js`
- `vendor-[hash].js`
- `index-[hash].js`

## On Your Local Machine (if deploying from local)

### 1. Pull Latest Changes
```bash
cd /home/abel/Documents/Dep/RatanDatingSite
git pull origin main
```

### 2. Rebuild
```bash
rm -rf dist/
npm run build
```

### 3. Deploy
```bash
./deploy.sh
```

## Clear Browser Cache

After deployment, clear your browser cache:

**Chrome/Edge/Firefox:**
- Press `Ctrl+Shift+R` (Windows/Linux)
- Press `Cmd+Shift+R` (Mac)

**Or manually:**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

## Verify Fix

Open browser console (F12) and check:
1. No "Cannot access 'Gt' before initialization" error
2. Multiple JS files loaded in Network tab
3. All features work (login, chat, video call)

## If Build Still Fails

### Error: "terser not found"
The fix uses esbuild instead. Just make sure you pulled the latest `vite.config.js`:
```bash
git pull origin main
npm run build
```

### Error: "Module externalized"
This is just a warning, not an error. The build will still succeed.

### Error: "Out of memory"
Increase Node memory:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## Complete One-Liner (EC2)

```bash
cd ~/RatanDatingSite && git pull && rm -rf dist/ && npm run build && sudo cp -r dist/* /var/www/html/ && pm2 restart all && echo "✅ Deployment complete!"
```

## Rollback (if something goes wrong)

```bash
cd ~/RatanDatingSite
git log --oneline -5  # Find previous commit hash
git checkout <previous-commit-hash>
npm run build
sudo cp -r dist/* /var/www/html/
pm2 restart all
```

## Need Help?

Check these files:
- `CIRCULAR_DEPENDENCY_FIX.md` - Detailed explanation
- `AWS_EC2_ERROR_FIX.md` - Previous error fix
- `DEPLOYMENT.md` - General deployment guide
