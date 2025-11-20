import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadStoredToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load token:', error);
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await api.get('/profile');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      const { token, user } = data;
      
      await SecureStore.setItemAsync('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Sending registration data');
      console.log('AuthContext: Profile photo included:', userData.profilePhoto ? 'Yes' : 'No');
      
      const data = await api.post('/auth/register', userData);
      const { token, user } = data;
      
      console.log('AuthContext: Registration response received');
      console.log('AuthContext: User profile_photo in response:', user.profile_photo ? 'Yes' : 'No');
      
      await SecureStore.setItemAsync('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
