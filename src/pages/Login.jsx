import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Heart, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('dating'); // Add login type state
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-white p-2 rounded-xl">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
              </div>
              <span className="text-2xl font-bold text-white">IndiDate</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center">Welcome Back!</h2>
            <p className="text-white/90 mt-2 text-center">Sign in to continue your journey</p>
          </div>

          <div className="p-8">
            {/* Login Type Tabs */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                Sign in for
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLoginType('dating')}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    loginType === 'dating'
                      ? 'bg-white text-pink-600 shadow-md border-2 border-pink-200'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  💕 Dating
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('marriage')}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    loginType === 'marriage'
                      ? 'bg-white text-pink-600 shadow-md border-2 border-pink-200'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  💍 Marriage
                </button>
              </div>
            </div>

          {error && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-base pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In for {loginType === 'dating' ? 'Dating' : 'Marriage'}</span>
                  {loginType === 'dating' ? (
                    <Heart className="w-5 h-5" />
                  ) : (
                    <span className="text-lg">💍</span>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to={`/register?type=${loginType}`} 
                className="text-pink-600 font-semibold hover:text-purple-600 transition"
              >
                Sign up for {loginType === 'dating' ? 'Dating' : 'Marriage'}
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
