import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Save, X, Plus, Trash2, Camera, User as UserIcon, MapPin, Calendar, Phone, Mail, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const CASTES = [
  'Brahmin',
  'Kshatriya',
  'Vaishya',
  'Shudra',
  'Dalit / Scheduled Caste',
  'Scheduled Tribe',
  'Other Backward Class (OBC)',
  'Prefer not to say',
  'Other',
];

const ProfileNew = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile');
      setProfile(response.data);
      setFormData(response.data);
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/profile', {
        ...formData,
        photos: photos,
      });
      
      setProfile({ ...formData, photos });
      setIsEditing(false);
      await fetchUserProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim() && photos.length < 6) {
      setPhotos(prev => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetMainPhoto = (photoUrl) => {
    setFormData(prev => ({
      ...prev,
      profile_photo: photoUrl,
    }));
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                    setPhotos(profile.photos || []);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-600">
              <div className="absolute -bottom-16 left-8">
                <div className="relative w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {formData.profile_photo ? (
                    <img
                      src={formData.profile_photo}
                      alt={formData.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-20 px-8 pb-8">
              {/* Basic Info */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleChange}
                        className="text-3xl font-bold text-gray-900 border-b-2 border-primary-500 focus:outline-none"
                      />
                    ) : (
                      <h2 className="text-3xl font-bold text-gray-900">{profile.full_name}</h2>
                    )}
                    <p className="text-gray-600 mt-1">
                      {calculateAge(profile.date_of_birth)} years old • {profile.gender} • {profile.registration_type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Gallery */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photo Gallery ({photos.length}/6)
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSetMainPhoto(photo)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                            title="Set as main photo"
                          >
                            <Heart className={`w-5 h-5 ${formData.profile_photo === photo ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                          </button>
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                            title="Remove photo"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      )}
                      {formData.profile_photo === photo && (
                        <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && photos.length < 6 && (
                    <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <div className="text-center p-4">
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Add Photo</p>
                        <input
                          type="text"
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          placeholder="Photo URL"
                          className="w-full px-2 py-1 text-xs border rounded mb-2"
                        />
                        <button
                          onClick={handleAddPhoto}
                          className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {photos.length === 0 && !isEditing && (
                  <p className="text-gray-500 text-center py-8">No photos added yet</p>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth?.split('T')[0] || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.location || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Caste / Community
                  </label>
                  {isEditing ? (
                    <select
                      name="caste"
                      value={formData.caste || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Caste</option>
                      {CASTES.map((caste) => (
                        <option key={caste} value={caste}>
                          {caste}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.caste || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Gender
                  </label>
                  <p className="text-gray-900 capitalize">{profile.gender}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-8">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  About Me
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell others about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio || 'No bio added yet'}</p>
                )}
              </div>

              {/* Preferences */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Match Preferences</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Preferred Gender
                    </label>
                    {isEditing ? (
                      <select
                        name="preferred_gender"
                        value={formData.preferred_gender || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize">{profile.preferred_gender || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Age Range
                    </label>
                    {isEditing ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          name="min_age"
                          value={formData.min_age || 18}
                          onChange={handleChange}
                          min="18"
                          max="100"
                          className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span>to</span>
                        <input
                          type="number"
                          name="max_age"
                          value={formData.max_age || 50}
                          onChange={handleChange}
                          min="18"
                          max="100"
                          className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span>years</span>
                      </div>
                    ) : (
                      <p className="text-gray-900">
                        {profile.min_age || 18} - {profile.max_age || 50} years
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileNew;
