import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { Heart, X, MapPin, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import MatchModal from '../components/MatchModal.jsx';

const HomeNew = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await api.get('/matches/recommendations');
      setRecommendations(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= recommendations.length) return;

    const currentUser = recommendations[currentIndex];
    const swipeType = direction === 'right' ? 'like' : 'dislike';

    try {
      const data = await api.post('/matches/swipe', {
        swipedUserId: currentUser.id,
        swipeType,
      });

      if (data.isMatch) {
        setMatchedUser(currentUser);
        setShowMatchModal(true);
      }

      setCurrentIndex(prev => prev + 1);
      setCurrentPhotoIndex(0);
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      handleSwipe('right');
    } else if (info.offset.x < -100) {
      handleSwipe('left');
    }
  };

  const currentUser = recommendations[currentIndex];
  const userPhotos = currentUser?.photos?.length > 0 
    ? currentUser.photos 
    : currentUser?.profile_photo 
    ? [currentUser.profile_photo] 
    : [];

  const nextPhoto = () => {
    if (currentPhotoIndex < userPhotos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Finding perfect matches for you...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-md mx-auto px-4">
          {currentIndex < recommendations.length ? (
            <div className="relative">
              {/* Card Stack */}
              <AnimatePresence>
                <motion.div
                  key={currentIndex}
                  style={{ x, rotate, opacity }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                  className="relative bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                >
                  {/* Photo Gallery */}
                  <div className="relative h-[500px]">
                    {userPhotos.length > 0 ? (
                      <>
                        <img
                          src={userPhotos[currentPhotoIndex]}
                          alt={currentUser.full_name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Photo Navigation */}
                        {userPhotos.length > 1 && (
                          <>
                            {/* Dots Indicator */}
                            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1">
                              {userPhotos.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-1 rounded-full transition-all ${
                                    idx === currentPhotoIndex
                                      ? 'w-8 bg-white'
                                      : 'w-1 bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Navigation Buttons */}
                            {currentPhotoIndex > 0 && (
                              <button
                                onClick={prevPhoto}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition"
                              >
                                <ChevronLeft className="w-6 h-6 text-gray-800" />
                              </button>
                            )}
                            {currentPhotoIndex < userPhotos.length - 1 && (
                              <button
                                onClick={nextPhoto}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition"
                              >
                                <ChevronRight className="w-6 h-6 text-gray-800" />
                              </button>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white text-9xl font-bold">
                          {currentUser.full_name?.[0]}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* User Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-3xl font-bold mb-2">
                      {currentUser.full_name}, {currentUser.age}
                    </h2>
                    
                    {currentUser.location && (
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{currentUser.location}</span>
                      </div>
                    )}

                    {currentUser.bio && (
                      <p className="text-sm text-white/90 line-clamp-2 mb-4">
                        {currentUser.bio}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {currentUser.caste && (
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                          {currentUser.caste}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs capitalize">
                        {currentUser.registration_type}
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs capitalize">
                        {currentUser.gender}
                      </span>
                    </div>
                  </div>

                  {/* Info Button */}
                  <button
                    onClick={() => navigate(`/profile/${currentUser.id}`)}
                    className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
                  >
                    <Info className="w-5 h-5 text-gray-800" />
                  </button>
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex justify-center gap-6 mt-8">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition border-2 border-gray-200"
                >
                  <X className="w-8 h-8 text-red-500" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe('right')}
                  className="w-20 h-20 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition"
                >
                  <Heart className="w-10 h-10 text-white" fill="white" />
                </motion.button>
              </div>

              {/* Swipe Hint */}
              <p className="text-center text-gray-500 text-sm mt-4">
                Swipe or use buttons to like/pass
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No More Profiles</h2>
              <p className="text-gray-600 mb-6">
                Check back later for new recommendations!
              </p>
              <button
                onClick={fetchRecommendations}
                className="px-6 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Match Modal */}
      <MatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        matchedUser={matchedUser}
        currentUser={user}
      />
    </div>
  );
};

export default HomeNew;
