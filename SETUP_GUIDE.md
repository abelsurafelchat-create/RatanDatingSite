# IndiDate - Complete Setup Guide

## Prerequisites

Before starting, ensure you have:
- **Node.js** 18+ installed
- **PostgreSQL** 14+ installed and running
- **Git** (optional, for version control)

## Step-by-Step Setup

### 1. Install Dependencies

Open terminal in the project root directory and run:

```bash
npm install
```

This will install all required packages for both frontend and backend.

### 2. Setup PostgreSQL Database

#### Create Database

Open PostgreSQL command line or pgAdmin and run:

```sql
CREATE DATABASE indidate;
```

#### Create a PostgreSQL User (Optional but recommended)

```sql
CREATE USER indidate_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE indidate TO indidate_user;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/indidate

# JWT Secret (change this to a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=3001

# Environment
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

**Important:** Replace `username` and `password` with your PostgreSQL credentials.

### 4. Initialize Database

Run the database initialization script:

```bash
node server/database/init.js
```

You should see:
```
✅ Database initialized successfully!
Tables created:
  - users
  - profile_photos
  - swipes
  - matches
  - messages
  - video_calls
  - user_preferences
  - blocked_users
```

### 5. Start the Application

You need to run both the backend and frontend servers.

#### Terminal 1 - Start Backend Server:

```bash
npm run server
```

You should see:
```
🚀 Server running on port 3001
📡 Socket.io server ready
```

#### Terminal 2 - Start Frontend Development Server:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Testing the Application

### Create Test Users

1. **Register First User:**
   - Click "Sign up"
   - Choose "Dating" or "Marriage"
   - Fill in details (use different genders for testing)
   - Submit registration

2. **Register Second User:**
   - Logout from first account
   - Register another user with opposite gender
   - Same registration type (dating/marriage)

3. **Test Features:**
   - **Swipe:** Go to home page and swipe right on profiles
   - **Match:** When both users like each other, you'll see a match notification
   - **Chat:** Go to Matches page and click "Chat" to message
   - **Random Call:** Click Video icon to start random video calling
   - **Profile:** Update your profile information

## Troubleshooting

### Database Connection Error

**Error:** `Connection refused` or `ECONNREFUSED`

**Solution:**
1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   pg_ctl status
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Check your DATABASE_URL in `.env`
3. Verify PostgreSQL is listening on port 5432

### Port Already in Use

**Error:** `Port 3001 is already in use`

**Solution:**
1. Change the PORT in `.env` file
2. Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3001 | xargs kill -9
   ```

### Camera/Microphone Not Working

**Error:** Video call not starting

**Solution:**
1. Grant browser permissions for camera/microphone
2. Use HTTPS in production (required for WebRTC)
3. Check if another app is using the camera

### Module Not Found Errors

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=very_long_random_string_for_production
CLIENT_URL=https://yourdomain.com
```

### Build Frontend

```bash
npm run build
```

### Serve Production Build

You can use the built files in `dist/` folder with any static hosting service or serve them with Express.

### Database Migration

For production, consider using a migration tool like:
- **node-pg-migrate**
- **Sequelize**
- **TypeORM**

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/:userId` - Get user by ID

### Matches
- `GET /api/matches/recommendations` - Get recommendations
- `POST /api/matches/swipe` - Swipe left/right
- `GET /api/matches/list` - Get matched users

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/messages/:userId` - Get messages with user
- `POST /api/chat/send` - Send message

### Video Call
- `POST /api/call/random` - Find random call partner
- `PUT /api/call/status` - Update call status
- `GET /api/call/history` - Get call history

## Security Considerations

1. **Change JWT_SECRET** to a strong random string
2. **Use HTTPS** in production
3. **Implement rate limiting** for API endpoints
4. **Add input validation** for all user inputs
5. **Sanitize database queries** (already using parameterized queries)
6. **Add CORS whitelist** for production
7. **Implement password strength requirements**
8. **Add email verification** for new accounts

## Feature Enhancements (Future)

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Image upload for profile photos
- [ ] Advanced filters (religion, education, etc.)
- [ ] Block/Report users
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Premium features
- [ ] Admin dashboard

## Support

For issues or questions:
1. Check this guide first
2. Review the README.md
3. Check console logs for errors
4. Verify database connection

## License

MIT License - Feel free to use and modify for your needs.
