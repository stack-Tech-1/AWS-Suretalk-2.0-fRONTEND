"use client";
import { motion } from "framer-motion";
import {
  Settings, Shield, Lock, Key, Database,
  RefreshCw, Save, AlertTriangle, CheckCircle,
  ArrowLeft, X, ChevronRight, Home,
  Eye, EyeOff, Upload, Download
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/api";
import { Plus } from "lucide-react";

export default function BucketConfigurePage() {
  const router = useRouter();
  const params = useParams();
  const bucketName = decodeURIComponent(params.bucketName);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    // Basic settings
    encryption: 'AES-256',
    versioning: true,
    logging: false,
    websiteHosting: false,
    
    // Security settings
    blockPublicAccess: true,
    corsEnabled: false,
    mfaDelete: false,
    
    // Lifecycle settings
    lifecycleRules: [],
    intelligentTiering: false,
    
    // Tags
    tags: [
      { key: 'Environment', value: 'Production' },
      { key: 'Project', value: 'SureTalk' },
      { key: 'ManagedBy', value: 'Terraform' }
    ]
  });

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Storage", href: "/adminDashboard/storage" },
    { label: "Buckets", href: "/adminDashboard/storage#buckets" },
    { label: bucketName, href: `/adminDashboard/storage/bucket/${params.bucketName}` },
    { label: "Configure", href: `#`, current: true }
  ];

  // Storage classes
  const storageClasses = [
    { value: 'STANDARD', label: 'Standard', description: 'Frequently accessed data' },
    { value: 'STANDARD_IA', label: 'Standard-IA', description: 'Infrequently accessed data' },
    { value: 'GLACIER', label: 'Glacier', description: 'Archive data with retrieval times from minutes to hours' },
    { value: 'DEEP_ARCHIVE', label: 'Deep Archive', description: 'Long-term archive with retrieval times of 12+ hours' }
  ];

  // Lifecycle rules presets
  const lifecyclePresets = [
    {
      name: 'Voice Notes Cleanup',
      description: 'Delete voice notes after 180 days (LITE tier)',
      days: 180,
      action: 'expire'
    },
    {
      name: 'Legacy Vault Archive',
      description: 'Move to Glacier after 90 days of inactivity',
      days: 90,
      action: 'transition',
      storageClass: 'GLACIER'
    },
    {
      name: 'Temporary Files',
      description: 'Delete temporary uploads after 7 days',
      days: 7,
      action: 'expire'
    }
  ];

  // Fetch bucket configuration
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        // TODO: Fetch actual bucket configuration from API
        // const response = await api.getBucketConfig(bucketName);
        // setConfig(response.data);
        
        // Simulate API call
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch configuration:", error);
        setLoading(false);
      }
    };

    fetchConfig();
  }, [bucketName]);

  // Handle configuration save
  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save configuration via API
      // await api.updateBucketConfig(bucketName, config);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert("Configuration saved successfully!");
      router.push(`/adminDashboard/storage/bucket/${params.bucketName}`);
    } catch (error) {
      console.error("Failed to save configuration:", error);
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  // Add new tag
  const addTag = () => {
    setConfig({
      ...config,
      tags: [...config.tags, { key: '', value: '' }]
    });
  };

  // Update tag
  const updateTag = (index, field, value) => {
    const newTags = [...config.tags];
    newTags[index][field] = value;
    setConfig({ ...config, tags: newTags });
  };

  // Remove tag
  const removeTag = (index) => {
    const newTags = config.tags.filter((_, i) => i !== index);
    setConfig({ ...config, tags: newTags });
  };

  // Add lifecycle rule
  const addLifecycleRule = (preset) => {
    setConfig({
      ...config,
      lifecycleRules: [
        ...config.lifecycleRules,
        {
          id: Date.now(),
          name: preset.name,
          description: preset.description,
          days: preset.days,
          action: preset.action,
          storageClass: preset.storageClass,
          status: 'active'
        }
      ]
    });
  };

  // Remove lifecycle rule
  const removeLifecycleRule = (id) => {
    setConfig({
      ...config,
      lifecycleRules: config.lifecycleRules.filter(rule => rule.id !== id)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                <Link
                  href={crumb.href}
                  className={`flex items-center gap-2 text-sm ${
                    crumb.current 
                      ? 'font-semibold text-brand-600 dark:text-brand-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  {crumb.icon}
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push(`/adminDashboard/storage/bucket/${params.bucketName}`)}
                className="p-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                         text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Configure {bucketName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage bucket settings and policies
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/adminDashboard/storage/bucket/${params.bucketName}`)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 
                       transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Configuration Sections */}
      <div className="space-y-8">
        {/* Basic Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Basic Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Encryption</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Server-side encryption for data at rest</p>
              </div>
              <select
                value={config.encryption}
                onChange={(e) => setConfig({ ...config, encryption: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 
                         focus:ring-brand-500 focus:border-transparent"
              >
                <option value="AES-256">AES-256 (SSE-S3)</option>
                <option value="AWS-KMS">AWS KMS</option>
                <option value="none">None (Not Recommended)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Versioning</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keep multiple versions of objects</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.versioning}
                  onChange={(e) => setConfig({ ...config, versioning: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                             peer-checked:bg-brand-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Access Logging</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Log bucket access requests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.logging}
                  onChange={(e) => setConfig({ ...config, logging: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                             peer-checked:bg-brand-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Block Public Access</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prevent public access to bucket</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.blockPublicAccess}
                  onChange={(e) => setConfig({ ...config, blockPublicAccess: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                             peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">CORS Configuration</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cross-origin resource sharing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.corsEnabled}
                  onChange={(e) => setConfig({ ...config, corsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                             peer-checked:bg-brand-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">MFA Delete</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Require MFA for version deletion</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mfaDelete}
                  onChange={(e) => setConfig({ ...config, mfaDelete: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                             peer-checked:bg-brand-500"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Lifecycle Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Lifecycle Rules
          </h3>
          
          {/* Quick Presets */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Quick Presets</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lifecyclePresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => addLifecycleRule(preset)}
                  className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl 
                           hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 
                           transition-colors text-left"
                >
                  <p className="font-medium text-gray-800 dark:text-white">{preset.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{preset.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {preset.action === 'expire' ? 'Delete after' : 'Archive after'} {preset.days} days
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Rules */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Active Rules</p>
            {config.lifecycleRules.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                <p className="text-gray-600 dark:text-gray-400">No lifecycle rules configured</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Add a rule to manage object lifecycle</p>
              </div>
            ) : (
              <div className="space-y-3">
                {config.lifecycleRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800 dark:text-white">{rule.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rule.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Action: {rule.action} after {rule.days} days
                        {rule.storageClass && ` → ${rule.storageClass}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeLifecycleRule(rule.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Tags
          </h3>
          
          <div className="space-y-4">
            {config.tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={tag.key}
                  onChange={(e) => updateTag(index, 'key', e.target.value)}
                  placeholder="Key"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 
                           focus:ring-brand-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={tag.value}
                  onChange={(e) => updateTag(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 
                           focus:ring-brand-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeTag(index)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button
              onClick={addTag}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 
                       rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 
                       transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Tag
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-2xl p-6 border-2 border-red-200 dark:border-red-800"
        >
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Empty Bucket</p>
                <p className="text-sm text-red-500 dark:text-red-300">Delete all objects in this bucket</p>
              </div>
              <button className="px-4 py-2 border-2 border-red-500 text-red-600 dark:text-red-400 
                               rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                Empty Bucket
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Delete Bucket</p>
                <p className="text-sm text-red-500 dark:text-red-300">Permanently delete this bucket and all contents</p>
              </div>
              <button className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                Delete Bucket
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}