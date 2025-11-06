# Quick Reference Guide - IndiDate

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Setup database
createdb indidate
cp .env.example .env
node server/database/init.js

# Development
npm run server    # Backend (Terminal 1)
npm run dev       # Frontend (Terminal 2)

# Production
npm run build     # Build frontend
npm run server    # Start server
```

## 🔑 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/indidate
JWT_SECRET=your_secret_key
PORT=3001
NODE_ENV=development
```

## 📡 API Quick Reference

### Auth
```javascript
POST /api/auth/register
POST /api/auth/login
```

### Profile
```javascript
GET    /api/profile
PUT    /api/profile
GET    /api/profile/:userId
```

### Matches
```javascript
GET    /api/matches/recommendations
POST   /api/matches/swipe
GET    /api/matches/list
```

### Chat
```javascript
GET    /api/chat/conversations
GET    /api/chat/messages/:userId
POST   /api/chat/send
```

### Calls
```javascript
POST   /api/call/random
PUT    /api/call/status
GET    /api/call/history
```

## 🗄️ Database Tables

```sql
users              -- User accounts
profile_photos     -- User photos
swipes            -- Like/dislike records
matches           -- Mutual matches
messages          -- Chat messages
video_calls       -- Call history
user_preferences  -- User preferences
blocked_users     -- Blocked relationships
```

## 🎨 Component Structure

```
src/
├── pages/
│   ├── Login.jsx          -- Login page
│   ├── Register.jsx       -- Registration
│   ├── Home.jsx           -- Swipe feature
│   ├── Profile.jsx        -- User profile
│   ├── Matches.jsx        -- Match list
│   ├── Chat.jsx           -- Messaging
│   └── RandomCall.jsx     -- Video calls
├── components/
│   ├── Layout.jsx         -- App layout
│   └── PrivateRoute.jsx   -- Protected routes
└── context/
    ├── AuthContext.jsx    -- Auth state
    └── SocketContext.jsx  -- Socket connection
```

## 🔌 Socket.io Events

### Client → Server
```javascript
socket.emit('authenticate', userId)
socket.emit('send_message', { receiverId, message })
socket.emit('typing', { receiverId })
socket.emit('join_random_call', { userId, gender, registrationType })
socket.emit('call_signal', { to, signal })
socket.emit('end_call', { partnerId })
```

### Server → Client
```javascript
socket.on('receive_message', data)
socket.on('user_typing', data)
socket.on('waiting_for_partner')
socket.on('call_matched', { roomId, partnerId })
socket.on('call_signal', { from, signal })
socket.on('call_ended')
```

## 🎯 Key Features

| Feature | Status | Page |
|---------|--------|------|
| Registration | ✅ | /register |
| Login | ✅ | /login |
| Swipe | ✅ | / |
| Profile | ✅ | /profile |
| Matches | ✅ | /matches |
| Chat | ✅ | /chat |
| Video Call | ✅ | /random-call |

## 🔒 Authentication Flow

```javascript
// Login
const { token, user } = await axios.post('/api/auth/login', { email, password })
localStorage.setItem('token', token)
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

// Protected Request
axios.get('/api/profile', {
  headers: { Authorization: `Bearer ${token}` }
})

// Logout
localStorage.removeItem('token')
delete axios.defaults.headers.common['Authorization']
```

## 🎨 Styling Classes

### Colors
```css
bg-primary-600      /* Main red */
text-primary-600    /* Text red */
border-primary-500  /* Border red */
```

### Layout
```css
container           /* Max width container */
flex items-center   /* Flexbox center */
grid grid-cols-2    /* 2 column grid */
```

### Responsive
```css
md:grid-cols-2      /* Tablet: 2 cols */
lg:w-80            /* Desktop: 80 width */
```

## 🐛 Common Issues & Solutions

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/indidate
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Video Call Not Working
- Enable camera/microphone permissions
- Use HTTPS in production
- Check WebRTC browser support

## 📦 Package Scripts

```json
{
  "dev": "vite",                    // Start frontend dev server
  "build": "vite build",            // Build for production
  "preview": "vite preview",        // Preview production build
  "server": "node server/index.js"  // Start backend server
}
```

## 🔧 Development Tips

### Hot Reload
- Frontend: Auto-reload on save (Vite)
- Backend: Manual restart needed

### Debugging
```javascript
// Backend
console.log('Debug:', variable)

// Frontend
console.log('Debug:', variable)
// Or use React DevTools
```

### Database Queries
```javascript
// Always use parameterized queries
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
)
```

## 📱 Testing Users

Create test users with:
- Different genders (male/female)
- Same registration type (dating/marriage)
- Different castes
- Different locations

## 🌐 URLs

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3001
API:       http://localhost:3001/api
Socket:    http://localhost:3001/socket.io
```

## 📊 Database Queries

### Get User Profile
```sql
SELECT * FROM users WHERE id = $1;
```

### Get Recommendations
```sql
SELECT * FROM users 
WHERE registration_type = $1 
  AND gender = $2 
  AND id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = $3)
ORDER BY RANDOM() 
LIMIT 20;
```

### Create Match
```sql
INSERT INTO matches (user1_id, user2_id) 
VALUES ($1, $2);
```

### Get Messages
```sql
SELECT * FROM messages 
WHERE (sender_id = $1 AND receiver_id = $2) 
   OR (sender_id = $2 AND receiver_id = $1)
ORDER BY created_at DESC;
```

## 🎯 Performance Tips

1. **Database**: Add indexes on frequently queried fields
2. **Frontend**: Use React.memo for expensive components
3. **Images**: Optimize and lazy load
4. **API**: Implement pagination
5. **Cache**: Use Redis for frequently accessed data

## 📝 Code Snippets

### Create Protected Route
```javascript
<Route path="/profile" element={
  <PrivateRoute>
    <Profile />
  </PrivateRoute>
} />
```

### Make API Call
```javascript
const response = await axios.get('/api/profile', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### Emit Socket Event
```javascript
socket.emit('send_message', {
  receiverId: userId,
  message: text
})
```

### Handle Socket Event
```javascript
socket.on('receive_message', (data) => {
  setMessages(prev => [...prev, data])
})
```

## 🔐 Security Checklist

- [x] Password hashing (bcrypt)
- [x] JWT authentication
- [x] SQL injection prevention
- [x] CORS configuration
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] HTTPS (production)
- [ ] Environment variables

## 📚 Documentation Files

- `README.md` - Main documentation
- `SETUP_GUIDE.md` - Detailed setup
- `FEATURES.md` - Feature documentation
- `DEPLOYMENT.md` - Deployment guide
- `PROJECT_SUMMARY.md` - Project overview
- `QUICK_REFERENCE.md` - This file

## 🎓 Learning Resources

- React: https://react.dev
- Express: https://expressjs.com
- PostgreSQL: https://postgresql.org
- Socket.io: https://socket.io
- TailwindCSS: https://tailwindcss.com
- WebRTC: https://webrtc.org

## 💻 VS Code Extensions

Recommended:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL
- Thunder Client (API testing)

## 🚀 Deployment Checklist

- [ ] Update dependencies
- [ ] Run security audit
- [ ] Test all features
- [ ] Setup SSL certificate
- [ ] Configure environment variables
- [ ] Setup database backups
- [ ] Enable monitoring
- [ ] Create privacy policy
- [ ] Test on multiple devices

## 📞 Support

- Check documentation first
- Review error logs
- Test in isolation
- Ask for help with details

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: 2024
