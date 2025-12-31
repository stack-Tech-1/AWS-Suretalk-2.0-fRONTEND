// Create: src/components/BucketAnalytics.js
"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Line,
  LineChart, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Users, Clock, DollarSign,
  Database, Activity, BarChart3, PieChart as PieChartIcon
} from "lucide-react";

export default function BucketAnalytics({ bucketName, metrics = [], files = [] }) {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({});

  // Calculate analytics from metrics and files
  useEffect(() => {
    if (metrics.length > 0 || files.length > 0) {
      const calculated = {
        // Storage trends
        dailyGrowth: calculateDailyGrowth(metrics),
        costTrend: calculateCostTrend(metrics),
        
        // File statistics
        fileTypes: analyzeFileTypes(files),
        sizeDistribution: analyzeSizeDistribution(files),
        
        // Performance metrics
        averageFileSize: calculateAverageFileSize(files),
        largestFile: findLargestFile(files),
        oldestFile: findOldestFile(files),
        
        // Usage patterns
        uploadPattern: analyzeUploadPattern(metrics),
        peakHours: findPeakHours(metrics)
      };
      
      setAnalytics(calculated);
    }
  }, [metrics, files]);

  // Helper functions
  const calculateDailyGrowth = (data) => {
    if (data.length < 2) return 0;
    const first = data[0].size || 0;
    const last = data[data.length - 1].size || 0;
    return ((last - first) / first) * 100;
  };

  const calculateCostTrend = (data) => {
    return data.reduce((sum, day) => sum + (day.cost || 0), 0);
  };

  const analyzeFileTypes = (files) => {
    const types = {};
    files.forEach(file => {
      const ext = file.key.split('.').pop().toLowerCase();
      types[ext] = (types[ext] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  // ... more helper functions

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Growth</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {analytics.dailyGrowth?.toFixed(2) || 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div className={`text-sm font-medium ${
            (analytics.dailyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {analytics.dailyGrowth >= 0 ? '↗ Increase' : '↘ Decrease'}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                ${analytics.costTrend?.toFixed(2) || 0}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Past {metrics.length} days
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg File Size</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {Math.round(analytics.averageFileSize / 1024 / 1024) || 0} MB
              </p>
            </div>
            <Database className="w-8 h-8 text-purple-500" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average per file
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">File Types</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {analytics.fileTypes?.length || 0}
              </p>
            </div>
            <PieChartIcon className="w-8 h-8 text-orange-500" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Unique formats
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Type Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
            File Type Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.fileTypes || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {analytics.fileTypes?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Size Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
            Size Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.sizeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upload Pattern */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
          Upload Activity Pattern
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.uploadPattern || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Area type="monotone" dataKey="uploads" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}