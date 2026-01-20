"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Star,
  StarOff,
  Calendar,
  Clock,
  Volume2,
  Edit2,
  Lock,
  Tag,
  Headphones,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronLeft,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  Users,
  Bell
} from "lucide-react";
import { api } from '@/utils/api';
import { useAnalytics } from '@/hooks/useAnalytics.client';
import Link from 'next/link';
import AudioPlayer from '@/components/audio/AudioPlayer';

export default function VoiceNoteDetail() {
  const { id } = useParams();
  const router = useRouter();
  const analytics = useAnalytics();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null);
  const [relatedNotes, setRelatedNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    link: true,
    email: false,
    sms: false
  });
  const [shareEmail, setShareEmail] = useState('');
  const [sharePhone, setSharePhone] = useState('');
  const [scheduleModal, setScheduleModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVoiceNote();
    }
  }, [id]);

  const fetchVoiceNote = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch voice note details
      const noteResponse = await api.getVoiceNote(id);
      if (noteResponse.success) {
        const noteData = noteResponse.data;
        setNote(noteData);
        
        // Set edit form
        setEditForm({
          title: noteData.title || '',
          description: noteData.description || '',
          tags: noteData.tags || []
        });

        // Fetch related notes (same tags or recent)
        try {
          const relatedResponse = await api.getVoiceNotes({
            page: 1,
            limit: 3,
            search: noteData.tags?.[0] || ''
          });
          if (relatedResponse.success) {
            const filteredRelated = (relatedResponse.data.notes || [])
              .filter(n => n.id !== noteData.id)
              .slice(0, 3);
            setRelatedNotes(filteredRelated);
          }
        } catch (relatedError) {
          console.warn('Could not fetch related notes:', relatedError);
        }

        // Record view analytics
        analytics.recordEvent('voice_note_viewed', {
          noteId: id,
          title: noteData.title,
          duration: noteData.duration_seconds,
          isPermanent: noteData.is_permanent
        });

      } else {
        throw new Error(noteResponse.error || 'Voice note not found');
      }
    } catch (error) {
      console.error('Failed to fetch voice note:', error);
      setError(error.message || 'Failed to load voice note');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleToggleFavorite = async () => {
    if (!note) return;
    
    try {
      const newFavoriteStatus = !note.is_favorite;
      
      await api.updateVoiceNote(id, { isFavorite: newFavoriteStatus });
      
      // Update local state
      setNote(prev => ({ ...prev, is_favorite: newFavoriteStatus }));
      
      // Record analytics
      analytics.recordEvent('voice_note_favorited', {
        noteId: id,
        action: newFavoriteStatus ? 'added' : 'removed',
        title: note.title
      });

    } catch (error) {
      console.error('Failed to update favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteVoiceNote(id);
      
      // Record analytics
      analytics.recordEvent('voice_note_deleted', {
        noteId: id,
        title: note.title
      });

      // Redirect to voice notes list
      router.push('/usersDashboard/voice-notes');
      router.refresh();

    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete voice note. Please try again.');
    }
  };

  const handleDownload = async () => {
    try {
      const downloadUrl = note.downloadUrl;

      // Record analytics
      analytics.recordEvent('voice_note_downloaded', {
        noteId: id,
        title: note.title
      });

      // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webm`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Failed to download note:', error);
    alert('Failed to download voice note. Please try again.');
  }
};

  const handleEditSave = async () => {
    try {
      const updateData = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        tags: editForm.tags
      };

      await api.updateVoiceNote(id, updateData);
      
      // Update local state
      setNote(prev => ({
        ...prev,
        ...updateData
      }));

      setIsEditing(false);

      // Record analytics
      analytics.recordEvent('voice_note_updated', {
        noteId: id,
        title: updateData.title
      });

    } catch (error) {
      console.error('Failed to update note:', error);
      alert('Failed to update voice note. Please try again.');
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCopyLink = () => {
    const noteUrl = `${window.location.origin}/usersDashboard/voice-notes/${id}`;
    navigator.clipboard.writeText(noteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    analytics.recordEvent('voice_note_link_copied', { noteId: id });
  };

  const handleMarkPermanent = async () => {
    if (!confirm('Mark this voice note as permanent? This will move it to your Legacy Vault and cannot be undone.')) {
      return;
    }

    try {
      await api.markVoiceNotePermanent(id);
      
      // Update local state
      setNote(prev => ({ ...prev, is_permanent: true }));
      
      // Record analytics
      analytics.recordEvent('voice_note_marked_permanent', { noteId: id });

      alert('Voice note marked as permanent and moved to Legacy Vault.');

    } catch (error) {
      console.error('Failed to mark as permanent:', error);
      alert('Failed to mark as permanent. You may need to upgrade to Legacy Vault Premium.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading voice note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Voice Note Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The voice note you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/usersDashboard/voice-notes"
              className="px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4 inline mr-2" />
              Back to Voice Notes
            </Link>
            <button
              onClick={fetchVoiceNote}
              className="px-6 py-3 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                       rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/usersDashboard/voice-notes"
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 
                   dark:text-brand-400 dark:hover:text-brand-300 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Voice Notes
        </Link>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Note Details */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-2xl font-bold bg-transparent border-b-2 border-brand-500 
                             text-gray-800 dark:text-white focus:outline-none pb-2"
                    placeholder="Note title"
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {note.title}
                    </h1>
                    {note.is_permanent && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 
                                   text-purple-600 dark:text-purple-400 rounded-full text-sm">
                        <Lock className="w-3 h-3" />
                        <span>Legacy Vault</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(note.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-4 h-4" />
                    {formatDuration(note.duration_seconds)}
                  </span>
                  <span>{formatFileSize(note.file_size_bytes)}</span>
                  <span className="flex items-center gap-1">
                    <Headphones className="w-4 h-4" />
                    {note.play_count || 0} plays
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={note.is_favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {note.is_favorite ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={isEditing ? "Cancel edit" : "Edit note"}
                >
                  <Edit2 className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Description</h3>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                           text-gray-800 dark:text-white"
                  placeholder="Add a description..."
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {note.description || 'No description provided.'}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Tags</h3>
              {isEditing ? (
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 
                                 text-brand-600 dark:text-brand-400 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-brand-700 dark:hover:text-brand-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Add a tag..."
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {note.tags?.length > 0 ? (
                    note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 
                                 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-500">No tags</p>
                  )}
                </div>
              )}
            </div>

            {/* Audio Player */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Listen</h3>
              <AudioPlayer
                audioUrl={async () => {
                  try {
                    const response = await api.getVoiceNoteDownloadUrl(id);
                    if (response.success && response.data?.downloadUrl) {
                      return response.data.downloadUrl;
                    }
                    throw new Error('Invalid response');
                  } catch (error) {
                    console.error('Failed to get audio URL:', error);
                    return '';
                  }
                }}
                title={note?.title}
                onPlay={() => analytics.recordEvent('voice_note_played', { noteId: id })}
              />
            </div>

            {/* Edit Action Buttons */}
            {isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={handleEditSave}
                  className="px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 
                           transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      title: note.title || '',
                      description: note.description || '',
                      tags: note.tags || []
                    });
                  }}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                           dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>

          {/* Related Notes */}
          {relatedNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Related Notes</h2>
              <div className="space-y-4">
                {relatedNotes.map((relatedNote) => (
                  <Link
                    key={relatedNote.id}
                    href={`/usersDashboard/voice-notes/${relatedNote.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 
                             hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                  >
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-100 
                                 dark:group-hover:bg-brand-900/20 transition-colors">
                      <Headphones className="w-5 h-5 text-gray-500 group-hover:text-brand-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 dark:text-white group-hover:text-brand-600 
                                   dark:group-hover:text-brand-400 transition-colors">
                        {relatedNote.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatDuration(relatedNote.duration_seconds)}</span>
                        <span>{formatDate(relatedNote.created_at)}</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 transform rotate-180" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 
                         dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Download className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-white">Download</span>
                </div>
                <span className="text-sm text-gray-500">MP3</span>
              </button>

              <button
                onClick={() => setScheduleModal(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 
                         dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Bell className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-white">Schedule Message</span>
                </div>
              </button>

              {!note.is_permanent && (
                <button
                  onClick={handleMarkPermanent}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 
                           dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <Shield className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">Move to Legacy Vault</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 
                                 dark:text-red-400 rounded-full">
                    Premium
                  </span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 
                         dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Note Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Note Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Storage Location</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {note.is_permanent ? 'Legacy Vault (Permanent)' : 'Standard Storage'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">File Format</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {note.file_format?.toUpperCase() || 'MP3'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Modified</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {formatDate(note.updated_at)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Played</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {note.last_played ? formatDate(note.last_played) : 'Never played'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6 border-2 border-red-200 dark:border-red-800"
          >
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete a voice note, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 
                       text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete Voice Note
            </button>
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Share Voice Note</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-300 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={shareOptions.link}
                    onChange={(e) => setShareOptions(prev => ({ ...prev, link: e.target.checked }))}
                    className="w-4 h-4 text-brand-500 rounded"
                  />
                  <span className="font-medium text-gray-800 dark:text-white">Shareable Link</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-300 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={shareOptions.email}
                    onChange={(e) => setShareOptions(prev => ({ ...prev, email: e.target.checked }))}
                    className="w-4 h-4 text-brand-500 rounded"
                  />
                  <span className="font-medium text-gray-800 dark:text-white">Share via Email</span>
                </div>
              </div>

              {shareOptions.email && (
                <div className="p-3 rounded-xl border border-gray-300 dark:border-gray-600">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button className="w-full mt-3 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                    Send Email
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-300 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={shareOptions.sms}
                    onChange={(e) => setShareOptions(prev => ({ ...prev, sms: e.target.checked }))}
                    className="w-4 h-4 text-brand-500 rounded"
                  />
                  <span className="font-medium text-gray-800 dark:text-white">Share via SMS</span>
                </div>
              </div>

              {shareOptions.sms && (
                <div className="p-3 rounded-xl border border-gray-300 dark:border-gray-600">
                  <input
                    type="tel"
                    value={sharePhone}
                    onChange={(e) => setSharePhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button className="w-full mt-3 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                    Send SMS
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Schedule Message</h3>
              <button
                onClick={() => setScheduleModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipient
                </label>
                <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select a contact</option>
                  <option value="email">Send via Email</option>
                  <option value="sms">Send via SMS</option>
                  <option value="both">Both Email & SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  className="w-full h-24 p-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Add a message to accompany the voice note..."
                />
              </div>

              <button className="w-full px-4 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 
                               transition-colors font-medium">
                Schedule Message
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}