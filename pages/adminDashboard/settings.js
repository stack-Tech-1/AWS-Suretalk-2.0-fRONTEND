// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\adminDashboard\settings.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon,
  Shield,
  Server,
  Bell,
  Users,
  DollarSign,
  Globe,
  Key,
  Database,
  Cloud,
  AlertTriangle,
  Save,
  RefreshCw,
  CheckCircle,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    system: {
      maintenanceMode: false,
      apiRateLimit: 1000,
      maxFileSize: 50,
      sessionTimeout: 30,
    },
    security: {
      require2FA: false,
      ipWhitelist: false,
      auditLogging: true,
      encryption: 'aes-256',
    },
    notifications: {
      emailAlerts: true,
      slackAlerts: true,
      smsAlerts: false,
      criticalOnly: false,
    },
    billing: {
      autoInvoice: true,
      taxEnabled: true,
      currency: 'USD',
      gracePeriod: 14,
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

  const serviceStatus = [
    { name: 'API Gateway', status: 'operational', uptime: '99.9%' },
    { name: 'Database', status: 'operational', uptime: '99.95%' },
    { name: 'Storage', status: 'degraded', uptime: '98.2%' },
    { name: 'Payment Processing', status: 'operational', uptime: '99.8%' },
    { name: 'Email Service', status: 'operational', uptime: '99.7%' },
    { name: 'SMS Gateway', status: 'maintenance', uptime: '95.4%' },
  ];

  return (
    <Layout type="admin">
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
            System Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure system-wide settings and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass rounded-2xl p-6 sticky top-24">
            <nav className="space-y-2">
              {[
                { icon: Server, label: "System", id: "system" },
                { icon: Shield, label: "Security", id: "security" },
                { icon: Bell, label: "Notifications", id: "notifications" },
                { icon: DollarSign, label: "Billing", id: "billing" },
                { icon: Users, label: "User Management", id: "users" },
                { icon: Database, label: "Database", id: "database" },
                { icon: Cloud, label: "Cloud Services", id: "cloud" },
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
                               rounded-xl hover:shadow-lg transition-all mb-3">
                <Save className="w-4 h-4" />
                Save All Changes
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 
                               border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                               rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 
                               transition-colors">
                <RefreshCw className="w-4 h-4" />
                Reset to Defaults
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
          {/* System Settings */}
          <div id="system" className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">System Configuration</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Maintenance Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable public access</p>
                </div>
                <button
                  onClick={() => handleSettingChange('system', 'maintenanceMode', !settings.system.maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.system.maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.system.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">API Rate Limit</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Requests per minute per user</p>
                <div className="flex gap-2">
                  {[100, 500, 1000, 5000].map((limit) => (
                    <button
                      key={limit}
                      onClick={() => handleSettingChange('system', 'apiRateLimit', limit)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        settings.system.apiRateLimit === limit
                          ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {limit}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Maximum File Size (MB)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Maximum voice recording size</p>
                <div className="flex gap-2">
                  {[10, 25, 50, 100].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSettingChange('system', 'maxFileSize', size)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        settings.system.maxFileSize === size
                          ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {size} MB
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div id="security" className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Security Settings</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Require 2FA for Admin</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Two-factor authentication for all admin users</p>
                </div>
                <button
                  onClick={() => handleSettingChange('security', 'require2FA', !settings.security.require2FA)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security.require2FA ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security.require2FA ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">IP Whitelist</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Restrict admin access to specific IPs</p>
                </div>
                <button
                  onClick={() => handleSettingChange('security', 'ipWhitelist', !settings.security.ipWhitelist)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security.ipWhitelist ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security.ipWhitelist ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Encryption Method</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Data encryption algorithm</p>
                <div className="flex gap-2">
                  {['aes-128', 'aes-256', 'rsa-2048', 'rsa-4096'].map((method) => (
                    <button
                      key={method}
                      onClick={() => handleSettingChange('security', 'encryption', method)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        settings.security.encryption === method
                          ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {method.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Cloud className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Service Status</h2>
            </div>
            <div className="space-y-4">
              {serviceStatus.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      service.status === 'operational' ? 'bg-green-100 dark:bg-green-900/30' :
                      service.status === 'degraded' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {service.status === 'operational' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : service.status === 'degraded' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">{service.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uptime: {service.uptime}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.status === 'operational' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    service.status === 'degraded' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Advanced Settings</h2>
            </div>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                               dark:border-gray-600 hover:border-red-500 transition-colors">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Database Maintenance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Run database optimization and cleanup</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                               dark:border-gray-600 hover:border-yellow-500 transition-colors">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Rotate Encryption Keys</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Generate new encryption keys</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-300 
                               dark:border-gray-600 hover:border-purple-500 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-purple-500" />
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">CDN Configuration</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage content delivery network</p>
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