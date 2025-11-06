import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Video, User as UserIcon, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Heart className="w-8 h-8 text-primary-600" fill="currentColor" />
            <h1 className="text-2xl font-bold text-gray-900">IndiDate</h1>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Home"
            >
              <Home className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/matches')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Matches"
            >
              <Heart className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Messages"
            >
              <MessageCircle className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/random-call')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Random Call"
            >
              <Video className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Profile"
            >
              <UserIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Logout"
            >
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
