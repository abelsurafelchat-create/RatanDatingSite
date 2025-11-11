import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext.jsx';
import { useAuth } from './AuthContext.jsx';
import api from '../utils/api.js';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [newMatches, setNewMatches] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      // Listen for new messages
      socket.on('receive_message', (data) => {
        setUnreadMessages(prev => prev + 1);
        addNotification({
          type: 'message',
          title: 'New Message',
          message: `You have a new message`,
          timestamp: new Date(),
        });
      });

      // Listen for new matches
      socket.on('new_match', (data) => {
        setNewMatches(prev => prev + 1);
        addNotification({
          type: 'match',
          title: 'New Match! 💕',
          message: `You matched with ${data.matchedUser?.full_name || 'someone'}!`,
          timestamp: new Date(),
          data: data.matchedUser,
        });
      });

      return () => {
        socket.off('receive_message');
        socket.off('new_match');
      };
    }
  }, [socket, user]);

  const fetchUnreadCounts = async () => {
    try {
      const [messagesRes, matchesRes] = await Promise.all([
        api.get('/chat/unread-count'),
        api.get('/matches/new-count'),
      ]);
      setUnreadMessages(messagesRes.data.count || 0);
      setNewMatches(matchesRes.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 10));
  };

  const clearMessageNotifications = () => {
    setUnreadMessages(0);
  };

  const clearMatchNotifications = () => {
    setNewMatches(0);
  };

  const clearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const value = {
    unreadMessages,
    newMatches,
    notifications,
    clearMessageNotifications,
    clearMatchNotifications,
    clearNotification,
    fetchUnreadCounts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
