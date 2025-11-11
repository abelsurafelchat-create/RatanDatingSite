import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, MessageCircle, Video, Shield, Sparkles, X, Eye, EyeOff, ChevronDown, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api.js';

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationType, setRegistrationType] = useState('dating'); // 'dating' or 'marriage'
  const [showCasteDropdown, setShowCasteDropdown] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    caste: '',
    profilePhoto: '',
    registrationType: 'dating'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const casteOptions = [
    'Prefer not to say',
    'Brahmin',
    'Kshatriya',
    'Vaishya',
    'Shudra',
    'Adivasis',
    'Dalits',
    'Agrawal',
    'Bania',
    'Chamar',
    'Jat',
    'Kayastha',
    'Koli',
    'Kurmi',
    'Maratha',
    'Meghwal',
    'Namasudra',
    'Rajput',
    'Santhal (ST)',
    'Sikhligar',
    'Thevar',
    'Vellalar',
    'Yadav'
  ];

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Close caste dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCasteDropdown && !event.target.closest('.caste-dropdown-container')) {
        setShowCasteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCasteDropdown]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({ ...formData, profilePhoto: base64String });
      setPhotoPreview(base64String);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData({ ...formData, profilePhoto: '' });
    setPhotoPreview(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate('/home');
        } else {
          setError(result.error);
        }
      } else {
        const result = await register({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          phone_number: formData.phoneNumber,
          caste: formData.caste,
          profile_photo: formData.profilePhoto,
          registration_type: registrationType
        });
        if (result.success) {
          navigate('/home');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Find Your Match",
      description: "Connect with compatible singles based on your preferences"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Calls",
      description: "Meet face-to-face with random video calls, just like Omegle"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Real-time Chat",
      description: "Send text, voice messages, and photos instantly"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safe & Secure",
      description: "Your privacy and safety are our top priorities"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Matches Made" },
    { number: "1M+", label: "Messages Sent" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-xl transform group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              IndiDate
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsLogin(true);
                setShowAuthModal(true);
              }}
              className="px-6 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setShowAuthModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">India's #1 Dating Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Find Your
              </span>
              <br />
              <span className="text-gray-800">Perfect Match</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Connect with like-minded singles, chat instantly, and discover meaningful relationships. 
              Your journey to love starts here! 💕
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setIsLogin(false);
                  setShowAuthModal(true);
                }}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                Start Dating Now
                <Heart className="w-5 h-5 group-hover:fill-white transition-all" />
              </button>
              
              <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-bold text-lg hover:shadow-xl transition-all border-2 border-gray-200">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-3xl blur-3xl opacity-30"></div>
            
            {/* Dating Illustration Image */}
            <img
              src="/virtualrelationship.png"
              alt="Find Your Perfect Match"
              className="relative z-10 w-full rounded-3xl shadow-2xl"
            />
            
            {/* Floating Hearts Animation */}
            <div className="absolute top-10 right-10 animate-bounce-slow">
              <Heart className="w-12 h-12 text-pink-500 fill-pink-500 opacity-80" />
            </div>
            <div className="absolute bottom-20 left-10 animate-bounce-slow animation-delay-1000">
              <Heart className="w-8 h-8 text-purple-500 fill-purple-500 opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Why Choose <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">IndiDate</span>?
          </h2>
          <p className="text-xl text-gray-600">Everything you need to find your perfect match</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Love?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of singles who have found their perfect match on IndiDate. 
            Your soulmate is waiting! 💕
          </p>
          <button
            onClick={() => {
              setIsLogin(false);
              setShowAuthModal(true);
            }}
            className="px-12 py-5 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3"
          >
            Join Free Today
            <Sparkles className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            <span className="font-semibold text-gray-800">IndiDate</span>
          </div>
          <p className="text-sm">© 2024 IndiDate. All rights reserved. Made with ❤️ in India</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl max-w-md w-full min-h-screen sm:min-h-0 sm:my-8 animate-slide-up flex flex-col max-h-screen sm:max-h-[95vh]">
            {/* Modal Header with Logo - Sticky */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-500 to-purple-600 p-4 sm:p-6 rounded-t-none sm:rounded-t-3xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl">
                    <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                  </div>
                  <span className="text-2xl font-bold text-white">IndiDate</span>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome Back!' : 'Find Your Perfect Match'}
              </h2>
              <p className="text-white/90 mt-2">
                {isLogin ? 'Sign in to continue your journey' : 'Join thousands of happy couples'}
              </p>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* Login/Register Toggle */}
              <div className="px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    isLogin
                      ? 'bg-white text-pink-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    !isLogin
                      ? 'bg-white text-pink-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

              {/* Registration Type Tabs (Only for Sign Up) */}
              {!isLogin && (
                <div className="px-4 sm:px-6 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">I'm looking for:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationType('dating')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      registrationType === 'dating'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">💕</div>
                      <div className={`font-semibold ${
                        registrationType === 'dating' ? 'text-pink-600' : 'text-gray-700'
                      }`}>
                        Dating
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Casual relationships</div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRegistrationType('marriage')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      registrationType === 'marriage'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">💍</div>
                      <div className={`font-semibold ${
                        registrationType === 'marriage' ? 'text-purple-600' : 'text-gray-700'
                      }`}>
                        Marriage
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Serious commitment</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

              {/* Modal Body */}
              <div className="px-4 sm:px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    {/* Profile Photo Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span>Profile Photo</span>
                        <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      
                      {photoPreview ? (
                        <div className="relative inline-block">
                          <img 
                            src={photoPreview} 
                            alt="Profile preview" 
                            className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-2 -right-2 p-1 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-pink-600"
                        >
                          <Camera className="w-5 h-5" />
                          <span>Upload Photo</span>
                        </button>
                      )}
                      
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-2">Max 5MB. JPG, PNG supported.</p>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span>Full Name</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Email Address</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Password</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all pr-12 text-base"
                      placeholder="Enter password (min 6 characters)"
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                  )}
                </div>

                {!isLogin && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span>Date of Birth</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base"
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span>Gender</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span>Phone Number</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base"
                        placeholder="+91 1234567890"
                        pattern="[0-9+\s-]+"
                      />
                    </div>

                    {/* Caste - Custom Dropdown */}
                    <div className="relative caste-dropdown-container">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span>Caste</span>
                        <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      
                      {/* Custom Dropdown Button */}
                      <button
                        type="button"
                        onClick={() => setShowCasteDropdown(!showCasteDropdown)}
                        className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base text-left flex items-center justify-between bg-white"
                      >
                        <span className={formData.caste ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.caste || 'Prefer not to say'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCasteDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Custom Dropdown Menu */}
                      {showCasteDropdown && (
                        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {casteOptions.map((option, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, caste: option === 'Prefer not to say' ? '' : option });
                                setShowCasteDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors ${
                                (formData.caste === option || (!formData.caste && option === 'Prefer not to say'))
                                  ? 'bg-pink-50 text-pink-600 font-semibold'
                                  : 'text-gray-700'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                          <p className="font-semibold text-pink-600 mb-1">Your privacy matters</p>
                          <p className="text-xs text-gray-600">We'll never share your personal information. You must be 18+ to register.</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 sm:py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-base sm:text-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      {isLogin ? (
                        <>
                          <span>Sign In</span>
                          <Heart className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <Sparkles className="w-5 h-5" />
                        </>
                      )}
                    </>
                  )}
                </button>
              </form>

              {/* Social proof for registration */}
              {!isLogin && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Join <span className="font-semibold text-pink-600">10,000+</span> happy members</span>
                  </div>
                </div>
              )}

              {/* Terms for registration */}
              {!isLogin && (
                <p className="mt-4 text-xs text-center text-gray-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-pink-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-pink-600 hover:underline">Privacy Policy</a>
                </p>
              )}
              </div>
            </div>
            {/* End of Scrollable Content */}
          </div>
        </div>
      )}

      <style jsx>{`
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }

        /* Ensure dropdown options appear below sticky header */
        select {
          appearance: auto;
        }
        
        /* Limit dropdown menu height on mobile */
        @media (max-width: 640px) {
          select option {
            max-height: 40px;
          }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
