import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { MessageCircle, MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [likes, setLikes] = useState([]);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' or 'likes'
  const [loading, setLoading] = useState(true);
  const [photoIndexes, setPhotoIndexes] = useState({});
  const navigate = useNavigate();
  const { clearMatchNotifications } = useNotifications();

  useEffect(() => {
    fetchMatches();
    fetchLikes();
    clearMatchNotifications();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await api.get('/matches/list');
      console.log('Matches data:', data);
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    try {
      const data = await api.get('/matches/likes');
      console.log('Likes data:', data);
      setLikes(data);
    } catch (error) {
      console.error('Failed to fetch likes:', error);
    }
  };

  const handleChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const nextPhoto = (matchId, photosLength) => {
    setPhotoIndexes(prev => ({
      ...prev,
      [matchId]: Math.min((prev[matchId] || 0) + 1, photosLength - 1)
    }));
  };

  const prevPhoto = (matchId) => {
    setPhotoIndexes(prev => ({
      ...prev,
      [matchId]: Math.max((prev[matchId] || 0) - 1, 0)
    }));
  };

  const getMatchPhotos = (match) => {
    return match.photos?.length > 0 
      ? match.photos 
      : match.profile_photo 
      ? [match.profile_photo] 
      : [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Connections</h1>
            <p className="text-gray-600">Matches and people you've liked</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeTab === 'matches'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Matches ({matches.length})
              </button>
              <button
                onClick={() => setActiveTab('likes')}
                className={`px-6 py-3 rounded-full font-semibold transition ${
                  activeTab === 'likes'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Your Likes ({likes.length})
              </button>
            </div>
          </div>

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <>
              {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-6">Start swiping to find your perfect match!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => {
              const photos = getMatchPhotos(match);
              const currentPhotoIndex = photoIndexes[match.matched_user_id] || 0;
              
              console.log(`Rendering ${match.full_name}:`, {
                photosLength: photos.length,
                currentPhotoIndex,
                showNav: photos.length > 1
              });
              
              return (
              <div
                key={match.matched_user_id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300">
                  {photos.length > 0 ? (
                    <>
                      <img
                        src={photos[currentPhotoIndex]}
                        alt={match.full_name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Photo Navigation */}
                      {photos.length > 1 && (
                        <>
                          {/* Dots Indicator */}
                          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 z-10">
                            {photos.map((_, idx) => (
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
                          <button
                            onClick={() => prevPhoto(match.matched_user_id)}
                            disabled={currentPhotoIndex === 0}
                            className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition z-10 ${
                              currentPhotoIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-800" />
                          </button>
                          
                          <button
                            onClick={() => nextPhoto(match.matched_user_id, photos.length)}
                            disabled={currentPhotoIndex >= photos.length - 1}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition z-10 ${
                              currentPhotoIndex >= photos.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <ChevronRight className="w-5 h-5 text-gray-800" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                    Match!
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {match.full_name}
                    {match.age && <span className="text-gray-600">, {match.age}</span>}
                  </h3>

                  {match.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{match.location}</span>
                    </div>
                  )}

                  {match.bio && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{match.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Matched {format(new Date(match.matched_at), 'MMM d, yyyy')}
                    </p>
                    <button
                      onClick={() => handleChat(match.matched_user_id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
              )}
            </>
          )}

          {/* Likes Tab */}
          {activeTab === 'likes' && (
            <>
              {likes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No likes yet</h3>
                  <p className="text-gray-600 mb-6">Start liking people to see them here!</p>
                  <button
                    onClick={() => navigate('/home')}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Start Swiping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {likes.map((like) => {
                    const photos = like.photos?.length > 0 
                      ? like.photos 
                      : like.profile_photo 
                      ? [like.profile_photo] 
                      : [];
                    const currentPhotoIndex = photoIndexes[like.liked_user_id] || 0;
                    
                    return (
                      <div
                        key={like.liked_user_id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                      >
                        <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300">
                          {photos.length > 0 ? (
                            <>
                              <img
                                src={photos[currentPhotoIndex]}
                                alt={like.full_name}
                                className="w-full h-full object-cover"
                              />
                              {photos.length > 1 && (
                                <>
                                  <button
                                    onClick={() => prevPhoto(like.liked_user_id)}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                                    disabled={currentPhotoIndex === 0}
                                  >
                                    <ChevronLeft className="w-5 h-5 text-gray-800" />
                                  </button>
                                  <button
                                    onClick={() => nextPhoto(like.liked_user_id, photos.length)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                                    disabled={currentPhotoIndex === photos.length - 1}
                                  >
                                    <ChevronRight className="w-5 h-5 text-gray-800" />
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Heart className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold z-10 ${
                            like.is_mutual_match 
                              ? 'bg-green-600 text-white' 
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {like.is_mutual_match ? 'Matched!' : 'Liked'}
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {like.full_name}
                            {like.age && <span className="text-gray-600">, {like.age}</span>}
                          </h3>

                          {like.location && (
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{like.location}</span>
                            </div>
                          )}

                          {like.bio && (
                            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{like.bio}</p>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t">
                            <p className="text-xs text-gray-500">
                              Liked {format(new Date(like.liked_at), 'MMM d, yyyy')}
                            </p>
                            {like.is_mutual_match ? (
                              <button
                                onClick={() => handleChat(like.liked_user_id)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Chat
                              </button>
                            ) : (
                              <div className="text-sm text-gray-500">
                                Waiting for them to like you back
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Matches;
