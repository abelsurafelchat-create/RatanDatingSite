import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, Eye, EyeOff, Shield, Sparkles, ChevronDown, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterNew = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationType, setRegistrationType] = useState('dating');
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
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
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
        const result = await login(loginData.email, loginData.password);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-start sm:items-center justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl max-w-md w-full min-h-screen sm:min-h-0 sm:my-8 flex flex-col max-h-screen sm:max-h-[95vh]">
        {/* Modal Header with Logo - Sticky */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-500 to-purple-600 p-4 sm:p-6 rounded-t-none sm:rounded-t-3xl shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white p-2 rounded-xl">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            </div>
            <span className="text-2xl font-bold text-white">IndiDate</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center">
            {isLogin ? 'Welcome Back!' : 'Find Your Perfect Match'}
          </h2>
          <p className="text-white/90 mt-2 text-center">
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
            {error && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>Email Address</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={isLogin ? loginData.email : formData.email}
                  onChange={(e) => isLogin 
                    ? setLoginData({ ...loginData, email: e.target.value })
                    : setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>Password</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={isLogin ? loginData.password : formData.password}
                    onChange={(e) => isLogin
                      ? setLoginData({ ...loginData, password: e.target.value })
                      : setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base pr-12"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                )}
              </div>

              {!isLogin && (
                <>
                  {/* Date of Birth and Gender */}
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

                  {/* Privacy Notice */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
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

      <style jsx>{`
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
};

export default RegisterNew;
