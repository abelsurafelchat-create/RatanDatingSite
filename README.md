# IndiDate - Indian Dating & Marriage App 💕

> A modern, full-stack dating and marriage platform specifically designed for Indian users with cultural integration, real-time features, and intelligent matching.

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)]()
[![React](https://img.shields.io/badge/react-18.2.0-blue)]()

## 🌟 Highlights

- **🎯 Dual Mode**: Separate Dating and Marriage registration systems
- **💑 Smart Matching**: AI-powered recommendations based on preferences
- **📹 Video Calls**: Omegle-style random video calling with WebRTC
- **💬 Real-time Chat**: LinkedIn-inspired professional chat interface
- **🏛️ Cultural Integration**: Indian caste system support (optional)
- **👆 Swipe Feature**: Tinder-like swipe interface for matching
- **🔒 Secure**: JWT authentication, password hashing, SQL injection prevention
- **📱 Responsive**: Mobile-first design, works on all devices

## 📸 Screenshots

```
[Login Page] → [Registration] → [Swipe Interface] → [Matches] → [Chat] → [Video Call]
```

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

## 📋 Features

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

## 📚 Documentation

Comprehensive documentation available:

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[FEATURES.md](FEATURES.md)** - Complete feature documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference guide

## 🧪 Testing

### Create Test Users

1. Register first user (e.g., male, dating)
2. Register second user (e.g., female, dating)
3. Test swipe feature
4. Create matches
5. Test chat
6. Test video calling

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Protected API routes
- ✅ Secure password requirements
- ✅ Token expiration

## 🚀 Deployment

### Quick Deploy Options

1. **Heroku** - Easy deployment with PostgreSQL addon
2. **DigitalOcean** - Full control with droplets
3. **Vercel + Railway** - Frontend on Vercel, Backend on Railway
4. **Docker** - Containerized deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
```

**Port Already in Use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Module Not Found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for more solutions.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Free to use and modify

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

## 📞 Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Create an issue
4. Contact support

## 🙏 Acknowledgments

Built with modern web technologies and best practices for creating a scalable, secure, and user-friendly dating platform.

---

**Made with ❤️ for the Indian community**

**Version**: 1.0.0 | **Status**: Production Ready | **License**: MIT
