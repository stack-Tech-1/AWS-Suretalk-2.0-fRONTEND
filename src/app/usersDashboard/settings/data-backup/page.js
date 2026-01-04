// /app/usersDashboard/settings/data-backup/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DatabaseBackup,
  Calendar,
  Clock,
  Cloud,
  HardDrive,
  Shield,
  Download,
  RefreshCw,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save
} from "lucide-react";
import { api } from "@/utils/api";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function DataBackupSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    includeVoiceNotes: true,
    includeContacts: true,
    includeScheduledMessages: true,
    includeSettings: true,
    encryptBackup: true,
    cloudStorage: true,
    lastBackup: null,
    nextBackup: null
  });

  // Load backup settings
  useEffect(() => {
    loadBackupSettings();
  }, []);

  const loadBackupSettings = async () => {
    try {
      setLoading(true);
      
      // Load from localStorage or API
      const savedSettings = localStorage.getItem('backupSettings');
      if (savedSettings) {
        setBackupSettings(JSON.parse(savedSettings));
      }
      
      // Load last backup info from API
      // const response = await api.getBackupInfo();
      // if (response.success) {
      //   setBackupSettings(prev => ({
      //     ...prev,
      //     lastBackup: response.data.lastBackup,
      //     nextBackup: response.data.nextBackup
      //   }));
      // }
      
    } catch (error) {
      console.error('Failed to load backup settings:', error);
      toast.error('Failed to load backup settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...backupSettings,
      [key]: value
    };
    
    setBackupSettings(newSettings);
    localStorage.setItem('backupSettings', JSON.stringify(newSettings));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to API
      // await api.updateBackupSettings(backupSettings);
      
      // Save to localStorage
      localStorage.setItem('backupSettings', JSON.stringify(backupSettings));
      
      toast.success('Backup settings saved successfully');
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save backup settings');
    } finally {
      setSaving(false);
    }
  };

  const handleManualBackup = async () => {
    try {
      setSaving(true);
      toast.loading('Creating backup...');
      
      // Call backup API
      // const response = await api.createBackup();
      // if (response.success) {
      //   toast.success('Backup created successfully');
      // }
      
      // Simulate backup creation
      setTimeout(() => {
        setBackupSettings(prev => ({
          ...prev,
          lastBackup: new Date().toISOString()
        }));
        toast.success('Backup created successfully');
        setSaving(false);
      }, 2000);
      
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Failed to create backup');
      setSaving(false);
    }
  };

  const handleRestoreBackup = async () => {
    toast('Restore functionality would be implemented here', {
      icon: 'ℹ️'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
              Data Backup Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure automatic backups and data protection
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Backup Status */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DatabaseBackup className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Backup Status</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleManualBackup}
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Backing up...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Backup Now
                  </>
                )}
              </button>
              <button
                onClick={handleRestoreBackup}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Restore
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-gray-800 dark:text-white">Last Backup</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {backupSettings.lastBackup 
                  ? new Date(backupSettings.lastBackup).toLocaleString()
                  : 'Never'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-gray-800 dark:text-white">Next Backup</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {backupSettings.autoBackup 
                  ? backupSettings.nextBackup 
                    ? new Date(backupSettings.nextBackup).toLocaleString()
                    : 'Scheduled'
                  : 'Auto-backup disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Backup Settings */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Auto-Backup Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Auto Backup Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Automatic Backups</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically backup your data on a schedule
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('autoBackup', !backupSettings.autoBackup)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.autoBackup ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {backupSettings.autoBackup && (
              <>
                {/* Backup Frequency */}
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3">Backup Frequency</h3>
                  <div className="flex gap-2">
                    {['daily', 'weekly', 'monthly'].map((frequency) => (
                      <button
                        key={frequency}
                        onClick={() => handleSettingChange('backupFrequency', frequency)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          backupSettings.backupFrequency === frequency
                            ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Backup Time */}
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Backup Time</h3>
                  <input
                    type="time"
                    value={backupSettings.backupTime}
                    onChange={(e) => handleSettingChange('backupTime', e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Choose a time when your system is typically idle
                  </p>
                </div>
              </>
            )}

            {/* Retention Period */}
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white mb-3">Retention Period</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Keep backups for:
              </p>
              <div className="flex gap-2">
                {[7, 30, 90, 365].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleSettingChange('retentionDays', days)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      backupSettings.retentionDays === days
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

        {/* Data to Include */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <HardDrive className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Data to Include</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'includeVoiceNotes', label: 'Voice Notes', description: 'All your recorded voice messages' },
              { key: 'includeContacts', label: 'Contacts', description: 'Your saved contacts and relationships' },
              { key: 'includeScheduledMessages', label: 'Scheduled Messages', description: 'Future scheduled deliveries' },
              { key: 'includeSettings', label: 'Settings', description: 'Account preferences and configurations' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{item.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
                <button
                  onClick={() => handleSettingChange(item.key, !backupSettings[item.key])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    backupSettings[item.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      backupSettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Security</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Encrypt Backups</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Encrypt backup files for added security
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('encryptBackup', !backupSettings.encryptBackup)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.encryptBackup ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.encryptBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <h3 className="font-medium text-gray-800 dark:text-white">Cloud Storage</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Store backups in secure cloud storage
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('cloudStorage', !backupSettings.cloudStorage)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.cloudStorage ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.cloudStorage ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
            onClick={handleSaveSettings}
            disabled={saving}
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
                Save Backup Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}