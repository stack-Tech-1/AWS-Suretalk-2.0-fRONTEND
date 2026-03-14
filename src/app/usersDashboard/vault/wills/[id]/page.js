"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield, ArrowLeft, Trash2, Play,
  Download, Calendar, Phone, Clock, AlertCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { format, formatDistanceToNow } from 'date-fns';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const resolveUrl = (url) => url?.startsWith('/') ? `${API_BASE}${url}` : url;

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function VoiceWillDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [will, setWill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchWill = async () => {
      try {
        const response = await api.getVoiceWill(id);
        if (response?.success) setWill(response.data);
        else throw new Error(response?.message || 'Failed to load voice will');
      } catch (err) {
        setError(err.message || 'Failed to load voice will');
      } finally {
        setLoading(false);
      }
    };
    fetchWill();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this voice will? This cannot be undone.')) return;
    try {
      setDeleting(true);
      await api.deleteVoiceWill(id);
      router.push('/usersDashboard/vault');
    } catch (err) {
      setError(err.message || 'Failed to delete voice will');
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
    </div>
  );

  if (error && !will) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle className="w-16 h-16 text-red-500" />
      <p className="text-gray-600 dark:text-gray-400">{error}</p>
      <Link href="/usersDashboard/vault"
        className="px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600">
        Back to Vault
      </Link>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/usersDashboard/vault"
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {will.title || 'Voice Will'}
              </h1>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                will.source === 'ivr'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                {will.source === 'ivr' ? 'Recorded via IVR' : 'Recorded via App'}
              </span>
            </div>
          </div>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl
                       hover:bg-red-600 transition-colors disabled:opacity-50">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-500" />
            Play Recording
          </h2>
          {will.has_audio && will.downloadUrl ? (
            <audio controls src={resolveUrl(will.downloadUrl)} className="w-full" />
          ) : will.source === 'ivr' && !will.downloadUrl ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                This recording is stored in Twilio. If playback fails, the recording may have expired.
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No audio available for this will</p>
          )}
        </motion.div>

        {/* Details Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Contact / Beneficiary</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {will.contact_phone || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Release Condition</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                  {will.release_condition || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Release Date</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {will.release_date
                    ? format(new Date(will.release_date), 'PPpp')
                    : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${
                  will.is_released
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}>
                  {will.is_released ? 'Released' : 'Active'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {will.created_at
                    ? formatDistanceToNow(new Date(will.created_at)) + ' ago'
                    : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Storage</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {will.file_size_bytes
                    ? formatFileSize(will.file_size_bytes)
                    : '0 Bytes (IVR recording)'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
