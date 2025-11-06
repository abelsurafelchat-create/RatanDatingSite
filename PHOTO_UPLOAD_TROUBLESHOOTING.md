# 🔧 Photo Upload Troubleshooting

## Error: "Failed to update profile" (500 Error)

### What I Fixed:

1. **Added Better Error Logging**
   - Backend now logs detailed error information
   - Frontend shows specific error messages
   - Console logs help debug issues

2. **Fixed Preferences Handling**
   - Checks if preferences exist before updating
   - Creates preferences if they don't exist
   - Prevents database errors

3. **Improved Photo Handling**
   - Better validation
   - Clearer error messages
   - Safer database operations

---

## How to Debug:

### Step 1: Check Browser Console

Open browser console (F12) and look for:
```
Saving profile...
Photos count: X
Profile photo exists: true/false
```

If you see an error, note the message.

### Step 2: Check Server Terminal

Look for these logs:
```
Updating profile for user: X
Profile photo length: XXXX
Number of photos: X
User info updated
Preferences updated
Photos updated
```

If it stops at any point, that's where the error is.

### Step 3: Common Issues

#### Issue 1: Photo Too Large
**Symptom:** Upload fails, no error message
**Solution:** 
- Image must be under 5MB
- Compress image before uploading
- Use online tools like TinyPNG

#### Issue 2: Database Connection
**Symptom:** All saves fail
**Solution:**
- Check if backend is running
- Verify database connection
- Restart backend server

#### Issue 3: No Preferences
**Symptom:** Error about user_preferences
**Solution:**
- Fixed! Backend now creates preferences if missing
- Just restart backend server

---

## Quick Fixes:

### Fix 1: Restart Servers

```bash
# Kill all node processes
Get-Process -Name node | Stop-Process -Force

# Start backend
npm run server

# Start frontend (new terminal)
npm run dev
```

### Fix 2: Test with Small Image

1. Use a very small test image (< 100KB)
2. Try uploading just profile photo
3. If it works, the issue is file size

### Fix 3: Check Database

```bash
# Connect to database
psql -U postgres -d indidate

# Check if user_preferences exists
SELECT * FROM user_preferences LIMIT 1;

# If empty, it's normal - backend will create it
```

---

## Testing Steps:

### Test 1: Profile Photo Only

1. Go to Profile → Edit Profile
2. Click profile circle
3. Select a SMALL image (< 500KB)
4. Click Save Changes
5. Check console for errors

### Test 2: Gallery Photo

1. Click Edit Profile
2. Scroll to gallery
3. Click upload box
4. Select SMALL image
5. Click Save Changes
6. Check console

### Test 3: Multiple Photos

1. Add 2-3 small photos
2. Don't add too many at once
3. Save after each 2-3 photos
4. Check if they persist

---

## Error Messages Explained:

### "File size must be less than 5MB"
- Your image is too large
- Compress it or use smaller image

### "Failed to upload photo"
- Browser couldn't read the file
- Try a different image
- Check file format (must be image)

### "Request failed with status code 500"
- Backend error
- Check server terminal for details
- Restart backend

### "Failed to update profile"
- Generic error
- Check both browser and server console
- Look for specific error message

---

## What to Check:

✅ **Backend Running?**
```bash
# Should see:
✅ Database connected successfully
🚀 Server running on port 3001
```

✅ **Frontend Running?**
```bash
# Should see:
VITE v4.4.9  ready in xxx ms
➜  Local:   http://localhost:5174/
```

✅ **Database Connected?**
```bash
# In server terminal, should NOT see:
❌ Database connection failed
```

✅ **Image Size OK?**
- File size < 5MB
- Image format: JPG, PNG, GIF, WebP

---

## Advanced Debugging:

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Save Changes"
4. Look for PUT request to `/api/profile`
5. Check:
   - Status code (should be 200)
   - Response (should say "success")
   - Request payload (should have photos)

### Check Database

```sql
-- Check if photos are saved
SELECT id, full_name, LENGTH(profile_photo) as photo_size 
FROM users 
WHERE id = YOUR_USER_ID;

-- Check gallery photos
SELECT user_id, LENGTH(photo_url) as photo_size, is_primary 
FROM profile_photos 
WHERE user_id = YOUR_USER_ID;
```

---

## Solutions:

### Solution 1: Use Smaller Images

**Compress images online:**
- TinyPNG.com
- Compressor.io
- Squoosh.app

**Or resize:**
- 800x800 pixels is enough
- 70-80% JPEG quality
- Should be < 500KB

### Solution 2: Upload One at a Time

Instead of uploading 6 photos at once:
1. Upload profile photo
2. Save
3. Upload 2 gallery photos
4. Save
5. Upload 2 more
6. Save

### Solution 3: Clear and Retry

1. Click Cancel in edit mode
2. Refresh page
3. Click Edit Profile again
4. Try uploading again

---

## Prevention:

### Best Practices:

1. **Use optimized images**
   - Compress before uploading
   - Resize to reasonable dimensions
   - Target < 500KB per image

2. **Upload gradually**
   - Don't upload all 6 at once
   - Save after 2-3 photos
   - Verify each batch works

3. **Check before saving**
   - Make sure photos appear
   - Wait for "Uploading..." to finish
   - Don't click Save while uploading

4. **Monitor console**
   - Keep browser console open
   - Watch for errors
   - Note any warnings

---

## Still Not Working?

### Get Help:

1. **Copy error message**
   - From browser console
   - From server terminal
   - Full error text

2. **Note what you did**
   - What button you clicked
   - What image you uploaded
   - When error appeared

3. **Check documentation**
   - PHOTO_UPLOAD_GUIDE.md
   - FINAL_FIXES.md
   - README.md

---

## Summary:

### What's Fixed:
✅ Better error logging
✅ Preferences auto-creation
✅ Detailed error messages
✅ Safer database operations

### What to Do:
1. Restart both servers
2. Try with small image (< 500KB)
3. Check console for errors
4. Upload one photo at a time
5. Save frequently

### If Still Failing:
- Check server terminal for errors
- Verify database is running
- Try different image
- Clear browser cache
- Restart everything

---

**The system is now more robust and should work!** 🎉

If you see specific errors, check the server terminal for detailed logs.
