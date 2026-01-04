"use client";
import { motion } from "framer-motion";
import {
  Database, HardDrive, Download, Upload,
  AlertTriangle, CheckCircle, Server, Clock,
  DollarSign, BarChart3, RefreshCw, Settings,
  ArrowLeft, Users, File, Activity, Shield,
  MoreVertical, Eye, Trash2, ChevronRight, Home
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { format } from "date-fns";
import { storageWebSocket } from "@/utils/websocket";


export default function BucketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bucketName = params.bucketName;
  const [loading, setLoading] = useState(true);
  const [bucketData, setBucketData] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [connected, setConnected] = useState(false);


  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Storage", href: "/adminDashboard/storage" },
    { label: "Buckets", href: "/adminDashboard/storage#buckets" },
    { label: decodeURIComponent(bucketName), href: `#`, current: true }
  ];

  // Fetch bucket details
  const fetchBucketDetails = useCallback(async () => {
    setLoading(true);
    try {
      // This would be your API endpoint - you'll need to create it
      // For now, we'll simulate data
      const mockBucketData = {
        name: decodeURIComponent(bucketName),
        region: 'us-east-1',
        size: '2.1 TB',
        objects: '124,567',
        cost: '$215/month',
        status: 'healthy',
        created: '2024-01-15',
        versioning: 'Enabled',
        encryption: 'AES-256',
        lifecycle: '2 active rules',
        lastBackup: '2 hours ago',
        owner: 'SureTalk System',
        storageClass: 'STANDARD, GLACIER',
        permissions: 'Private',
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'Project', value: 'SureTalk' },
          { key: 'ManagedBy', value: 'Terraform' }
        ]
      };

      const mockMetrics = [
        { date: '2024-12-01', requests: 1250, size: 150, cost: 45 },
        { date: '2024-12-02', requests: 1420, size: 165, cost: 48 },
        { date: '2024-12-03', requests: 1380, size: 158, cost: 47 },
        { date: '2024-12-04', requests: 1560, size: 180, cost: 52 },
        { date: '2024-12-05', requests: 1480, size: 172, cost: 50 },
        { date: '2024-12-06', requests: 1620, size: 190, cost: 55 },
        { date: '2024-12-07', requests: 1720, size: 210, cost: 60 },
      ];

      const mockFiles = [
        { key: 'voice-notes/user1/recording1.mp3', size: '15.2 MB', type: 'audio/mp3', lastModified: '2024-12-07', storageClass: 'STANDARD' },
        { key: 'voice-notes/user2/message.mp3', size: '8.7 MB', type: 'audio/mp3', lastModified: '2024-12-06', storageClass: 'STANDARD' },
        { key: 'legacy-vault/will1.enc', size: '45.3 MB', type: 'encrypted', lastModified: '2024-12-05', storageClass: 'GLACIER' },
        { key: 'backups/daily-backup.tar.gz', size: '2.1 GB', type: 'archive', lastModified: '2024-12-07', storageClass: 'STANDARD_IA' },
      ];

      const mockActivity = [
        { action: 'PUT', key: 'voice-notes/user3/recording.mp3', user: 'system', time: '2 minutes ago', status: 'success' },
        { action: 'GET', key: 'legacy-vault/will1.enc', user: 'admin', time: '15 minutes ago', status: 'success' },
        { action: 'DELETE', key: 'temp/file.txt', user: 'cleanup-job', time: '1 hour ago', status: 'success' },
        { action: 'PUT', key: 'backups/hourly-backup.tar.gz', user: 'backup-job', time: '2 hours ago', status: 'success' },
      ];

      setBucketData(mockBucketData);
      setMetrics(mockMetrics);
      setFiles(mockFiles);
      setActivity(mockActivity);

      // Uncomment when API is ready:
      // const response = await api.getBucketDetails(bucketName);
      // if (response.success) {
      //   setBucketData(response.data);
      //   setMetrics(response.data.metrics || []);
      //   setFiles(response.data.files || []);
      //   setActivity(response.data.activity || []);
      // }

    } catch (error) {
      console.error("Failed to fetch bucket details:", error);
    } finally {
      setLoading(false);
    }
  }, [bucketName]);

  // Refresh data
  const handleRefresh = () => {
    fetchBucketDetails();
  };

  // Download file
  const handleDownloadFile = (key) => {
    // Implement file download logic
    console.log("Downloading:", key);
    // await api.downloadFile(bucketName, key);
  };

  // Delete file
  const handleDeleteFile = (key) => {
    if (window.confirm(`Are you sure you want to delete ${key}?`)) {
      console.log("Deleting:", key);
      // await api.deleteFile(bucketName, key);
      fetchBucketDetails();
    }
  };

  // View file details
  const handleViewFile = (key) => {
    console.log("Viewing:", key);
    // Could open a modal with file details
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
  
    setUploading(true);
    setUploadProgress(0);
  
    try {
      // Generate upload URL
      const uploadResponse = await api.getUploadUrl(
        file.name,
        file.type,
        getBucketType(bucketName)
      );
  
      if (uploadResponse.success) {
        const { uploadUrl, key } = uploadResponse.data;
  
        // Upload file to S3
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };
  
        xhr.onload = async () => {
          if (xhr.status === 200) {
            // Create database record
            await api.createVoiceNote({
              title: file.name,
              s3Key: key,
              s3Bucket: bucketName,
              fileSize: file.size,
              duration: 0, // You might want to extract audio duration
              isPermanent: bucketName.includes('legacy-vault')
            });
  
            alert("File uploaded successfully!");
            fetchBucketDetails();
            setShowUploadModal(false);
            setUploadFile(null);
          } else {
            throw new Error('Upload failed');
          }
        };
  
        xhr.onerror = () => {
          throw new Error('Upload failed');
        };
  
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
  
      } else {
        throw new Error('Failed to get upload URL');
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Helper function to determine bucket type
const getBucketType = (bucketName) => {
    if (bucketName.includes('voice-notes')) return 'VOICE_NOTES';
    if (bucketName.includes('legacy-vault')) return 'LEGACY_VAULT';
    if (bucketName.includes('wills')) return 'WILLS';
    return 'VOICE_NOTES';
  };

  // Initialize WebSocket connection
useEffect(() => {
    // Connect to WebSocket
    storageWebSocket.connect();
  
    // Set up event listeners
    const handleConnected = () => {
      console.log("WebSocket connected");
      setConnected(true);
      // Subscribe to bucket updates
      storageWebSocket.subscribeToStorage(bucketName);
    };
  
    const handleDisconnected = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };
  
    const handleStorageUpdate = (data) => {
      if (data.bucket === bucketName || !data.bucket) {
        setRealTimeMetrics(data.metrics);
        
        // Update bucket data if needed
        if (bucketData) {
          const bucketMetric = data.metrics.find(m => m.bucket === bucketName);
          if (bucketMetric) {
            setBucketData(prev => ({
              ...prev,
              size: `${bucketMetric.sizeGB} GB`,
              objects: bucketMetric.files.toLocaleString()
            }));
          }
        }
      }
    };
  
    const handleError = (error) => {
      console.error("WebSocket error:", error);
    };
  
    // Register event listeners
    storageWebSocket.on('connected', handleConnected);
    storageWebSocket.on('disconnected', handleDisconnected);
    storageWebSocket.on('storage_update', handleStorageUpdate);
    storageWebSocket.on('error', handleError);
  
    // Cleanup on unmount
    return () => {
      storageWebSocket.off('connected', handleConnected);
      storageWebSocket.off('disconnected', handleDisconnected);
      storageWebSocket.off('storage_update', handleStorageUpdate);
      storageWebSocket.off('error', handleError);
      storageWebSocket.unsubscribeFromStorage();
    };
  }, [bucketName]);

  useEffect(() => {
    if (bucketName) {
      fetchBucketDetails();
    }
  }, [bucketName, fetchBucketDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bucket details...</p>
        </div>
      </div>
    );
  }

  if (!bucketData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Bucket Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The bucket {bucketName} does not exist or you don't have access.</p>
          <button
            onClick={() => router.push('/adminDashboard/storage')}
            className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Return to Storage
          </button>
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
          <div className="flex items-center gap-3">
            <button
                onClick={() => router.push(`/adminDashboard/storage`)}
                className="p-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                        text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Database className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {bucketData.name}
                </h1>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                    title={connected ? 'Real-time updates connected' : 'Real-time updates disconnected'} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                <Server className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{bucketData.region}</span>
                </div>
            </div>
            </div>
          </div>
          {realTimeMetrics && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
            >
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">Live Updates</p>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Live Size</p>
                    <p className="font-medium text-blue-700 dark:text-blue-300">
                    {realTimeMetrics.find(m => m.bucket === bucketName)?.sizeGB || 0} GB
                    </p>
                </div>
                <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Live Files</p>
                    <p className="font-medium text-blue-700 dark:text-blue-300">
                    {realTimeMetrics.find(m => m.bucket === bucketName)?.files?.toLocaleString() || 0}
                    </p>
                </div>
                </div>
            </motion.div>
            )}
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                       text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                       dark:hover:bg-brand-900/20 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => router.push(`/adminDashboard/storage/bucket/${bucketName}/configure`)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bucket Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{bucketData.size}</p>
            </div>
            <HardDrive className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {bucketData.objects} objects
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{bucketData.cost}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Estimated AWS charges
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {bucketData.status.charAt(0).toUpperCase() + bucketData.status.slice(1)}
                </p>
                <div className={`p-1 rounded-full ${bucketData.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Last backup: {bucketData.lastBackup}</span>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lifecycle Rules</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{bucketData.lifecycle}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Active policies
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        {/* Requests Over Time */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Request Volume</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 7 days</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#3B82F6" name="Requests" />
                <Line type="monotone" dataKey="size" stroke="#10B981" name="Size (GB)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Cost Breakdown</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily costs</p>
            </div>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                <Bar dataKey="cost" fill="#8B5CF6" name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Bucket Details Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
      >
        {/* Bucket Properties */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Bucket Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Basic Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Owner</span>
                    <span className="font-medium">{bucketData.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span className="font-medium">{bucketData.created}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Storage Class</span>
                    <span className="font-medium">{bucketData.storageClass}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Security & Features</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Encryption</span>
                    <span className="font-medium text-green-600">{bucketData.encryption}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Versioning</span>
                    <span className="font-medium">{bucketData.versioning}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Permissions</span>
                    <span className="font-medium">{bucketData.permissions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {bucketData.tags.map((tag, index) => (
                  <div key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tag.key}: </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{tag.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {activity.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium">{item.action}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                        {item.key.split('/').pop()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      by {item.user} • {item.time}
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                             dark:hover:bg-gray-800 transition-colors">
              View All Activity
            </button>
          </div>
        </div>
      </motion.div>

      {/* Files Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Files</h3>
            <p className="text-gray-600 dark:text-gray-400">Recently modified objects</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                    text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                    dark:hover:bg-brand-900/20 transition-colors"
            >
            <Upload className="w-4 h-4" />
            Upload File
            </button>

            {showUploadModal && (
  <>
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={() => !uploading && setShowUploadModal(false)}
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
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Upload File</h3>
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
                {uploadFile ? (
                  <div>
                    <File className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-800 dark:text-white font-medium">{uploadFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(uploadFile.size / 1024)} KB
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & drop your file</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse</p>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label htmlFor="fileUpload" className="inline-block mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer">
                      Choose File
                    </label>
                  </>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span className="text-gray-800 dark:text-white">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Supported formats: MP3, WAV, M4A. Maximum file size: 100MB.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                         dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => uploadFile && handleFileUpload(uploadFile)}
                disabled={!uploadFile || uploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                         text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </>
)}
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Key
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Size
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Last Modified
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Storage Class
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {files.map((file, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-800 dark:text-white truncate max-w-[200px]">
                          {file.key}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-800 dark:text-white">{file.size}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{file.type}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{file.lastModified}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{file.storageClass}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewFile(file.key)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile(file.key)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.key)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}