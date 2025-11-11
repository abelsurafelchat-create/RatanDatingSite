# Quick Deployment Fix for EC2

## What Changed
Updated `vite.config.js` to properly inject `global.Request` and `global.Response` polyfills.

## Deploy Steps (Run on EC2)

```bash
# 1. Pull latest changes
cd ~/RatanDatingSite
git pull

# 2. Rebuild with fixed config
npm run build

# 3. Verify the fix worked - check dist/index.html
grep -A 5 "global.Request" dist/index.html

# 4. Restart PM2 (if serving from dist)
pm2 restart all

# 5. Clear browser cache and test
```

## Verify Fix in Browser Console

After deployment, open browser DevTools and run:

```javascript
console.log('global:', typeof global);                    // Should be "object"
console.log('global.Request:', typeof global.Request);    // Should be "function"
console.log('global.Response:', typeof global.Response);  // Should be "function"
```

All should return the expected types, NOT "undefined".

## What the Fix Does

The updated `vite.config.js` now:

1. **Sets `window.global = window`** - Creates the global object
2. **Sets `global.Request` and `global.Response`** - Assigns them to global
3. **Injects into BOTH HTML and JS bundle** - Double protection
4. **Uses proper fallback syntax** - No optional chaining that might fail

## If Still Getting Error

Check the actual built file:

```bash
# On EC2, check what's in the built JS file
head -c 2000 ~/RatanDatingSite/dist/assets/index-*.js

# Should see the polyfill at the very start:
# (function() {
#   if (typeof globalThis === 'undefined') {
#     window.globalThis = window;
#   }
#   window.global = window.global || window;
#   ...
```

If you don't see the polyfill, the build didn't work correctly.

## Alternative: Manual Fix

If automated fix doesn't work, manually edit `dist/index.html` on EC2:

```bash
nano ~/RatanDatingSite/dist/index.html
```

Add this BEFORE the `<script type="module">` tag:

```html
<script>
(function() {
  if (typeof globalThis === 'undefined') {
    window.globalThis = window;
  }
  window.global = window.global || window;
  globalThis.global = globalThis.global || globalThis;
  
  if (typeof Request === 'undefined') {
    window.Request = class Request {
      constructor(input, init) {
        this.url = input;
        this.method = (init && init.method) || 'GET';
        this.headers = (init && init.headers) || {};
      }
    };
  }
  
  if (typeof Response === 'undefined') {
    window.Response = class Response {
      constructor(body, init) {
        this.body = body;
        this.status = (init && init.status) || 200;
        this.headers = (init && init.headers) || {};
      }
    };
  }
  
  global.Request = global.Request || window.Request;
  global.Response = global.Response || window.Response;
  globalThis.Request = globalThis.Request || window.Request;
  globalThis.Response = globalThis.Response || window.Response;
  
  if (typeof process === 'undefined') {
    window.process = { 
      env: { NODE_ENV: 'production' },
      browser: true,
      version: '',
      versions: {}
    };
    global.process = window.process;
  }
  
  if (typeof Buffer === 'undefined') {
    window.Buffer = { 
      isBuffer: function() { return false; }
    };
    global.Buffer = window.Buffer;
  }
})();
</script>
```

Then restart: `pm2 restart all`
