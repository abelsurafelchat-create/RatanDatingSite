import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';
import { SOCKET_URL } from '../config.js';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  console.log('🔧 SocketProvider initialized');
  console.log('👤 Current user:', user ? `ID: ${user.id}, Name: ${user.full_name}` : 'No user');
  console.log('🔑 Token available:', !!token);

  useEffect(() => {
    console.log('🔄 SocketProvider useEffect triggered');
    console.log('👤 User state:', user);
    console.log('🔑 Token state:', token);
    
    if (user && token) {
      console.log('🔌 Attempting socket connection...');
      console.log('🌐 Socket URL:', SOCKET_URL);
      console.log('👤 User ID:', user.id);
      console.log('🔑 Token present:', !!token);
      
      try {
        console.log('📦 Creating socket.io instance...');
        const newSocket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true,
          autoConnect: true,
        });
        console.log('✅ Socket.io instance created successfully');

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected successfully');
        console.log('👤 Authenticating user:', user.id, user.full_name);
        setConnected(true);
        newSocket.emit('authenticate', user.id);
        console.log('✅ Authentication event sent for user:', user.id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setConnected(false);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        if (user?.id) {
          newSocket.emit('authenticate', user.id);
        }
      });

      // Listen for authentication confirmation
      newSocket.on('authenticated', (data) => {
        console.log('🎉 Authentication confirmed by server:', data);
      });

      setSocket(newSocket);

      // Update last_seen every 30 seconds
      const updateLastSeen = async () => {
        try {
          await api.post('/video/update-last-seen');
        } catch (error) {
          console.error('Failed to update last seen:', error);
        }
      };

      // Initial update
      updateLastSeen();
      
      // Set interval for updates
      const lastSeenInterval = setInterval(updateLastSeen, 30000);

      return () => {
        clearInterval(lastSeenInterval);
        newSocket.close();
      };
      } catch (error) {
        console.error('❌ Failed to create socket connection:', error);
      }
    } else {
      console.log('⚠️ User or token not available, skipping socket connection');
    }
  }, [user, token]);

  const value = {
    socket,
    connected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
