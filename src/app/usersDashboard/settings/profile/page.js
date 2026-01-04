// /app/usersDashboard/settings/profile/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save
} from "lucide-react";
import { api } from "@/utils/api";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ProfileSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    profileImageUrl: ''
  });
  const [userProfile, setUserProfile] = useState(null);

  // Load user profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getProfile();
      
      if (response.success) {
        const profile = response.data;
        setUserProfile(profile);
        setFormData({
          fullName: profile.full_name || '',
          phone: profile.phone || '',
          profileImageUrl: profile.profile_image_url || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setSaving(true);
      
      const response = await api.updateProfile(formData);
      
      if (response.success) {
        toast.success('Profile updated successfully');
        // Reload profile to get updated data
        await loadProfile();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error.message || 'Failed to update profile');
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      // In production, upload to S3 and get URL
      // For now, create a local URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, profileImageUrl: imageUrl }));
      
      // In production, you would:
      // 1. Get upload URL from backend
      // 2. Upload file to S3
      // 3. Get permanent URL
      // 4. Update profile with permanent URL
      
      toast.success('Image uploaded (preview only - not saved)');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/usersDashboard/settings"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update your personal information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Image */}
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                {formData.profileImageUrl ? (
                  <img
                    src={formData.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <Camera className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the camera icon to upload a new profile picture
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Personal Information
          </h2>
          
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800 dark:text-white">{userProfile?.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Email cannot be changed. Contact support for assistance.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                           focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                           focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Used for voice message delivery and account recovery
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Account Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <h3 className="font-medium text-gray-800 dark:text-white mb-1">Subscription Tier</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                userProfile?.subscription_tier === 'PREMIUM' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                userProfile?.subscription_tier === 'ESSENTIAL' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
              }`}>
                {userProfile?.subscription_tier || 'Loading...'}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <h3 className="font-medium text-gray-800 dark:text-white mb-1">Storage Limit</h3>
              <p className="text-gray-600 dark:text-gray-400">{userProfile?.storage_limit_gb || 0} GB</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <h3 className="font-medium text-gray-800 dark:text-white mb-1">Account Created</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Loading...'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <h3 className="font-medium text-gray-800 dark:text-white mb-1">Last Login</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {userProfile?.last_login ? new Date(userProfile.last_login).toLocaleString() : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/usersDashboard/settings"
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-center transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.fullName}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}