import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

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

  useEffect(() => {
    if (user && token) {
      const newSocket = io('http://localhost:3001', {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected');
        console.log('👤 Authenticating user:', user.id, user.full_name);
        setConnected(true);
        newSocket.emit('authenticate', user.id);
        console.log('✅ Authentication event sent');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      setSocket(newSocket);

      // Update last_seen every 30 seconds
      const updateLastSeen = async () => {
        try {
          await axios.post('/api/video/update-last-seen');
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
    }
  }, [user, token]);

  const value = {
    socket,
    connected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
