# Admin Dashboard Guide

## Overview
Your dating site now has a fully functional admin dashboard that allows you to manage users, view statistics, and monitor platform activity.

## Accessing the Admin Dashboard

### Step 1: Make Your Account an Admin

You have **three options** to grant admin access:

#### Option A: Using the setup-admin.js Script (Recommended)

1. **View existing users** (optional):
   ```bash
   node setup-admin.js
   ```
   This will show you the first 5 users in your database.

2. **Make a user admin**:
   ```bash
   node setup-admin.js your-email@example.com
   ```
   Replace `your-email@example.com` with the email of the account you want to make admin.

#### Option B: Using the API Endpoint

If you're already logged in to the site:

1. Open your browser's Developer Console (F12)
2. Run this command:
   ```javascript
   fetch('/api/admin/make-admin', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`
     }
   }).then(r => r.json()).then(console.log)
   ```
3. Refresh the page

#### Option C: Direct Database Update

If you have direct database access:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Step 2: Access the Dashboard

Once you have admin privileges:

1. **Log out and log back in** (or refresh the page)
2. You'll see a new **"Admin"** button with a shield icon in the navigation bar
3. Click on it to access the admin dashboard
4. Or navigate directly to: `http://your-site.com/admin`

## Admin Dashboard Features

### 📊 Dashboard Tab

View key metrics and statistics:

- **Total Users**: Total number of registered users
- **Active Users**: Users who logged in within the last 30 days
- **Total Matches**: Number of active matches on the platform
- **Messages Today**: Messages sent today
- **Recent Activity**: Timeline of recent user registrations and matches

### 👥 Users Tab

Manage all users on your platform:

- **Search**: Find users by name or email
- **Filter**: View all users, only active, or only inactive users
- **User Information**: See profile photo, name, email, join date, and match count
- **Actions**:
  - 👁️ **View Profile**: Click the eye icon to view a user's full profile
  - 🚫 **Deactivate**: Temporarily disable a user's account
  - ✅ **Activate**: Re-enable a deactivated account

### 💕 Matches Tab

*(Coming Soon)*
- View all matches on the platform
- See match statistics and trends
- Monitor matching activity

### 💬 Messages Tab

*(Coming Soon)*
- Monitor message activity
- View most active conversations
- Message statistics and analytics

### ⚙️ Settings Tab

*(Coming Soon)*
- Configure platform settings
- Manage system preferences
- Platform customization options

## Admin Permissions

Admin users have access to:

✅ View all user profiles  
✅ Activate/deactivate user accounts  
✅ View platform statistics  
✅ Monitor user activity  
✅ Access admin-only API endpoints  

## Security Notes

⚠️ **Important Security Considerations:**

1. **Remove the temporary endpoint**: After setting up your admin account, consider removing or securing the `/api/admin/make-admin` endpoint in `/server/routes/admin.js` (line 28-51)

2. **Protect admin routes**: All admin routes are protected by authentication middleware and role checking

3. **Keep admin credentials secure**: Admin accounts have elevated privileges - use strong passwords

4. **Monitor admin activity**: Consider implementing admin action logging for security auditing

## Troubleshooting

### "Access denied" when visiting /admin

**Solution**: Make sure you:
1. Have the `role` field set to `'admin'` in the database
2. Logged out and logged back in after becoming admin
3. Check the browser console for any errors

### Admin link not showing in navigation

**Solution**: 
1. Clear your browser cache
2. Log out and log in again
3. Check that `user.role === 'admin'` in the browser console:
   ```javascript
   // In browser console
   console.log(JSON.parse(localStorage.getItem('user'))?.role)
   ```

### Database doesn't have 'role' column

**Solution**: Run the migration:
```bash
node setup-admin.js
```
This will automatically add the role column if it doesn't exist.

## API Endpoints

Admin-specific endpoints (all require authentication + admin role):

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users with pagination
- `POST /api/admin/users/:userId/activate` - Activate a user
- `POST /api/admin/users/:userId/deactivate` - Deactivate a user
- `GET /api/admin/matches/stats` - Get match statistics
- `GET /api/admin/messages/stats` - Get message statistics

## Next Steps

Consider enhancing the admin dashboard with:

- [ ] User analytics and charts
- [ ] Export user data to CSV
- [ ] Bulk user operations
- [ ] Admin activity logs
- [ ] Email notifications for admin actions
- [ ] Advanced user filtering and search
- [ ] Platform configuration settings
- [ ] Content moderation tools
- [ ] Report management system

---

**Need Help?** Check the following files:
- Frontend: `/src/pages/Admin.jsx`
- Backend Routes: `/server/routes/admin.js`
- Backend Controller: `/server/controllers/adminController.js`
- Database Migration: `/server/database/migrations/002_add_admin_role.sql`
