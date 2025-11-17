import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import matchRoutes from './routes/matches.js';
import chatRoutes from './routes/chat.js';
import callRoutes from './routes/call.js';
import videoRoutes from './routes/videoRoutes.js';
import { setActiveUsers } from './controllers/videoController.js';

dotenv.config();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || true, // Allow all origins in production
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/call', callRoutes);
app.use('/api/video', videoRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'dist');
  console.log('📁 Serving static files from:', buildPath);
  app.use(express.static(buildPath));
  
  // Handle React routing - return index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'Server is running', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io for real-time features
const activeUsers = new Map(); // userId -> socketId
const waitingForCall = new Map(); // userId -> { socketId, gender, registrationType }

io.on('connection', (socket) => {
  console.log('🔌 New socket connection established:', socket.id);
  console.log('🌐 Client origin:', socket.handshake.headers.origin);
  console.log('🔗 Client address:', socket.handshake.address);

  // User authentication
  socket.on('authenticate', (userId) => {
    console.log(`🔐 Authenticating user ${userId} with socket ${socket.id}`);
    
    // Convert userId to number if it's a string
    const userIdNum = parseInt(userId);
    
    activeUsers.set(userIdNum, socket.id);
    socket.userId = userIdNum;
    
    // Update active users list for video calls
    const activeUserIds = Array.from(activeUsers.keys());
    setActiveUsers(activeUserIds);
    
    console.log(`✅ User ${userIdNum} authenticated successfully`);
    console.log(`📊 Total active users: ${activeUserIds.length}`, activeUserIds);
    
    // Emit confirmation back to client
    socket.emit('authenticated', { userId: userIdNum, success: true });
  });

  // Chat messaging
  socket.on('send_message', (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        senderId: socket.userId,
        message,
        timestamp: new Date(),
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { receiverId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', {
        userId: socket.userId,
      });
    }
  });

  // Random video call matching
  socket.on('join_random_call', (data) => {
    const { userId, gender, registrationType } = data;
    const preferredGender = gender === 'male' ? 'female' : 'male';

    // Find a waiting partner
    let foundPartner = null;
    for (const [waitingUserId, waitingData] of waitingForCall.entries()) {
      if (
        waitingData.gender === preferredGender &&
        waitingData.registrationType === registrationType &&
        waitingUserId !== userId
      ) {
        foundPartner = { userId: waitingUserId, ...waitingData };
        waitingForCall.delete(waitingUserId);
        break;
      }
    }

    if (foundPartner) {
      // Match found
      const roomId = `call_${userId}_${foundPartner.userId}`;
      
      socket.join(roomId);
      io.to(foundPartner.socketId).emit('call_matched', {
        roomId,
        partnerId: userId,
      });
      
      socket.emit('call_matched', {
        roomId,
        partnerId: foundPartner.userId,
      });
    } else {
      // Add to waiting list
      waitingForCall.set(userId, {
        socketId: socket.id,
        gender,
        registrationType,
      });
      socket.emit('waiting_for_partner');
    }
  });

  // WebRTC signaling
  socket.on('call_signal', (data) => {
    const { to, signal } = data;
    const receiverSocketId = activeUsers.get(to);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call_signal', {
        from: socket.userId,
        signal,
      });
    }
  });

  socket.on('end_call', (data) => {
    const { partnerId } = data;
    const partnerSocketId = activeUsers.get(partnerId);
    
    if (partnerSocketId) {
      io.to(partnerSocketId).emit('call_ended');
    }
  });

  // Random Video Call Events
  socket.on('get_online_users', () => {
    const onlineUsersList = Array.from(activeUsers.keys())
      .filter(id => id !== socket.userId)
      .map(id => ({ id }));
    socket.emit('online_users', onlineUsersList);
  });

  socket.on('video_call_offer', (data) => {
    const { to, offer, from, fromName, fromPhoto } = data;
    const receiverSocketId = activeUsers.get(to);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('video_call_offer', {
        offer,
        from,
        fromName,
        fromPhoto
      });
    }
  });

  socket.on('video_call_answer', (data) => {
    const { to, answer } = data;
    console.log('Received video_call_answer for user:', to);
    const receiverSocketId = activeUsers.get(to);
    console.log('Caller socket ID:', receiverSocketId);
    
    if (receiverSocketId) {
      console.log('Sending answer to caller');
      io.to(receiverSocketId).emit('video_call_answer', { answer });
    } else {
      console.log('Caller socket not found!');
    }
  });

  socket.on('ice_candidate', (data) => {
    const { to, candidate } = data;
    const receiverSocketId = activeUsers.get(to);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('ice_candidate', { candidate });
    }
  });

  socket.on('call_rejected', (data) => {
    const { to } = data;
    const receiverSocketId = activeUsers.get(to);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call_rejected');
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    
    if (socket.userId) {
      console.log(`👋 Removing user ${socket.userId} from active users`);
      activeUsers.delete(socket.userId);
      waitingForCall.delete(socket.userId);
      
      // Update active users list for video calls
      const activeUserIds = Array.from(activeUsers.keys());
      setActiveUsers(activeUserIds);
      
      console.log(`📊 Remaining active users: ${activeUserIds.length}`, activeUserIds);
    } else {
      console.log('⚠️ Disconnected socket had no userId');
    }
  });
});

const PORT = process.env.PORT || 3001;

// Test database connection before starting server
async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io server ready`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL is running');
    console.error('2. DATABASE_URL in .env is correct');
    console.error('3. Database "indidate" exists');
    console.error('\nError details:', error);
    process.exit(1);
  }
}

startServer();
