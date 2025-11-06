# 🔍 Photo Registration Debugging

## Issue
Photos not appearing on profiles after registration

## Debugging Steps Added

### Frontend Logging (Register.jsx):
```
Registering user...
Profile photo included: Yes/No
Profile photo length: XXXXX
```

### Backend Logging (authController.js):
```
Registration request received
Email: user@example.com
Full Name: John Doe
Profile Photo received: Yes/No
Profile Photo length: XXXXX
Profile Photo preview: data:image/png;base64,iVBOR...
User created with ID: 5
User profile_photo saved: Yes/No
Adding photo to profile_photos table...
Photo added to profile_photos table
```

---

## How to Debug

### Step 1: Test Registration with Photo

1. Go to registration page
2. Fill in all fields
3. Upload a photo
4. Open browser console (F12)
5. Click "Create Account"

### Step 2: Check Frontend Console

Look for:
```
Registering user...
Profile photo included: Yes
Profile photo length: 50000 (or similar)
```

**If you see:**
- ✅ "Profile photo included: Yes" → Photo is being sent
- ❌ "Profile photo included: No" → Photo not in form data

### Step 3: Check Backend Terminal

Look for:
```
Registration request received
Email: test@example.com
Full Name: Test User
Profile Photo received: Yes
Profile Photo length: 50000
User created with ID: 5
User profile_photo saved: Yes
Adding photo to profile_photos table...
Photo added to profile_photos table
```

**If you see:**
- ✅ "Profile Photo received: Yes" → Backend got the photo
- ❌ "Profile Photo received: No" → Photo not in request

### Step 4: Check Database

```sql
-- Check users table
SELECT id, full_name, 
       CASE 
         WHEN profile_photo IS NULL THEN 'No photo'
         WHEN LENGTH(profile_photo) > 0 THEN 'Has photo'
         ELSE 'Empty'
       END as photo_status
FROM users 
ORDER BY id DESC 
LIMIT 5;

-- Check profile_photos table
SELECT user_id, 
       CASE 
         WHEN photo_url IS NULL THEN 'No photo'
         WHEN LENGTH(photo_url) > 0 THEN 'Has photo'
         ELSE 'Empty'
       END as photo_status,
       is_primary
FROM profile_photos 
ORDER BY id DESC 
LIMIT 5;
```

---

## Common Issues & Solutions

### Issue 1: Photo Not in Form Data

**Symptoms:**
- Frontend shows "Profile photo included: No"
- File input shows selected file

**Solution:**
Check if `handlePhotoUpload` is being called:
```javascript
const handlePhotoUpload = (e) => {
  console.log('File selected:', e.target.files[0]);
  // ... rest of code
};
```

### Issue 2: Photo Not Sent to Backend

**Symptoms:**
- Frontend shows "Profile photo included: Yes"
- Backend shows "Profile Photo received: No"

**Solution:**
Check AuthContext register function sends profilePhoto.

### Issue 3: Photo Not Saved to Database

**Symptoms:**
- Backend shows "Profile Photo received: Yes"
- Database shows no photo

**Solution:**
Check if profile_photo column exists and is TEXT type:
```sql
ALTER TABLE users 
ALTER COLUMN profile_photo TYPE TEXT;
```

### Issue 4: Photo Saved But Not Displaying

**Symptoms:**
- Database has photo
- Profile page shows no photo

**Solution:**
Check profile page fetches and displays profile_photo field.

---

## Quick Tests

### Test 1: Small Image
```
1. Upload small image (< 100KB)
2. Check console logs
3. Should work
```

### Test 2: Large Image
```
1. Upload 3MB image
2. Check console logs
3. Should work (under 5MB limit)
```

### Test 3: Very Large Image
```
1. Upload 10MB image
2. Should see error: "Image size should be less than 5MB"
3. Should not proceed
```

---

## Expected Flow

### Successful Registration with Photo:

**Frontend:**
1. User selects photo
2. `handlePhotoUpload` called
3. File validated (type & size)
4. Converted to Base64
5. Stored in `formData.profilePhoto`
6. Preview shown
7. User submits form
8. `register()` called with profilePhoto

**Backend:**
1. Request received
2. profilePhoto extracted from body
3. User inserted with profile_photo
4. Photo also added to profile_photos table
5. Response sent

**Database:**
1. users.profile_photo = Base64 string
2. profile_photos.photo_url = Base64 string
3. profile_photos.is_primary = true

**Profile Page:**
1. Fetch user data
2. profile_photo field has data
3. Display in img tag
4. Photo visible

---

## What to Report

After testing, please provide:

1. **Frontend Console Output:**
   - Copy all logs from registration

2. **Backend Terminal Output:**
   - Copy all logs from registration

3. **Database Check:**
   - Result of SQL queries above

4. **Photo Details:**
   - File size
   - File type
   - File name

This will help identify exactly where the issue is!
