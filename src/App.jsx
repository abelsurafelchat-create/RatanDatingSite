import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/RegisterNew.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import Matches from './pages/Matches.jsx';
import Chat from './pages/Chat.jsx';
import RandomCall from './pages/RandomCall.jsx';
import RandomVideoCall from './pages/RandomVideoCall.jsx';
import Admin from './pages/Admin.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
              <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/random-call" element={<PrivateRoute><RandomCall /></PrivateRoute>} />
              <Route path="/video-call" element={<PrivateRoute><RandomVideoCall /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
