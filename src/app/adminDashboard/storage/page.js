"use client";
import { motion } from "framer-motion";
import { 
  Database, HardDrive, Download, Upload,
  TrendingUp, AlertTriangle, CheckCircle,
  Server, Clock, DollarSign, PieChart,
  BarChart3, MoreVertical, RefreshCw,
  Settings, Plus, X, FileText, Save,
  ChevronRight, Home
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PieChart as RechartsPieChart,
  Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { api } from "@/utils/api";

export default function StorageManagement() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [storageData, setStorageData] = useState([]);
  const [storageStats, setStorageStats] = useState({});
  const [buckets, setBuckets] = useState([]);
  
  // Modal states
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  
  // New rule form state
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    bucket: '',
    actionType: 'transition',
    days: 30,
    storageClass: 'GLACIER',
    status: 'active'
  });

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "System", href: "/adminDashboard/system" },
    { label: "Storage", href: "/adminDashboard/storage", current: true }
  ];

  const timeframes = [
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "90d", label: "Last 90 Days" },
    { id: "1y", label: "Last Year" },
  ];

  // Mock lifecycle rules (these would come from your backend)
  const [lifecycleRules, setLifecycleRules] = useState([
    {
      id: 1,
      name: "Voice Notes Auto-Delete",
      description: "Delete notes older than 180 days (LITE tier)",
      status: "active",
      transitions: 3,
      lastRun: "Yesterday",
    },
    {
      id: 2,
      name: "Legacy Vault Archive",
      description: "Move to Glacier after 90 days",
      status: "active",
      transitions: 2,
      lastRun: "Today",
    },
    {
      id: 3,
      name: "Log Retention",
      description: "Keep logs for 30 days, then delete",
      status: "active",
      transitions: 1,
      lastRun: "2 hours ago",
    },
    {
      id: 4,
      name: "Temp Files Cleanup",
      description: "Delete temporary files after 7 days",
      status: "paused",
      transitions: 1,
      lastRun: "1 week ago",
    },
  ]);

  // Fetch storage data from backend
  const fetchStorageData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch storage statistics from your backend
      const response = await api.getAdminStorageStats();
      
      if (response.success) {
        const data = response.data;
        
        // Transform data for pie chart
        const pieData = [
          { 
            name: 'Voice Notes', 
            value: Math.round(data.byBucket?.[0]?.total_bytes / (1024 * 1024 * 1024) || 0),
            color: '#3b82f6' 
          },
          { 
            name: 'Legacy Vault', 
            value: Math.round(data.byBucket?.[1]?.total_bytes / (1024 * 1024 * 1024) || 0),
            color: '#8b5cf6' 
          },
          { 
            name: 'Voice Wills', 
            value: Math.round(data.byBucket?.[2]?.total_bytes / (1024 * 1024 * 1024) || 0),
            color: '#10b981' 
          },
        ];

        setStorageData(pieData);
        
        // Calculate stats
        const totalBytes = data.byBucket?.reduce((sum, bucket) => sum + (bucket.total_bytes || 0), 0) || 0;
        const totalGB = Math.round(totalBytes / (1024 * 1024 * 1024));
        const totalCost = Math.round(totalGB * 0.023); // AWS S3 cost ~$0.023 per GB
        
        setStorageStats({
          totalStorage: `${totalGB} GB`,
          monthlyCost: `$${totalCost}`,
          activeUsers: data.byTier?.reduce((sum, tier) => sum + (parseInt(tier.user_count) || 0), 0) || 0,
          healthPercentage: '0%',
          growthData: data.growth || [],
          topUsers: data.topUsers || []
        });

        // Transform bucket data
        const bucketData = data.byBucket?.map(bucket => ({
          name: bucket.s3_bucket,
          region: 'us-east-1', // You might want to store region in your DB
          size: `${Math.round(bucket.total_bytes / (1024 * 1024 * 1024 * 1024) * 100) / 100} TB`,
          objects: bucket.file_count?.toLocaleString() || '0',
          cost: `$${Math.round(bucket.total_bytes / (1024 * 1024 * 1024) * 0.023)}`,
          status: bucket.file_count > 0 ? 'healthy' : 'warning',
          lastBackup: '2 hours ago' // You might want to track this
        })) || [];

        setBuckets(bucketData);
      }
    } catch (error) {
      console.error("Failed to fetch storage data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStorageData();
  }, [fetchStorageData]);

  // Handle adding new lifecycle rule
  const handleAddRule = async () => {
    if (!newRule.name || !newRule.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // This would call your backend API to add the rule
      // For now, we'll update the local state
      const newRuleObj = {
        id: lifecycleRules.length + 1,
        ...newRule,
        transitions: 1,
        lastRun: "Never",
        created: new Date().toISOString()
      };

      setLifecycleRules([...lifecycleRules, newRuleObj]);
      setShowAddRuleModal(false);
      setNewRule({
        name: '',
        description: '',
        bucket: '',
        actionType: 'transition',
        days: 30,
        storageClass: 'GLACIER',
        status: 'active'
      });

      alert("Lifecycle rule added successfully!");
    } catch (error) {
      console.error("Failed to add rule:", error);
      alert("Failed to add rule");
    }
  };

  // Handle configure button
  const handleConfigure = () => {
    // This could open a configuration page or modal
    // For now, we'll open the configure modal
    setShowConfigureModal(true);
  };

  // Handle upload report
  const handleUploadReport = async (file) => {
    if (!file) return;

    try {
      // This would upload to your backend
      const formData = new FormData();
      formData.append('report', file);
      
      // Simulate upload
      console.log("Uploading report:", file.name);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Report uploaded successfully!");
      setShowUploadReportModal(false);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload report");
    }
  };

  // Toggle rule status
  const toggleRuleStatus = (id) => {
    setLifecycleRules(rules => 
      rules.map(rule => 
        rule.id === id 
          ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
          : rule
      )
    );
  };

  // Run rule immediately
  const runRuleNow = (id) => {
    setLifecycleRules(rules => 
      rules.map(rule => 
        rule.id === id 
          ? { ...rule, lastRun: "Now" }
          : rule
      )
    );
    alert(`Running rule ${id}...`);
  };

  // Delete rule
  const deleteRule = (id) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      setLifecycleRules(rules => rules.filter(rule => rule.id !== id));
    }
  };

  // Calculate cost trend data from growth data
  const getCostTrendData = () => {
    if (!storageStats.growthData || storageStats.growthData.length === 0) {
      return [
        { month: 'Jan', cost: 0, usage: 0 },
        { month: 'Feb', cost: 0, usage: 0 },
        { month: 'Mar', cost: 0, usage: 0 },
        { month: 'Apr', cost: 0, usage: 0 },
        { month: 'May', cost: 0, usage: 0},
        { month: 'Jun', cost: 0, usage: 0 },
      ];
    }

    return storageStats.growthData.map((growth, index) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index] || `Month ${index + 1}`,
      cost: Math.round(growth.new_storage_bytes / (1024 * 1024 * 1024) * 0.023), // Convert to cost
      usage: Math.round(growth.new_storage_bytes / (1024 * 1024 * 1024)) // Convert to GB
    }));
  };

  // Display stats
  const displayStats = [
    {
      label: "Total Storage",
      value: storageStats.totalStorage || "0 TB",
      change: "+12%",
      icon: HardDrive,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Monthly Cost",
      value: storageStats.monthlyCost || "$0",
      change: "+8%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Active Users",
      value: (storageStats.activeUsers || 0).toLocaleString(),
      change: "+5%",
      icon: Server,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Storage Health",
      value: storageStats.healthPercentage || "0%",
      change: "+2%",
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
    },
  ];

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
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Storage Management
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor storage usage, costs, and manage lifecycle policies
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchStorageData}
              className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                       text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                       dark:hover:bg-brand-900/20 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={handleConfigure}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading storage data...</p>
        </div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {displayStats.map((stat, index) => (
          <div 
            key={index}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className={`flex items-center text-sm font-medium ${
              stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${stat.change.startsWith('+') ? '' : 'rotate-180'}`} />
              {stat.change}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        {/* Storage Distribution */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Storage Distribution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">By content type</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}GB`}
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} GB`, 'Storage']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Over Time */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Storage Cost Trend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 6 months</p>
            </div>
            <div className="flex gap-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setSelectedTimeframe(timeframe.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    selectedTimeframe === timeframe.id
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getCostTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'cost' ? `$${value}` : `${value} GB`,
                    name === 'cost' ? 'Cost' : 'Usage'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.75rem'
                  }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#3B82F6" name="Cost" />
                <Bar dataKey="usage" fill="#10B981" name="Usage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Storage Buckets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Storage Buckets</h3>
            <p className="text-gray-600 dark:text-gray-400">AWS S3 bucket details and status</p>
          </div>
          <button 
            onClick={() => setShowUploadReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                     text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                     dark:hover:bg-brand-900/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buckets.map((bucket, index) => (
            <div key={index} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <h4 className="font-bold text-gray-800 dark:text-white">{bucket.name}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{bucket.region}</span>
                    <span>{bucket.objects} objects</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  bucket.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {bucket.status === 'healthy' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {bucket.status.charAt(0).toUpperCase() + bucket.status.slice(1)}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Storage Used</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{bucket.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{bucket.cost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{bucket.lastBackup}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => router.push(`/adminDashboard/storage/bucket/${bucket.name}`)}
                  className="flex-1 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                           rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors 
                           flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Details
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lifecycle Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Lifecycle Rules</h3>
            <p className="text-gray-600 dark:text-gray-400">Automated storage management policies</p>
          </div>
          <button 
            onClick={() => setShowAddRuleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                     text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Rule Name
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Transitions
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Last Run
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lifecycleRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800 dark:text-white">{rule.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                        rule.status === 'active' ? 
                          'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {rule.status === 'active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-800 dark:text-white">{rule.transitions}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{rule.lastRun}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => runRuleNow(rule.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Run Now"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleRuleStatus(rule.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title={rule.status === 'active' ? 'Pause Rule' : 'Activate Rule'}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteRule(rule.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                          title="Delete Rule"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowAddRuleModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-y-auto flex-1">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add Lifecycle Rule</h3>
                    <button
                      onClick={() => setShowAddRuleModal(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rule Name *
                      </label>
                      <input
                        type="text"
                        value={newRule.name}
                        onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                                 focus:border-transparent transition-all"
                        placeholder="e.g., Archive Old Logs"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={newRule.description}
                        onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                                 focus:border-transparent transition-all min-h-[100px]"
                        placeholder="Describe what this rule does..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Apply to Bucket
                      </label>
                      <select
                        value={newRule.bucket}
                        onChange={(e) => setNewRule({...newRule, bucket: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                                 focus:border-transparent transition-all"
                      >
                        <option value="">All Buckets</option>
                        {buckets.map((bucket, index) => (
                          <option key={index} value={bucket.name}>{bucket.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Days
                        </label>
                        <input
                          type="number"
                          value={newRule.days}
                          onChange={(e) => setNewRule({...newRule, days: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                                   bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                                   focus:border-transparent transition-all"
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Action
                        </label>
                        <select
                          value={newRule.actionType}
                          onChange={(e) => setNewRule({...newRule, actionType: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                                   bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                                   focus:border-transparent transition-all"
                        >
                          <option value="transition">Transition to Archive</option>
                          <option value="expire">Expire (Delete)</option>
                          <option value="abort">Abort Incomplete</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newRule.status === 'active'}
                          onChange={(e) => setNewRule({...newRule, status: e.target.checked ? 'active' : 'paused'})}
                          className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Activate rule immediately</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowAddRuleModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 
                               text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                               dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddRule}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                               text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Rule
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Configure Modal */}
      {showConfigureModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowConfigureModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-y-auto flex-1">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Storage Configuration</h3>
                    <button
                      onClick={() => setShowConfigureModal(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-4">Storage Settings</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Default Storage Class</span>
                          <span className="font-medium">STANDARD</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Encryption</span>
                          <span className="font-medium text-green-600">AES-256 (Enabled)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Versioning</span>
                          <span className="font-medium">Enabled</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-4">Cost Optimization</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                          <div>
                            <p className="font-medium">Intelligent Tiering</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Automatically move infrequently accessed data</p>
                          </div>
                          <button className="px-3 py-1 bg-brand-500 text-white rounded-lg">Enable</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                          <div>
                            <p className="font-medium">Cost Alerts</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when costs exceed thresholds</p>
                          </div>
                          <button className="px-3 py-1 border-2 border-brand-500 text-brand-600 rounded-lg">Configure</button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white mb-4">Backup Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="autoBackup" className="rounded" defaultChecked />
                          <label htmlFor="autoBackup" className="text-gray-700 dark:text-gray-300">
                            Enable automatic daily backups
                          </label>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="crossRegion" className="rounded" />
                          <label htmlFor="crossRegion" className="text-gray-700 dark:text-gray-300">
                            Enable cross-region replication
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowConfigureModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 
                               text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                               dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert("Settings saved!");
                        setShowConfigureModal(false);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                               text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Upload Report Modal */}
      {showUploadReportModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowUploadReportModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-y-auto flex-1">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Upload Storage Report</h3>
                    <button
                      onClick={() => setShowUploadReportModal(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & drop your storage report</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse</p>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.json"
                        onChange={(e) => handleUploadReport(e.target.files[0])}
                        className="hidden"
                        id="reportFile"
                      />
                      <label htmlFor="reportFile" className="inline-block mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer">
                        Choose File
                      </label>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Supported formats: CSV, Excel, JSON. Maximum file size: 100MB.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowUploadReportModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 
                               text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                               dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => document.getElementById('reportFile')?.click()}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                               text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Upload Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}