// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\usersDashboard\settings.js
import Layout from "../../../components/dashboard/Layout";
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
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
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

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <Layout type="user">
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
                { icon: Moon, label: "Appearance", id: "appearance" },
                { icon: Lock, label: "Security", id: "security" },
                { icon: User, label: "Profile", id: "profile" },
                { icon: CreditCard, label: "Billing", id: "billing" },
                { icon: Database, label: "Data Management", id: "data" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 
                           dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-500 group-hover:text-brand-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 
                               bg-gradient-to-r from-brand-500 to-accent-500 text-white 
                               rounded-xl hover:shadow-lg transition-all">
                <Save className="w-4 h-4" />
                Save All Changes
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
          <div id="notifications" className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: "email", label: "Email Notifications", description: "Receive updates via email" },
                { key: "push", label: "Push Notifications", description: "Get browser push notifications" },
                { key: "voice", label: "Voice Alerts", description: "Phone call alerts for important events" },
                { key: "weeklyDigest", label: "Weekly Digest", description: "Weekly summary of your activity" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{item.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
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

          {/* Privacy Settings */}
          <div id="privacy" className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Privacy</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Profile Visibility</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to see your profile</p>
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

              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Auto-delete Old Messages</h3>
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

          {/* Security Settings */}
          <div id="security" className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Security</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
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

              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Session Timeout</h3>
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

              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-3">Connected Devices</h3>
                <div className="space-y-3">
                  {[
                    { name: "iPhone 14 Pro", location: "New York, US", lastActive: "Now" },
                    { name: "MacBook Pro", location: "Home", lastActive: "2 hours ago" },
                    { name: "iPad Air", location: "Office", lastActive: "1 day ago" },
                  ].map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">{device.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {device.location} • Last active: {device.lastActive}
                          </p>
                        </div>
                      </div>
                      <button className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div id="data" className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Data Management</h2>
            </div>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                               dark:border-gray-600 hover:border-brand-500 transition-colors">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Export All Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Download all your voice notes and data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                               dark:border-gray-600 hover:border-red-500 transition-colors">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Delete Account</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}