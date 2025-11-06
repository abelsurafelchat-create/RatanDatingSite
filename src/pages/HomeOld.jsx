import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, X, MapPin, Briefcase, Video, MessageCircle, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/matches/recommendations');
      setRecommendations(response.data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (swipeType) => {
    if (swiping || currentIndex >= recommendations.length) return;

    setSwiping(true);
    const currentUser = recommendations[currentIndex];

    try {
      const response = await axios.post('/api/matches/swipe', {
        swipedUserId: currentUser.id,
        swipeType,
      });

      if (response.data.isMatch) {
        alert(`🎉 It's a match with ${currentUser.full_name}!`);
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Swipe error:', error);
    } finally {
      setSwiping(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentUser = recommendations[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary-600" fill="currentColor" />
            <h1 className="text-2xl font-bold text-gray-900">IndiDate</h1>
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.registration_type === 'dating' ? 'Find Your Date' : 'Find Your Match'}
          </h2>
          <p className="text-gray-600 mt-1">
            {recommendations.length - currentIndex} profiles available
          </p>
        </div>

        {currentIndex >= recommendations.length ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No more profiles</h3>
            <p className="text-gray-600 mb-6">Check back later for new recommendations</p>
            <button
              onClick={fetchRecommendations}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Refresh
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Profile Image */}
              <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300">
                {currentUser?.profile_photo ? (
                  <img
                    src={currentUser.profile_photo}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-32 h-32 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white">
                    {currentUser?.full_name}, {calculateAge(currentUser?.date_of_birth)}
                  </h3>
                  {currentUser?.location && (
                    <div className="flex items-center gap-2 text-white/90 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{currentUser.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6">
                {currentUser?.bio && (
                  <p className="text-gray-700 mb-4">{currentUser.bio}</p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentUser?.caste && (
                    <div>
                      <p className="text-gray-500">Community</p>
                      <p className="font-semibold text-gray-900">{currentUser.caste}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Looking for</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {currentUser?.registration_type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex items-center justify-center gap-6">
                <button
                  onClick={() => handleSwipe('dislike')}
                  disabled={swiping}
                  className="w-16 h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition disabled:opacity-50 shadow-lg"
                >
                  <X className="w-8 h-8 text-red-500" />
                </button>
                <button
                  onClick={() => handleSwipe('like')}
                  disabled={swiping}
                  className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center hover:from-primary-600 hover:to-primary-700 transition disabled:opacity-50 shadow-lg"
                >
                  <Heart className="w-10 h-10 text-white" fill="white" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Home;
