// /app/usersDashboard/settings/change-password/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { api } from "@/utils/api";
import Link from "next/link";
import { toast } from '@/components/ui/Toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChangePassword() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('pwd.noMatch'));
      return;
    }

    if (formData.newPassword.length < 8) {
      setError(t('pwd.tooShort'));
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.success) {
        toast.success(t('pwd.success'));
        
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect back to settings
        setTimeout(() => {
          router.push('/usersDashboard/settings');
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setError(error.message || t('pwd.error'));
      toast.error(error.message || t('pwd.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
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
              {t('pwd.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('pwd.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('pwd.current')}
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              required
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                       focus:border-transparent transition-all"
              placeholder={t('pwd.currentPlaceholder')}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('pwd.new')}
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              required
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                       focus:border-transparent transition-all"
              placeholder={t('pwd.newPlaceholder')}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t('pwd.minHint')}
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('pwd.confirm')}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                       focus:border-transparent transition-all"
              placeholder={t('pwd.confirmPlaceholder')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
          {formData.newPassword && formData.confirmPassword && (
            <p className={`text-xs mt-2 ${
              formData.newPassword === formData.confirmPassword 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formData.newPassword === formData.confirmPassword 
                ? `✓ ${t('pwd.match')}` 
                : `✗ ${t('pwd.noMatchShort')}`}
            </p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">{t('pwd.requirements')}</h3>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('pwd.req1')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('pwd.req2')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('pwd.req3')}
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/usersDashboard/settings"
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-center transition-colors"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('pwd.changing')}
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                {t('pwd.title')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}