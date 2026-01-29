// /app/usersDashboard/settings/page.js
"use client";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  CreditCard,
  User,
  Globe,
  Lock,
  Moon,
  Database,
  Download,
  Trash2,
  Key,
  Smartphone,
  Mail,
  Save,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  LogOut,
  KeyRound,
  Smartphone as SmartphoneIcon,
  Mail as MailIcon,
  ShieldCheck,
  DatabaseBackup,
  UserCog,
  Palette,
  Volume2,
  Calendar,
  FileText,
  Eye,
  EyeOff,
  Clock,
  UserX,
  Sun
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext'; // ✅ Import useAuth

export default function Settings() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshProfile } = useAuth(); // ✅ Use AuthContext
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Remove userProfile state - use AuthContext user instead
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      voice: false,
      weeklyDigest: true,
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
      autoDelete: 180,
      dataExport: true,
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      density: 'comfortable',
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 30,
    },
  });
  
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [activeSection, setActiveSection] = useState("notifications");
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [theme, setTheme] = useState('light');

  // Load user settings
  useEffect(() => {
    if (!authLoading) {
      loadSettings();
    }
  }, [authLoading]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // ✅ User data is already in AuthContext - no separate API call needed
      
      // Load user-specific settings from localStorage or API
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      // Load theme preference
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      setSettings(prev => ({
        ...prev,
        appearance: { ...prev.appearance, theme: savedTheme }
      }));
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const settingsResponse = await api.getSettings();
      if (settingsResponse.success) {
        console.log('System settings loaded:', settingsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load system settings:', error);
    }
  };

  const handleSettingChange = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    if (category === 'appearance' && key === 'theme') {
      setTheme(value);
      localStorage.setItem('theme', value);
      document.documentElement.classList.toggle('dark', value === 'dark');
    }
    
    toast.success('Setting updated');
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      // Save notification preferences
      const notificationData = {
        email_notifications: settings.notifications.email,
        push_notifications: settings.notifications.push,
        voice_alerts: settings.notifications.voice,
        weekly_digest: settings.notifications.weeklyDigest
      };
      
      // Save security settings
      const securityData = {
        two_factor_enabled: settings.security.twoFactor,
        login_alerts: settings.security.loginAlerts,
        session_timeout_minutes: settings.security.sessionTimeout
      };
      
      // Call API to save settings
      // await api.updateUserSettings({ notifications: notificationData, security: securityData });
      
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      toast.success('All settings saved successfully');
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      setShowConfirmModal(null);
      
      const date = new Date().toISOString().split('T')[0];
      
      // Prepare data to export
      const exportData = {
        exportedAt: new Date().toISOString(),
        userProfile: user, // ✅ Use user from AuthContext
        settings,
        connectedDevices
      };
      
      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `suretalk-data-export-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      setShowConfirmModal(null);
      
      // Note: This is a destructive action
      toast.success('Account deletion request submitted. Check your email for confirmation.');
      
      // Use logout from AuthContext
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Account deletion failed:', error);
      toast.error('Failed to process account deletion');
      setSaving(false);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    try {
      // await api.revokeDevice(deviceId);
      
      setConnectedDevices(prev => prev.filter(device => device.id !== deviceId));
      toast.success('Device removed successfully');
      
    } catch (error) {
      console.error('Failed to remove device:', error);
      toast.error('Failed to remove device');
    }
  };

  const handleChangePassword = async () => {
    router.push('/usersDashboard/settings/change-password');
  };

  const handleUpdateProfile = async () => {
    router.push('/usersDashboard/settings/profile');
  };

  const handleBilling = async () => {
    router.push('/usersDashboard/billing');
  };

  // Mock connected devices
  useEffect(() => {
    if (!authLoading) {
      const devices = [
        { 
          id: '1', 
          name: "Chrome on Windows", 
          type: "browser",
          location: "New York, US", 
          lastActive: new Date().toISOString(),
          current: true
        },
        { 
          id: '2', 
          name: "Safari on iPhone", 
          type: "mobile",
          location: "Home", 
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          current: false
        },
      ];
      setConnectedDevices(devices);
    }
  }, [authLoading]);

  // ✅ Show loading while auth loads
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass rounded-2xl p-6 sticky top-24">
            <nav className="space-y-2">
              {[
                { icon: Bell, label: "Notifications", id: "notifications" },
                { icon: Shield, label: "Privacy", id: "privacy" },
                { icon: Palette, label: "Appearance", id: "appearance" },
                { icon: Lock, label: "Security", id: "security" },
                { icon: UserCog, label: "Profile", id: "profile" },
                { icon: CreditCard, label: "Billing", id: "billing" },
                { icon: Database, label: "Data Management", id: "data" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors group ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${
                      activeSection === item.id ? 'text-white' : 'text-gray-500 group-hover:text-brand-500'
                    }`} />
                    <span className={`font-medium ${
                      activeSection === item.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 
                         bg-gradient-to-r from-brand-500 to-accent-500 text-white 
                         rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Settings Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-8"
        >
           {/* Notifications Settings */}
           {activeSection === "notifications" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h2>
              </div>
              <div className="space-y-4">
                {[
                  { key: "email", label: "Email Notifications", description: "Receive updates via email", icon: MailIcon },
                  { key: "push", label: "Push Notifications", description: "Get browser push notifications", icon: Bell },
                  { key: "voice", label: "Voice Alerts", description: "Phone call alerts for important events", icon: Volume2 },
                  { key: "weeklyDigest", label: "Weekly Digest", description: "Weekly summary of your activity", icon: Calendar },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{item.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('notifications', item.key, !settings.notifications[item.key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications[item.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === "privacy" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Privacy</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Profile Visibility</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to see your profile</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('privacy', 'profileVisible', !settings.privacy.profileVisible)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.profileVisible ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Activity Visibility</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Show your activity to others</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('privacy', 'activityVisible', !settings.privacy.activityVisible)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.activityVisible ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.activityVisible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Trash2 className="w-5 h-5 text-gray-500" />
                    <h3 className="font-medium text-gray-800 dark:text-white">Auto-delete Old Messages</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Automatically delete voice messages older than:
                  </p>
                  <div className="flex gap-2">
                    {[30, 90, 180, 365].map((days) => (
                      <button
                        key={days}
                        onClick={() => handleSettingChange('privacy', 'autoDelete', days)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          settings.privacy.autoDelete === days
                            ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeSection === "appearance" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Appearance</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3">Theme</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: SettingsIcon },
                    ].map((themeOption) => (
                      <button
                        key={themeOption.id}
                        onClick={() => handleSettingChange('appearance', 'theme', themeOption.id)}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                          settings.appearance.theme === themeOption.id
                            ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-900/20 dark:to-accent-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-brand-500'
                        }`}
                      >
                        <themeOption.icon className={`w-6 h-6 ${
                          settings.appearance.theme === themeOption.id ? 'text-brand-500' : 'text-gray-500'
                        }`} />
                        <span className="font-medium text-gray-800 dark:text-white">{themeOption.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3">Font Size</h3>
                  <div className="flex gap-2">
                    {[
                      { id: 'small', label: 'Small' },
                      { id: 'medium', label: 'Medium' },
                      { id: 'large', label: 'Large' },
                    ].map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleSettingChange('appearance', 'fontSize', size.id)}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                          settings.appearance.fontSize === size.id
                            ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3">Density</h3>
                  <div className="flex gap-2">
                    {[
                      { id: 'compact', label: 'Compact' },
                      { id: 'comfortable', label: 'Comfortable' },
                      { id: 'spacious', label: 'Spacious' },
                    ].map((density) => (
                      <button
                        key={density.id}
                        onClick={() => handleSettingChange('appearance', 'density', density.id)}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                          settings.appearance.density === density.id
                            ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {density.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === "security" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Security</h2>
              </div>
              <div className="space-y-6">
                {/* Change Password */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <KeyRound className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">Password</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last changed: 2 weeks ago</p>
                      </div>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('security', 'twoFactor', !settings.security.twoFactor)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security.twoFactor ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Login Alerts */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Login Alerts</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new logins</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('security', 'loginAlerts', !settings.security.loginAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security.loginAlerts ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Session Timeout */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <h3 className="font-medium text-gray-800 dark:text-white">Session Timeout</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Automatically log out after inactivity:
                  </p>
                  <div className="flex gap-2">
                    {[15, 30, 60, 120].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => handleSettingChange('security', 'sessionTimeout', minutes)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          settings.security.sessionTimeout === minutes
                            ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connected Devices */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <SmartphoneIcon className="w-5 h-5 text-gray-500" />
                    <h3 className="font-medium text-gray-800 dark:text-white">Connected Devices</h3>
                  </div>
                  <div className="space-y-3">
                    {connectedDevices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">{device.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {device.location} • Last active: {new Date(device.lastActive).toLocaleDateString()}
                              {device.current && " • Current device"}
                            </p>
                          </div>
                        </div>
                        {!device.current && (
                          <button 
                            onClick={() => handleRemoveDevice(device.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

           {/* Profile Settings - UPDATED to use AuthContext */}
           {activeSection === "profile" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserCog className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Profile Settings</h2>
              </div>
              {user ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">Personal Information</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.full_name} • {user.email} {/* ✅ Use user from context */}
                        </p>
                      </div>
                      <button
                        onClick={handleUpdateProfile}
                        className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">Subscription Tier</h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                        user.subscription_tier === 'LEGACY_VAULT_PREMIUM' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                        user.subscription_tier === 'ESSENTIAL' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                        'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
                      }`}>
                        {user.subscription_tier}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">Account Created</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">Last Login</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">Storage Limit</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {user.storage_limit_gb || 5} GB
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading profile information...</p>
                </div>
              )}
            </div>
          )}

          {/* Billing Settings */}
          {activeSection === "billing" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Billing & Subscription</h2>
              </div>
              <div className="space-y-4">
                <button
                  onClick={handleBilling}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                           dark:border-gray-600 hover:border-brand-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Manage Subscription</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Upgrade, downgrade, or cancel your plan</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push('/usersDashboard/billing/history')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                           dark:border-gray-600 hover:border-brand-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Billing History</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">View and download past invoices</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push('/usersDashboard/billing/payment-methods')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                           dark:border-gray-600 hover:border-brand-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Payment Methods</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your saved payment methods</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeSection === "data" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Data Management</h2>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => setShowConfirmModal('export')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                           dark:border-gray-600 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Export All Data</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download all your voice notes and data</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push('/usersDashboard/settings/data-backup')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                           dark:border-gray-600 hover:border-green-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DatabaseBackup className="w-5 h-5 text-green-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Backup Settings</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Configure automatic data backups</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => setShowConfirmModal('delete')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                           dark:border-gray-600 hover:border-red-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserX className="w-5 h-5 text-red-500" />
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Delete Account</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all data</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

       {/* Confirmation Modals */}
       {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            {showConfirmModal === 'export' ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Download className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Export Data</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will export all your data including voice notes, contacts, and settings. 
                  The download may take a few minutes.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportData}
                    disabled={exportLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {exportLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      'Export Data'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <UserX className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Delete Account</h3>
                </div>
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    This action <span className="font-bold text-red-600 dark:text-red-400">cannot be undone</span>. 
                    All your data including voice notes, contacts, and settings will be permanently deleted.
                  </p>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-300">Warning</h4>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          This action is irreversible. You will lose access to all your voice messages and data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Activity icon component
function Activity(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

