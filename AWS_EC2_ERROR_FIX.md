# AWS EC2 Deployment Error Fix

## Error Description
```
TypeError: Cannot destructure property 'Request' of 'undefined' as it is undefined.
    at index-08c4a598.js:235:8588
```

## Root Cause

The error occurs because **`simple-peer`** (used for video calling) and other Node.js libraries try to destructure `Request` and `Response` from the `global` object during module initialization:

```javascript
const {Request, Response} = global; // global is undefined!
```

### Why It Only Happens on AWS EC2

**Local Development (✅ Works):**
- Vite dev server properly initializes polyfills
- Hot module replacement handles global object correctly

**AWS EC2 Production (❌ Fails):**
- The built JavaScript bundle tries to access `global.Request` and `global.Response`
- These properties don't exist because the polyfill script runs too late
- The module code is parsed before the polyfills are executed

## The Fix

### What Was Changed

Updated `/index.html` to include a **synchronous polyfill script** that runs **BEFORE** any module code loads. This script:

1. **Initializes `globalThis`** - Ensures cross-browser compatibility
2. **Sets up `global` object** - Maps `window.global` to `window`
3. **Polyfills `Request` and `Response`** - Creates minimal implementations
4. **Ensures availability on all global objects** - Sets them on `window`, `global`, and `globalThis`
5. **Adds `process` and `Buffer` polyfills** - For Node.js compatibility

### Key Points

- The script is **NOT a module** (`<script>` not `<script type="module">`)
- It runs **synchronously** before any other JavaScript
- It uses an **IIFE** (Immediately Invoked Function Expression) to avoid polluting global scope
- It's **idempotent** - safe to run multiple times

## Deployment Steps

### 1. Rebuild Your Application
```bash
npm run build
```

### 2. Verify the Build
Check that `dist/index.html` contains the polyfill script in the `<head>` section.

### 3. Deploy to AWS EC2

**Option A: Using your deploy script**
```bash
./deploy.sh
```

**Option B: Manual deployment**
```bash
# Copy frontend files
scp -r dist/* ec2-user@your-ec2-ip:/var/www/html/

# Copy backend files
scp -r server ec2-user@your-ec2-ip:/home/ec2-user/app/
scp package*.json ec2-user@your-ec2-ip:/home/ec2-user/app/

# SSH into EC2 and restart
ssh ec2-user@your-ec2-ip
cd /home/ec2-user/app
npm install --production
pm2 restart all
```

### 4. Clear Browser Cache
After deployment, clear your browser cache or do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Testing

### Verify the Fix Works

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Navigate to your site**
4. **Type these commands:**
```javascript
console.log(typeof global);           // Should be "object"
console.log(typeof global.Request);   // Should be "function"
console.log(typeof global.Response);  // Should be "function"
console.log(typeof window.Request);   // Should be "function"
console.log(typeof window.Response);  // Should be "function"
```

All should return the expected types, not "undefined".

### Test Video Calling

1. Log in to your application
2. Navigate to the Random Video Call feature
3. Start a call
4. The error should no longer occur

## Technical Details

### What `simple-peer` Needs

The `simple-peer` library is designed for Node.js and expects:
- `global` object to exist
- `Request` and `Response` constructors on `global`
- `process` object with `env` property
- `Buffer` object

### Browser vs Node.js

| Feature | Node.js | Browser | Our Polyfill |
|---------|---------|---------|--------------|
| `global` | ✅ Built-in | ❌ Missing | ✅ Added |
| `Request` | ✅ Built-in | ✅ Fetch API | ✅ Ensured |
| `Response` | ✅ Built-in | ✅ Fetch API | ✅ Ensured |
| `process` | ✅ Built-in | ❌ Missing | ✅ Added |
| `Buffer` | ✅ Built-in | ❌ Missing | ✅ Added |

## Alternative Solutions (Not Recommended)

### 1. Remove Video Calling Feature
- Remove `simple-peer` dependency
- Remove `RandomCall.jsx` and `RandomVideoCall.jsx`
- This loses functionality

### 2. Use Different WebRTC Library
- Switch to `peerjs` or native WebRTC
- Requires significant code changes
- May have other compatibility issues

### 3. Server-Side Rendering (SSR)
- Use Next.js or similar framework
- Major architecture change
- Overkill for this issue

## Why This Solution is Best

✅ **Minimal changes** - Only one file modified  
✅ **No code refactoring** - Existing code works as-is  
✅ **No new dependencies** - Pure JavaScript solution  
✅ **Future-proof** - Works with all Node.js libraries  
✅ **Performance** - Negligible overhead  
✅ **Maintainable** - Easy to understand and modify  

## Troubleshooting

### Error Still Occurs After Fix

1. **Check build output:**
```bash
cat dist/index.html | grep -A 20 "CRITICAL"
```
Should show the polyfill script.

2. **Clear all caches:**
- Browser cache
- CDN cache (if using CloudFront)
- Service worker cache

3. **Check browser console:**
Look for any other errors that might be masking the real issue.

### Different Error Message

If you see a different error after fixing this one, it might be a different issue. Common follow-up errors:

- **WebRTC not supported** - User's browser doesn't support WebRTC
- **Camera permission denied** - User blocked camera access
- **Network issues** - Firewall blocking WebRTC connections

## Additional Resources

- [MDN: globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)
- [simple-peer Documentation](https://github.com/feross/simple-peer)
- [Vite Browser Compatibility](https://vitejs.dev/guide/build.html#browser-compatibility)

## Summary

The error was caused by `simple-peer` trying to access `Request` and `Response` from an undefined `global` object. The fix adds a polyfill script that runs before any module code, ensuring these globals exist. After rebuilding and redeploying, the error should be resolved.
