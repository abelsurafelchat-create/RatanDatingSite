# Axios Removal Guide

## Problem
The axios library was causing a build error: `Cannot destructure property 'Request' of 'undefined'`

This error occurs because axios tries to use browser APIs (Request/Response) during module initialization, but the build process doesn't guarantee these are available at the right time.

## Solution
Replace axios with native `fetch` API - no external dependencies, no build issues.

## What Was Changed

### 1. Created New API Utility (`src/utils/api.js`)
- Native fetch-based HTTP client
- Automatic auth token handling
- Automatic error handling (401 redirects)
- Same API as axios: `api.get()`, `api.post()`, etc.

### 2. Updated Files
The following files need to be updated to use `api` instead of `axios`:

**Already Updated:**
- ✅ `src/context/AuthContext.jsx`

**Need to Update:**
- `src/context/NotificationContext.jsx`
- `src/context/SocketContext.jsx`
- `src/pages/Chat.jsx`
- `src/pages/Home.jsx`
- `src/pages/HomeNew.jsx`
- `src/pages/HomeOld.jsx`
- `src/pages/LandingPage.jsx`
- `src/pages/Matches.jsx`
- `src/pages/Profile.jsx`
- `src/pages/ProfileNew.jsx`
- `src/pages/ProfileOld.jsx`
- `src/pages/RandomVideoCall.jsx`

## Migration Pattern

### Before (axios):
```javascript
import axios from 'axios';

const response = await axios.get('/api/users');
const data = response.data;

await axios.post('/api/users', { name: 'John' });
```

### After (fetch-based api):
```javascript
import api from '../utils/api.js';

const data = await api.get('/users');  // Note: /api prefix is automatic

await api.post('/users', { name: 'John' });
```

### Key Differences:
1. **No `/api` prefix needed** - it's added automatically
2. **No `.data` property** - the response IS the data
3. **Error handling** - errors have `.message` instead of `.response.data.error`

## Steps to Complete Migration

### 1. Update All Files
Replace in each file:
- `import axios from 'axios'` → `import api from '../utils/api.js'`
- `axios.get('/api/path')` → `api.get('/path')`
- `response.data` → just use `response` directly
- `error.response?.data?.error` → `error.message`

### 2. Remove Axios Dependency
```bash
npm uninstall axios
```

### 3. Remove Axios-Related Config
Delete or clean up:
- `src/utils/axiosConfig.js` (no longer needed)
- Axios patch plugin in `vite.config.js` (can be removed)
- Axios polyfills (no longer needed)

### 4. Rebuild
```bash
rm -rf dist/
npm run build
npm run preview
```

## Benefits

✅ **No more build errors** - native fetch works everywhere  
✅ **Smaller bundle** - one less dependency (~13KB saved)  
✅ **Faster builds** - no axios patching needed  
✅ **Modern** - using web standards  
✅ **Simpler** - no complex configuration needed  

## Testing Checklist

After migration, test:
- [ ] Login
- [ ] Registration
- [ ] Profile viewing/editing
- [ ] Matches/Swiping
- [ ] Chat messages
- [ ] Photo uploads
- [ ] Video calls
- [ ] Notifications

## Rollback Plan

If issues occur, you can temporarily revert by:
1. `npm install axios@^1.6.2`
2. Change imports back to axios
3. Use the old axios configuration

But the fetch-based solution should work better!
