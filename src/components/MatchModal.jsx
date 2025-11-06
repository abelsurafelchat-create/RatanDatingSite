import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MatchModal = ({ isOpen, onClose, matchedUser, currentUser }) => {
  const navigate = useNavigate();

  const handleSendMessage = () => {
    onClose();
    navigate('/chat', { state: { userId: matchedUser?.id } });
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && matchedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-200/30 to-pink-200/30 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-200/30 to-red-200/30 rounded-full blur-3xl"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Title with Animation */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="inline-block mb-4"
                >
                  <Sparkles className="w-16 h-16 text-primary-600 mx-auto" fill="currentColor" />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  It's a Match!
                </h2>
                <p className="text-gray-600 text-lg">
                  You and {matchedUser.full_name} liked each other
                </p>
              </motion.div>

              {/* Profile Cards */}
              <div className="flex items-center justify-center gap-4 mb-8">
                {/* Current User */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                    {currentUser?.profile_photo ? (
                      <img
                        src={currentUser.profile_photo}
                        alt={currentUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold">
                        {currentUser?.full_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                    <p className="text-sm font-semibold text-gray-800">You</p>
                  </div>
                </motion.div>

                {/* Heart Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Heart className="w-12 h-12 text-primary-600" fill="currentColor" />
                  </motion.div>
                </motion.div>

                {/* Matched User */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                    {matchedUser.profile_photo ? (
                      <img
                        src={matchedUser.profile_photo}
                        alt={matchedUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white text-4xl font-bold">
                        {matchedUser.full_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg">
                    <p className="text-sm font-semibold text-gray-800">{matchedUser.full_name}</p>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={handleSendMessage}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send Message
                </button>
                <button
                  onClick={handleKeepSwiping}
                  className="flex-1 bg-white text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:shadow-lg transition-all border-2 border-gray-200"
                >
                  Keep Swiping
                </button>
              </motion.div>
            </div>

            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: Math.random() * 100 + '%', opacity: 1 }}
                  animate={{
                    y: '100vh',
                    opacity: 0,
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                  }}
                  className="absolute"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={['#ef4444', '#ec4899', '#f97316'][Math.floor(Math.random() * 3)]}
                    style={{ color: ['#ef4444', '#ec4899', '#f97316'][Math.floor(Math.random() * 3)] }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;
