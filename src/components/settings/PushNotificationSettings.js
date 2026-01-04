"use client";
import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Info,
  Volume2,
  Mail,
  MessageSquare,
  Shield,
  Calendar,
  Send,
  Users,
  Star
} from 'lucide-react';
import { pushManager } from '@/utils/pushManager';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function PushNotificationSettings() {
  const analytics = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [settings, setSettings] = useState({
    scheduledMessages: true,
    messageSent: true,
    legacyVault: true,
    voiceNoteShared: true,
    favorites: true,
    sound: true,
    vibration: true
  });
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setLoading(true);
    
    try {
      const result = await pushManager.initialize();
      setSupported(result.supported);
      setEnabled(result.subscribed);
      
      // Get current permission - safely
      if (typeof window !== 'undefined' && typeof Notification !== 'undefined') {
        setPermission(Notification.permission);
      }
      
      // Load saved settings from localStorage
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePushNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (enabled) {
        const result = await pushManager.disable();
        if (result.success) {
          setEnabled(false);
          analytics.recordEvent('push_notifications_disabled');
        } else {
          throw new Error(result.error);
        }
      } else {
        const result = await pushManager.enable();
        if (result.success) {
          setEnabled(true);
          if (typeof window !== 'undefined' && typeof Notification !== 'undefined') {
            setPermission(Notification.permission);
          }
          analytics.recordEvent('push_notifications_enabled');
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      alert(`Failed to ${enabled ? 'disable' : 'enable'} push notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    
    analytics.recordEvent('notification_setting_changed', {
      setting: key,
      value: value
    });
  };

  const sendTestNotification = async () => {
    try {
      setTestResult({ type: 'loading', message: 'Sending test notification...' });
      
      await pushManager.sendTestNotification();
      
      setTestResult({ 
        type: 'success', 
        message: 'Test notification sent successfully!' 
      });
      
      analytics.recordEvent('test_notification_sent');
      
      // Clear result after 5 seconds
      setTimeout(() => setTestResult(null), 5000);
      
    } catch (error) {
      setTestResult({ 
        type: 'error', 
        message: `Failed to send test: ${error.message}` 
      });
      
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      scheduledMessages: true,
      messageSent: true,
      legacyVault: true,
      voiceNoteShared: true,
      favorites: true,
      sound: true,
      vibration: true
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(defaultSettings));
    
    analytics.recordEvent('notification_settings_reset');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading notification settings...</span>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
              Push Notifications Not Supported
            </h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              Your browser does not support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
              {enabled ? (
                <Bell className="w-6 h-6 text-brand-500" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {enabled ? 'Enabled - Receive browser notifications' : 'Disabled - No notifications will be shown'}
              </p>
            </div>
          </div>
          <button
            onClick={togglePushNotifications}
            disabled={loading || permission === 'denied'}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-700'
            } disabled:opacity-50`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {permission === 'denied' && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              Notifications are blocked in your browser settings. Please enable them to receive push notifications.
            </p>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Notification Types
        </h3>
        
        <div className="space-y-4">
          {[
            {
              key: 'scheduledMessages',
              icon: Calendar,
              title: 'Scheduled Messages',
              description: 'When a message is scheduled to be sent'
            },
            {
              key: 'messageSent',
              icon: Send,
              title: 'Message Sent',
              description: 'When a scheduled message is delivered'
            },
            {
              key: 'legacyVault',
              icon: Shield,
              title: 'Legacy Vault',
              description: 'When a voice note is moved to Legacy Vault'
            },
            {
              key: 'voiceNoteShared',
              icon: Users,
              title: 'Voice Note Shared',
              description: 'When someone shares a voice note with you'
            },
            {
              key: 'favorites',
              icon: Star,
              title: 'Favorites Activity',
              description: 'Updates about your favorite voice notes'
            }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) => updateSetting(item.key, e.target.checked)}
                  disabled={!enabled}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer ${
                  enabled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'
                } peer-checked:bg-brand-500 peer-disabled:opacity-50`}>
                  <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                    settings[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Sound
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Play sound with notifications
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => updateSetting('sound', e.target.checked)}
                disabled={!enabled}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer ${
                enabled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'
              } peer-checked:bg-brand-500 peer-disabled:opacity-50`}>
                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  settings.sound ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Vibration
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vibrate device for notifications
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibration}
                onChange={(e) => updateSetting('vibration', e.target.checked)}
                disabled={!enabled}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer ${
                enabled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'
              } peer-checked:bg-brand-500 peer-disabled:opacity-50`}>
                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  settings.vibration ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Test & Reset */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Testing & Reset
        </h3>
        
        <div className="space-y-4">
          {testResult && (
            <div className={`p-3 rounded-lg ${
              testResult.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : testResult.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.type === 'success' && <Check className="w-4 h-4 text-green-500" />}
                {testResult.type === 'error' && <X className="w-4 h-4 text-red-500" />}
                {testResult.type === 'loading' && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                <span className={`text-sm ${
                  testResult.type === 'success' 
                    ? 'text-green-600 dark:text-green-400'
                    : testResult.type === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {testResult.message}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={sendTestNotification}
              disabled={!enabled || loading}
              className="flex items-center justify-center gap-2 px-4 py-3 
                       border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                       rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 
                       transition-colors disabled:opacity-50"
            >
              <Bell className="w-4 h-4" />
              Send Test Notification
            </button>
            
            <button
              onClick={resetToDefaults}
              className="flex items-center justify-center gap-2 px-4 py-3 
                       border-2 border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                       dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Help Info */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">
              About Push Notifications
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Notifications will appear even when the app is closed</li>
              <li>• You can click notifications to open the app</li>
              <li>• Settings are saved to your browser</li>
              <li>• You can disable notifications at any time</li>
              <li>• Test notifications help ensure everything is working</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}