# 🌱 Seed 100 Random Users

## What It Does

Creates 100 random user accounts with:
- ✅ Random Indian names (male/female)
- ✅ Random profile photos (generated avatars)
- ✅ Random ages (18-50 years)
- ✅ Random locations (Indian cities)
- ✅ Random bios
- ✅ Random registration type (dating/marriage)
- ✅ Default password: `password123`

---

## How to Run

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Run the Seeder
```bash
node seed-users.js
```

### Step 3: Wait for Completion
The script will:
1. Create 100 users one by one
2. Generate profile photos for each
3. Save to database
4. Show progress in terminal

Expected time: ~2-3 minutes

---

## What You'll See

```
Starting to seed 100 random users...

Creating user 1/100: Aarav Sharma (male)
✓ Created user: Aarav Sharma (ID: 15)

Creating user 2/100: Saanvi Patel (female)
✓ Created user: Saanvi Patel (ID: 16)

...

==================================================
Seeding complete!
==================================================
✓ Successfully created: 100 users
✗ Failed: 0 users
⏱ Time taken: 145.23 seconds
==================================================

Default password for all accounts: password123
```

---

## Generated Data

### User Details:
- **Email**: firstname.lastname{number}@example.com
- **Password**: password123 (all accounts)
- **Full Name**: Random Indian name
- **Gender**: Male or Female (50/50)
- **Age**: 18-50 years
- **Location**: Random Indian city
- **Caste**: Random (optional)
- **Bio**: Random bio from 20 options
- **Registration Type**: Dating or Marriage

### Profile Photos:
- Generated using UI Avatars API
- Based on user's first name
- Random background colors
- 400x400 pixels
- Stored as Base64 in database

---

## After Seeding

### Test Login:
Pick any generated email and use password: `password123`

Example:
- Email: `aarav.sharma1@example.com`
- Password: `password123`

### View Users:
```sql
SELECT id, full_name, email, gender, location, registration_type
FROM users
ORDER BY id DESC
LIMIT 10;
```

### Check Photos:
```sql
SELECT u.id, u.full_name,
  CASE 
    WHEN u.profile_photo IS NOT NULL THEN 'Has Photo'
    ELSE 'No Photo'
  END as photo_status
FROM users u
ORDER BY u.id DESC
LIMIT 10;
```

---

## Features

### Realistic Data:
- ✅ Indian names and cities
- ✅ Proper age ranges
- ✅ Realistic bios
- ✅ Gender preferences set

### Complete Profiles:
- ✅ Profile photo
- ✅ All required fields
- ✅ User preferences
- ✅ Ready to match

### Immediate Use:
- ✅ Can login right away
- ✅ Appears in recommendations
- ✅ Can swipe and match
- ✅ Can chat

---

## Customization

### Change Number of Users:
Edit line in `seed-users.js`:
```javascript
for (let i = 0; i < 100; i++) {  // Change 100 to desired number
```

### Change Default Password:
Edit line in `seed-users.js`:
```javascript
const password = 'password123';  // Change to your password
```

### Add More Names:
Add to arrays in `seed-users.js`:
```javascript
const maleFirstNames = ['Aarav', 'Vivaan', ...];
const femaleFirstNames = ['Aadhya', 'Saanvi', ...];
const lastNames = ['Sharma', 'Verma', ...];
```

---

## Troubleshooting

### Error: Cannot connect to database
**Solution**: Make sure PostgreSQL is running and .env is configured

### Error: Duplicate email
**Solution**: Clear existing test users or change email format

### Slow execution
**Normal**: Generating 100 photos takes time (2-3 minutes)

### Some users failed
**Check**: Network connection for photo generation

---

## Clean Up Test Users

### Delete All Seeded Users:
```sql
-- Be careful! This deletes users with @example.com emails
DELETE FROM user_preferences 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com');

DELETE FROM profile_photos 
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com');

DELETE FROM users 
WHERE email LIKE '%@example.com';
```

### Delete Specific Range:
```sql
-- Delete users with IDs 15-114 (if those are the seeded ones)
DELETE FROM user_preferences WHERE user_id BETWEEN 15 AND 114;
DELETE FROM profile_photos WHERE user_id BETWEEN 15 AND 114;
DELETE FROM users WHERE id BETWEEN 15 AND 114;
```

---

## Benefits

### Testing:
- ✅ Test matching algorithm
- ✅ Test swipe functionality
- ✅ Test chat features
- ✅ Test search and filters

### Demo:
- ✅ Show realistic data
- ✅ Demonstrate features
- ✅ Present to stakeholders
- ✅ User testing

### Development:
- ✅ Quick database population
- ✅ No manual data entry
- ✅ Consistent test data
- ✅ Easy to reset

---

## Summary

**Command:**
```bash
node server/seed-users.js
```

**Result:**
- 100 users with photos
- All ready to use
- Default password: password123
- Takes ~2-3 minutes

**Perfect for:**
- Testing
- Demos
- Development
- User research

---

**Run it now and get 100 users instantly!** 🚀
