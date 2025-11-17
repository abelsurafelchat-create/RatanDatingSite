# IndiDate - Complete Documentation 💕

> A modern, full-stack dating and marriage platform specifically designed for Indian users with cultural integration, real-time features, and intelligent matching.

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()
[![React](https://img.shields.io/badge/react-18.2.0-blue)]()

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Setup Database
```bash
# Create database
createdb indidate

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize tables
node server/database/init.js
```

### 3️⃣ Run Application
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend  
npm run dev
```

**🎉 Done!** Visit http://localhost:5173

## 🌟 Features

### ✅ Implemented Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Authentication** | JWT-based login/register with password hashing | ✅ Complete |
| **Dual Registration** | Separate Dating & Marriage modes | ✅ Complete |
| **Profile Management** | Full profile with caste system integration | ✅ Complete |
| **Swipe Interface** | Tinder-style swipe left/right | ✅ Complete |
| **Smart Matching** | Algorithm-based recommendations | ✅ Complete |
| **Real-time Chat** | LinkedIn-style messaging with Socket.io | ✅ Complete |
| **Video Calling** | Random video calls with WebRTC | ✅ Complete |
| **Match System** | Mutual like detection | ✅ Complete |
| **User Preferences** | Gender, age, caste preferences | ✅ Complete |

### 🚧 Future Enhancements

- [ ] Image upload (AWS S3/Cloudinary)
- [ ] Email verification
- [ ] Password reset
- [ ] Push notifications
- [ ] Advanced filters
- [ ] Premium features
- [ ] Mobile apps

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time communication
- **Simple-peer** - WebRTC wrapper
- **Axios** - HTTP client
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **Socket.io** - WebSocket server
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **pg** - PostgreSQL client

## 📁 Project Structure

```
indidate/
├── 📂 server/                    # Backend (Node.js + Express)
│   ├── 📂 controllers/          # Business logic
│   │   ├── authController.js    # Authentication
│   │   ├── profileController.js # Profile management
│   │   ├── matchController.js   # Matching algorithm
│   │   ├── chatController.js    # Chat functionality
│   │   └── callController.js    # Video calls
│   ├── 📂 routes/               # API routes
│   ├── 📂 middleware/           # Auth middleware
│   ├── 📂 database/             # DB setup & schema
│   └── index.js                 # Server entry point
│
├── 📂 src/                      # Frontend (React)
│   ├── 📂 pages/                # Page components
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration
│   │   ├── Home.jsx             # Swipe interface
│   │   ├── Profile.jsx          # User profile
│   │   ├── Matches.jsx          # Match list
│   │   ├── Chat.jsx             # Messaging
│   │   └── RandomCall.jsx       # Video calls
│   ├── 📂 components/           # Reusable components
│   ├── 📂 context/              # React context (Auth, Socket)
│   ├── App.jsx                  # Main app
│   └── main.jsx                 # Entry point
│
├── 📂 public/                   # Static assets
├── 📄 package.json              # Dependencies
├── 📄 vite.config.js            # Vite configuration
├── 📄 tailwind.config.js        # Tailwind configuration
└── 📄 .env.example              # Environment template
```

## 🗄️ Database Schema

### Tables
- **users** - User accounts and profiles
- **profile_photos** - Additional user photos
- **swipes** - Like/dislike records
- **matches** - Mutual matches
- **messages** - Chat messages
- **video_calls** - Call history
- **user_preferences** - User preferences
- **blocked_users** - Blocked relationships

## 🔌 API Reference

### Authentication
```http
POST /api/auth/register  # Register new user
POST /api/auth/login     # Login user
```

### Profile
```http
GET  /api/profile           # Get current user profile
PUT  /api/profile           # Update profile
GET  /api/profile/:userId   # Get user by ID
```

### Matches
```http
GET  /api/matches/recommendations  # Get match recommendations
POST /api/matches/swipe            # Swipe left/right
GET  /api/matches/list             # Get matched users
```

### Chat
```http
GET  /api/chat/conversations       # Get all conversations
GET  /api/chat/messages/:userId    # Get messages with user
POST /api/chat/send                # Send message
```

### Video Call
```http
POST /api/call/random     # Find random call partner
PUT  /api/call/status     # Update call status
GET  /api/call/history    # Get call history
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/indidate

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this

# Server
PORT=3001
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173
```

## 🔧 Setup Guide

### Prerequisites

Before starting, ensure you have:
- **Node.js** 18+ installed
- **PostgreSQL** 14+ installed and running
- **Git** (optional, for version control)

### Step-by-Step Setup

#### 1. Install Dependencies

Open terminal in the project root directory and run:

```bash
npm install
```

#### 2. Setup PostgreSQL Database

Create database:
```sql
CREATE DATABASE indidate;
```

Create a PostgreSQL user (optional but recommended):
```sql
CREATE USER indidate_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE indidate TO indidate_user;
```

#### 3. Configure Environment Variables

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

#### 4. Initialize Database

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

#### 5. Start the Application

You need to run both the backend and frontend servers.

**Terminal 1 - Start Backend Server:**

```bash
npm run server
```

You should see:
```
🚀 Server running on port 3001
📡 Socket.io server ready
```

**Terminal 2 - Start Frontend Development Server:**

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 🧪 Testing

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

## 🐛 Troubleshooting

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

### PostgreSQL Password Issues

If you're having PostgreSQL password issues:

#### Option 1: Try Common Default Passwords

Try these common defaults:
- `postgres`
- `admin`
- `password`
- `root`
- (blank - no password)

Test with:
```bash
psql -U postgres
# Enter password when prompted
```

If it works, update `.env` file to:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/indidate
```

#### Option 2: Reset PostgreSQL Password

1. **Find pg_hba.conf:**
   ```
   # Linux/Mac: /etc/postgresql/14/main/pg_hba.conf
   # Windows: C:\Program Files\PostgreSQL\14\data\pg_hba.conf
   ```

2. **Edit as Administrator** - Change this line:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
   
   To:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   ```

3. **Restart PostgreSQL**

4. **Connect without password:**
   ```bash
   psql -U postgres
   ```

5. **Set new password:**
   ```sql
   ALTER USER postgres PASSWORD 'newpassword123';
   \q
   ```

6. **Change pg_hba.conf back to `scram-sha-256`**

7. **Restart PostgreSQL again**

8. **Update .env:**
   ```
   DATABASE_URL=postgresql://postgres:newpassword123@localhost:5432/indidate
   ```

## 🚀 Deployment

### Production Environment Variables

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

### Deploy Options

1. **Heroku** - Easy deployment with PostgreSQL addon
2. **DigitalOcean** - Full control with droplets
3. **Vercel + Railway** - Frontend on Vercel, Backend on Railway
4. **Docker** - Containerized deployment

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Protected API routes
- ✅ Secure password requirements
- ✅ Token expiration

### Security Considerations

1. **Change JWT_SECRET** to a strong random string
2. **Use HTTPS** in production
3. **Implement rate limiting** for API endpoints
4. **Add input validation** for all user inputs
5. **Sanitize database queries** (already using parameterized queries)
6. **Add CORS whitelist** for production
7. **Implement password strength requirements**
8. **Add email verification** for new accounts

## 📊 Performance

- Fast page loads with Vite
- Optimized database queries
- Real-time updates with Socket.io
- Responsive design for all devices

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 👥 Target Audience

- **Age**: 18-50 years
- **Location**: India and Indian diaspora
- **Purpose**: Dating and serious relationships
- **Tech Level**: Basic to advanced users

## 🎯 Use Cases

1. **Dating**: Casual dating and relationships
2. **Marriage**: Finding life partners
3. **Networking**: Meeting new people
4. **Video Chat**: Random conversations

## 💡 Business Potential

- Freemium model
- Subscription tiers
- In-app purchases
- Advertisement revenue
- Premium features

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Free to use and modify

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Create an issue
4. Contact support

## 🙏 Acknowledgments

Built with modern web technologies and best practices for creating a scalable, secure, and user-friendly dating platform.

---

**Made with ❤️ for the Indian community**

**Version**: 1.0.0 | **Status**: Production Ready | **License**: MIT
