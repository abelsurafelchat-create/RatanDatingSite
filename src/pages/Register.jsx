import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Heart, Mail, Lock, User, Calendar, MapPin, Phone, AlertCircle, Camera, X, Eye, EyeOff, Shield, Sparkles, ChevronDown } from 'lucide-react';

const CASTES = [
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

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    registrationType: 'dating',
    caste: '',
    phone: '',
    location: '',
    profilePhoto: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCasteDropdown, setShowCasteDropdown] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const photoInputRef = useRef(null);
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle URL parameter for registration type
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'dating' || typeParam === 'marriage') {
      setFormData(prev => ({ ...prev, registrationType: typeParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Convert to Base64
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    console.log('Registering user...');
    console.log('Profile photo included:', formData.profilePhoto ? 'Yes' : 'No');
    if (formData.profilePhoto) {
      console.log('Profile photo length:', formData.profilePhoto.length);
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      registrationType: formData.registrationType,
      caste: formData.caste,
      phone: formData.phone,
      location: formData.location,
      profilePhoto: formData.profilePhoto,
    });

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Join IndiDate</h1>
            <p className="text-gray-600 mt-2">Find your perfect match today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I'm looking for
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, registrationType: 'dating' })}
                    className={`p-4 border-2 rounded-lg font-semibold transition ${
                      formData.registrationType === 'dating'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Dating
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, registrationType: 'marriage' })}
                    className={`p-4 border-2 rounded-lg font-semibold transition ${
                      formData.registrationType === 'marriage'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Marriage
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {photoPreview && (
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">Max 5MB. JPG, PNG, GIF accepted.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caste / Community (Optional)
                </label>
                <select
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Select caste</option>
                  {CASTES.map((caste) => (
                    <option key={caste} value={caste}>
                      {caste}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
