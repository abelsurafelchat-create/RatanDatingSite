import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api.js';
import { Send, Search, MoreVertical, User as UserIcon, ArrowLeft, Mic, Image as ImageIcon, X, StopCircle, Play, Pause } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { format } from 'date-fns';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

// Custom Voice Player Component
const VoicePlayer = ({ audioSrc, isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1 min-w-[200px]">
      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition ${
          isOwn 
            ? 'bg-white/20 hover:bg-white/30' 
            : 'bg-primary-100 hover:bg-primary-200'
        }`}
      >
        {isPlaying ? (
          <Pause className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-primary-600'}`} fill="currentColor" />
        ) : (
          <Play className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-primary-600'}`} fill="currentColor" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className={`h-1 rounded-full overflow-hidden ${isOwn ? 'bg-white/20' : 'bg-gray-200'}`}>
          <div 
            className={`h-full transition-all ${isOwn ? 'bg-white' : 'bg-primary-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={`flex justify-between text-xs mt-1 ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={audioSrc} preload="metadata" />
    </div>
  );
};

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { clearMessageNotifications } = useNotifications();

  useEffect(() => {
    fetchConversations();
    clearMessageNotifications();
    
    // Fetch messages if userId is in URL on mount
    if (userId) {
      fetchUserAndMessages(userId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserAndMessages(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data) => {
        if (data.senderId === parseInt(userId)) {
          setMessages((prev) => [
            ...prev,
            {
              sender_id: data.senderId,
              message_text: data.message,
              created_at: data.timestamp,
            },
          ]);
        }
        fetchConversations();
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, userId]);

  useEffect(() => {
    console.log('Messages state changed, count:', messages.length);
    console.log('Current messages:', messages);
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await api.get('/chat/conversations');
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAndMessages = async (otherUserId) => {
    try {
      console.log('Fetching user and messages for:', otherUserId);
      
      const [userData, messagesData] = await Promise.all([
        api.get(`/profile/${otherUserId}`),
        api.get(`/chat/messages/${otherUserId}`),
      ]);

      console.log('User data:', userData);
      console.log('Messages received:', messagesData);
      console.log('Number of messages:', messagesData.length);

      setSelectedUser(userData);
      setMessages(messagesData);
      
      console.log('Messages state updated');
      
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to fetch user/messages:', error);
      console.error('Error details:', error.response?.data);
      
      // Set a fallback user object to prevent crashes
      setSelectedUser({
        id: otherUserId,
        full_name: 'User',
        profile_photo: null,
      });
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !userId) return;

    try {
      console.log('Sending message to:', userId);
      console.log('Message:', messageText.trim());
      
      const data = await api.post('/chat/send', {
        receiverId: parseInt(userId),
        messageText: messageText.trim(),
      });

      console.log('Message sent, response:', data);

      // Add message to local state
      const newMessage = {
        ...data,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_photo: user.profile_photo,
      };
      
      setMessages((prev) => [...prev, newMessage]);

      // Emit via socket
      if (socket) {
        socket.emit('send_message', {
          receiverId: parseInt(userId),
          senderId: user.id,
          message: messageText.trim(),
        });
      }

      setMessageText('');
      
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to send message. Please try again.');
    }
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          await sendVoiceMessage(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const sendVoiceMessage = async (audioData) => {
    try {
      const data = await api.post('/chat/send', {
        receiverId: parseInt(userId),
        messageText: '[Voice Message]',
        messageType: 'voice',
        mediaData: audioData,
      });

      const newMessage = {
        ...data,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_photo: user.profile_photo,
      };
      
      setMessages((prev) => [...prev, newMessage]);

      if (socket) {
        socket.emit('send_message', {
          receiverId: parseInt(userId),
          senderId: user.id,
          message: '[Voice Message]',
          messageType: 'voice',
        });
      }

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      alert('Failed to send voice message.');
    }
  };

  // Image handling
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const sendImage = async () => {
    if (!selectedImage) return;

    try {
      const data = await api.post('/chat/send', {
        receiverId: parseInt(userId),
        messageText: '[Photo]',
        messageType: 'image',
        mediaData: selectedImage,
      });

      const newMessage = {
        ...data,
        sender_id: user.id,
        sender_name: user.full_name,
        sender_photo: user.profile_photo,
      };
      
      setMessages((prev) => [...prev, newMessage]);

      if (socket) {
        socket.emit('send_message', {
          receiverId: parseInt(userId),
          senderId: user.id,
          message: '[Photo]',
          messageType: 'image',
        });
      }

      setSelectedImage(null);
      setImagePreview(null);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to send image:', error);
      alert('Failed to send image.');
    }
  };

  const cancelImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectConversation = (otherUserId) => {
    navigate(`/chat/${otherUserId}`);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col bg-gradient-to-br from-pink-50 via-red-50 to-orange-50" style={{ minHeight: '100vh' }}>
      <Header />

      <div className="flex-1 flex bg-white" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <div className={`w-full lg:w-80 border-r border-gray-200 flex flex-col ${userId ? 'hidden lg:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No conversations yet</p>
                <button
                  onClick={() => navigate('/matches')}
                  className="mt-4 text-primary-600 font-semibold hover:text-primary-700"
                >
                  View Matches
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.other_user_id}
                  onClick={() => handleSelectConversation(conv.other_user_id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-b border-gray-100 ${
                    parseInt(userId) === conv.other_user_id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conv.profile_photo ? (
                      <img
                        src={conv.profile_photo}
                        alt={conv.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.full_name}</h3>
                      {conv.last_message_time && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {format(new Date(conv.last_message_time), 'MMM d')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                    {conv.unread_count > 0 && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                          {conv.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!userId ? 'hidden lg:flex' : 'flex'}`}>
          {!userId ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a match to start chatting</p>
              </div>
            </div>
          ) : !selectedUser ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              {selectedUser && (
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/chat')}
                      className="p-2 hover:bg-gray-100 rounded-full transition lg:hidden"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    {selectedUser.profile_photo ? (
                      <img
                        src={selectedUser.profile_photo}
                        alt={selectedUser.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedUser.full_name}</h3>
                      <p className="text-sm text-gray-600">{selectedUser.location}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}

              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 bg-gray-50" 
                style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}
              >
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.sender_id === user.id;
                      return (
                        <div
                          key={index}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            {/* Image Message */}
                            {message.message_type === 'image' && message.media_data && (
                              <img 
                                src={message.media_data} 
                                alt="Shared" 
                                className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(message.media_data, '_blank')}
                              />
                            )}

                            {/* Voice Message */}
                            {message.message_type === 'voice' && message.media_data && (
                              <VoicePlayer audioSrc={message.media_data} isOwn={isOwn} />
                            )}

                            {/* Text Message */}
                            {(!message.message_type || message.message_type === 'text') && (
                              <p className="text-sm">{message.message_text}</p>
                            )}

                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-primary-100' : 'text-gray-500'
                              }`}
                            >
                              {format(new Date(message.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    <button
                      onClick={cancelImage}
                      className="absolute -top-2 -right-2 p-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={sendImage}
                      className="mt-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Send Photo
                    </button>
                  </div>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="mb-3 flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-purple-600 font-medium">Recording... {recordingTime}s</span>
                    <button
                      onClick={stopRecording}
                      className="ml-auto p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700"
                    >
                      <StopCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* Image Upload Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  {/* Voice Record Button */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-full transition ${
                      isRecording 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Chat;
