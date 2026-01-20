"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Trash2, 
  Star, 
  StarOff,
  Filter,
  Search,
  Calendar,
  Clock,
  Volume2,
  MoreVertical,
  Plus,
  Headphones,
  Tag,
  Lock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react";
import { api } from '@/utils/api';
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import Link from 'next/link';

export default function VoiceNotes() {
  const [playingAudio, setPlayingAudio] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const analytics = useAnalyticsContext();

  const [voiceNotes, setVoiceNotes] = useState([]);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalDuration: 0,
    favoriteNotes: 0,
    permanentNotes: 0
  });

  const filters = [
    { id: "all", label: "All Notes" },
    { id: "favorites", label: "Favorites" },
    { id: "recent", label: "Recent" },
    { id: "permanent", label: "Legacy" },
    { id: "work", label: "Work" },
    { id: "personal", label: "Personal" },
  ];

  // Fetch voice notes data
  const fetchVoiceNotes = async (page = 1, filter = selectedFilter, search = searchQuery) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = {
        page,
        limit: pagination.limit
      };

      // Apply filters
      if (filter !== "all") {
        if (filter === "favorites") {
          params.filter = "favorites";
        } else if (filter === "recent") {
          // Get recent notes (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          // This would need backend support, for now we'll sort by recent
          params.sort = "created_at:desc";
        } else if (filter === "permanent") {
          params.filter = "permanent";
        } else if (filter === "work" || filter === "personal") {
          // For tag-based filtering, we'd need backend support
          // For now, we'll filter client-side
        }
      }

      // Apply search
      if (search) {
        params.search = search;
      }

      // Fetch voice notes
      const response = await api.getVoiceNotes(params);
      
      if (response.success) {
        const notes = response.data.notes || [];
        const paginationData = response.data.pagination || {};
        
        // Format notes for display
        const formattedNotes = await Promise.all(
          notes.map(async (note) => {
            try {
              // Get download URL
              let downloadUrl = null;
              try {
                const downloadResponse = await api.getVoiceNoteDownloadUrl(note.id);
                downloadUrl = downloadResponse.data.downloadUrl;
              } catch (downloadError) {
                console.warn(`Could not get download URL for note ${note.id}:`, downloadError);
              }

              // Determine type based on tags and permanent status
              let type = "personal";
              if (note.is_permanent) {
                type = "legacy";
              } else if (note.tags && note.tags.some(tag => 
                tag.toLowerCase().includes('work') || 
                tag.toLowerCase().includes('business') ||
                tag.toLowerCase().includes('client')
              )) {
                type = "work";
              }

              return {
                id: note.id,
                title: note.title || 'Untitled Recording',
                description: note.description || '',
                duration: formatDuration(note.duration_seconds || 0),
                date: formatDate(note.created_at),
                size: formatFileSize(note.file_size_bytes || 0),
                favorite: note.is_favorite || false,
                type: type,
                tags: note.tags || [],
                protected: note.is_permanent || false,
                downloadUrl: downloadUrl,
                playCount: note.play_count || 0,
                lastPlayed: note.last_played,
                s3Key: note.s3_key,
                s3Bucket: note.s3_bucket,
                isPermanent: note.is_permanent || false
              };
            } catch (formatError) {
              console.error('Error formatting note:', formatError);
              return null;
            }
          })
        ).then(results => results.filter(Boolean));

        // Apply client-side filtering for work/personal if backend doesn't support it
        let filteredNotes = formattedNotes;
        if (filter === "work") {
          filteredNotes = formattedNotes.filter(note => 
            note.tags.some(tag => 
              tag.toLowerCase().includes('work') || 
              tag.toLowerCase().includes('business') ||
              tag.toLowerCase().includes('client')
            )
          );
        } else if (filter === "personal") {
          filteredNotes = formattedNotes.filter(note => 
            !note.tags.some(tag => 
              tag.toLowerCase().includes('work') || 
              tag.toLowerCase().includes('business') ||
              tag.toLowerCase().includes('client')
            ) && !note.isPermanent
          );
        }

        setVoiceNotes(filteredNotes);
        setPagination({
          page: paginationData.page || page,
          limit: paginationData.limit || pagination.limit,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 1
        });

        // Calculate statistics
        calculateStats(filteredNotes);
        
        // Record analytics
        analytics.recordEvent('page_view', {
          page: 'voice_notes',
          filter: filter,
          search: search ? 'yes' : 'no'
        });

      } else {
        throw new Error(response.error || 'Failed to fetch voice notes');
      }
    } catch (error) {
      console.error('Failed to fetch voice notes:', error);
      setError('Failed to load voice notes. Please try again.');
      
      // Fallback to empty state
      setVoiceNotes([]);
      setPagination({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      });
      setStats({
        totalNotes: 0,
        totalDuration: 0,
        favoriteNotes: 0,
        permanentNotes: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from notes
  const calculateStats = (notes) => {
    const totalNotes = notes.length;
    const totalDuration = notes.reduce((sum, note) => {
      const durationMatch = note.duration.match(/(\d+):(\d+)/);
      if (durationMatch) {
        const [, minutes, seconds] = durationMatch;
        return sum + (parseInt(minutes) * 60) + parseInt(seconds);
      }
      return sum;
    }, 0);
    
    const favoriteNotes = notes.filter(note => note.favorite).length;
    const permanentNotes = notes.filter(note => note.protected).length;

    setStats({
      totalNotes,
      totalDuration,
      favoriteNotes,
      permanentNotes
    });
  };

  // Helper functions
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
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

  const formatTotalDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Add these functions to handle bulk operations:
const toggleBulkMode = () => {
  setBulkMode(!bulkMode);
  if (!bulkMode) {
    setSelectedNotes([]);
  }
};

const toggleNoteSelection = (noteId) => {
  setSelectedNotes(prev =>
    prev.includes(noteId)
      ? prev.filter(id => id !== noteId)
      : [...prev, noteId]
  );
};

const handleBulkFavorite = async () => {
  if (selectedNotes.length === 0) return;
  
  try {
    // Get current favorite status of first selected note
    const firstNote = voiceNotes.find(n => n.id === selectedNotes[0]);
    if (!firstNote) return;
    
    const newFavoriteStatus = !firstNote.favorite;
    
    // Update each note
    for (const noteId of selectedNotes) {
      await api.updateVoiceNote(noteId, { isFavorite: newFavoriteStatus });
    }
    
    // Update local state
    setVoiceNotes(prevNotes =>
      prevNotes.map(note =>
        selectedNotes.includes(note.id)
          ? { ...note, favorite: newFavoriteStatus }
          : note
      )
    );
    
    // Update stats
    setStats(prev => ({
      ...prev,
      favoriteNotes: newFavoriteStatus
        ? prev.favoriteNotes + selectedNotes.length
        : prev.favoriteNotes - selectedNotes.length
    }));
    
    // Record analytics
    analytics.recordEvent('voice_notes_bulk_favorited', {
      count: selectedNotes.length,
      action: newFavoriteStatus ? 'added' : 'removed'
    });
    
    // Clear selection
    setSelectedNotes([]);
    setBulkMode(false);
    
    alert(`${selectedNotes.length} note(s) ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`);
    
  } catch (error) {
    console.error('Bulk favorite error:', error);
    alert('Failed to update favorites. Please try again.');
  }
};

const handleBulkDelete = async () => {
  if (selectedNotes.length === 0) return;
  
  if (!confirm(`Are you sure you want to delete ${selectedNotes.length} selected note(s)? This action cannot be undone.`)) {
    return;
  }
  
  try {
    // Delete each note
    for (const noteId of selectedNotes) {
      await api.deleteVoiceNote(noteId);
    }
    
    // Record analytics
    analytics.recordEvent('voice_notes_bulk_deleted', {
      count: selectedNotes.length
    });
    
    // Remove from local state
    setVoiceNotes(prevNotes =>
      prevNotes.filter(note => !selectedNotes.includes(note.id))
    );
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalNotes: prev.totalNotes - selectedNotes.length,
      favoriteNotes: prev.favoriteNotes - selectedNotes.filter(id => {
        const note = voiceNotes.find(n => n.id === id);
        return note?.favorite;
      }).length
    }));
    
    // Clear selection
    setSelectedNotes([]);
    setBulkMode(false);
    
    alert(`${selectedNotes.length} note(s) deleted successfully`);
    
  } catch (error) {
    console.error('Bulk delete error:', error);
    alert('Failed to delete notes. Please try again.');
  }
};

const selectAllNotes = () => {
  if (selectedNotes.length === voiceNotes.length) {
    setSelectedNotes([]);
  } else {
    setSelectedNotes(voiceNotes.map(note => note.id));
  }
};

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setSelectedFilter(filterId);
    fetchVoiceNotes(1, filterId, searchQuery);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchVoiceNotes(1, selectedFilter, value);
    }, 500);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVoiceNotes(newPage, selectedFilter, searchQuery);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle audio playback
  const handlePlayAudio = async (note) => {
    if (playingAudio === note.id) {
      setPlayingAudio(null);
      return;
    }
    
    try {
      if (!note.downloadUrl) {
        // Get download URL if not already available
        const downloadResponse = await api.getVoiceNoteDownloadUrl(note.id);
        note.downloadUrl = downloadResponse.data.downloadUrl;
      }

      // Record play analytics
      await analytics.recordEvent('voice_note_played', {
        noteId: note.id,
        title: note.title,
        duration: note.duration
      });

      setPlayingAudio(note.id);
      
      // Here you would implement actual audio playback
      // Example: new Audio(note.downloadUrl).play();
      console.log('Playing audio:', note.downloadUrl);
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      alert('Failed to play audio. Please try again.');
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (note) => {
    try {
      const newFavoriteStatus = !note.favorite;
      
      // Update on server
      await api.updateVoiceNote(note.id, { isFavorite: newFavoriteStatus });
      
      // Record analytics
      await analytics.recordEvent('voice_note_favorited', {
        noteId: note.id,
        action: newFavoriteStatus ? 'added' : 'removed',
        title: note.title
      });

      // Update local state
      setVoiceNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === note.id ? { ...n, favorite: newFavoriteStatus } : n
        )
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        favoriteNotes: newFavoriteStatus ? prev.favoriteNotes + 1 : prev.favoriteNotes - 1
      }));

    } catch (error) {
      console.error('Failed to update favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  // Handle delete note
  const handleDeleteNote = async (note) => {
    if (!confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from server
      await api.deleteVoiceNote(note.id);
      
      // Record analytics
      await analytics.recordEvent('voice_note_deleted', {
        noteId: note.id,
        title: note.title,
        duration: note.duration,
        size: note.size
      });

      // Remove from local state
      setVoiceNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalNotes: prev.totalNotes - 1
      }));

      alert('Voice note deleted successfully.');

    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete voice note. Please try again.');
    }
  };

  // Handle download
  const handleDownload = async (note) => {
    try {
      if (!note.downloadUrl) {
        // Get download URL if not already available
        const downloadResponse = await api.getVoiceNoteDownloadUrl(note.id);
        note.downloadUrl = downloadResponse.data.downloadUrl;
      }

      // Record analytics
      await analytics.recordEvent('voice_note_downloaded', {
        noteId: note.id,
        title: note.title,
        size: note.size
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = note.downloadUrl;
      link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Failed to download note:', error);
      alert('Failed to download voice note. Please try again.');
    }
  };

  // Initialize data
  useEffect(() => {
    fetchVoiceNotes();
  }, []);

  // Loading state
  if (loading && voiceNotes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading voice notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Voice Notes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {stats.totalNotes === 0 
                ? 'Record and manage your voice notes'
                : `Manage and organize your ${stats.totalNotes} voice recordings`
              }
            </p>
          </div>
          <Link
            href="/usersDashboard/voice-notes/record"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                     text-white rounded-xl hover:shadow-lg transition-all"
            onClick={() => analytics.recordEvent('cta_click', { cta: 'new_recording_voice_notes' })}
          >
            <Plus className="w-4 h-4" />
            New Recording
          </Link>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-300">Error Loading Voice Notes</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              <button
                onClick={() => fetchVoiceNotes()}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search notes, tags, or content..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                          bg-white dark:bg-gray-800 cursor-pointer select-none">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {filters.find(f => f.id === selectedFilter)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedFilter === filter.id
                  ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Notes</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {loading ? '...' : stats.totalNotes}
              </p>
            </div>
            <Mic className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {loading ? '...' : formatTotalDuration(stats.totalDuration)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {loading ? '...' : stats.favoriteNotes}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Legacy</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {loading ? '...' : stats.permanentNotes}
              </p>
            </div>
            <Lock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </motion.div>

              {/* Bulk Operations */}
        {bulkMode && selectedNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{selectedNotes.length}</span>
                </div>
                <div className="text-white">
                  <p className="font-medium">{selectedNotes.length} note(s) selected</p>
                  <p className="text-sm opacity-90">Perform actions on all selected notes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkFavorite}
                  className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 
                          transition-colors flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  {voiceNotes.find(n => n.id === selectedNotes[0])?.favorite 
                    ? 'Remove from Favorites' 
                    : 'Add to Favorites'
                  }
                </button>
                
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 
                          transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
                
                <button
                  onClick={toggleBulkMode}
                  className="px-4 py-2 bg-white text-brand-600 rounded-xl hover:bg-gray-100 
                          transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bulk Mode Toggle */}
        {!bulkMode && voiceNotes.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={toggleBulkMode}
              className="px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                      rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors 
                      font-medium flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Select Multiple
            </button>
          </div>
        )}

      {/* Voice Notes Grid */}
      {loading && voiceNotes.length > 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Loading more notes...</span>
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {voiceNotes.map((note) => (
          <div
          key={note.id}
          className={`glass rounded-2xl p-6 card-hover relative ${
            selectedNotes.includes(note.id) ? 'ring-2 ring-brand-500 ring-offset-2' : ''
          }`}
          onClick={(e) => {
            if (bulkMode && !e.target.closest('button') && !e.target.closest('a')) {
              toggleNoteSelection(note.id);
            }
          }}
        >
          {/* Selection checkbox - Add at the top of each note card */}
          {bulkMode && (
            <div className="absolute top-4 right-4">
              <input
                type="checkbox"
                checked={selectedNotes.includes(note.id)}
                onChange={() => toggleNoteSelection(note.id)}
                className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
            </div>
          )}
            {/* Note Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    href={`/usersDashboard/voice-notes/${note.id}`}
                    className="font-bold text-gray-800 dark:text-white truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    onClick={() => analytics.recordEvent('voice_note_click', { noteId: note.id })}
                  >
                    {note.title}
                  </Link>
                  {note.protected && (
                    <Lock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {note.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    {note.duration}
                  </span>
                  <span>{note.size}</span>
                  {note.playCount > 0 && (
                    <span className="flex items-center gap-1" title={`Played ${note.playCount} times`}>
                      <Play className="w-3 h-3" />
                      {note.playCount}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleToggleFavorite(note)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={loading}
                title={note.favorite ? "Remove from favorites" : "Add to favorites"}
              >
                {note.favorite ? (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Description (if available) */}
            {note.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {note.description}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                           rounded-full text-xs flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePlayAudio(note)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  playingAudio === note.id
                    ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {playingAudio === note.id ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownload(note)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Download"
                  disabled={loading || !note.downloadUrl}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    analytics.recordEvent('voice_note_share_click', { noteId: note.id });
                    alert('Share functionality coming soon!');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Share"
                  disabled={loading}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteNote(note)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                  title="Delete"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link 
                  href={`/usersDashboard/voice-notes/${note.id}`}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Progress Bar */}
            {playingAudio === note.id && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full"
                    style={{ width: '45%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0:00</span>
                  <span>{note.duration}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    pagination.page === pageNum
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
              <>
                <span className="text-gray-500">...</span>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={loading}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {pagination.totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && voiceNotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Headphones className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {searchQuery || selectedFilter !== 'all'
              ? 'No voice notes found'
              : 'No voice notes yet'
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery || selectedFilter !== 'all'
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'Start by recording your first voice note to preserve memories, share messages, or document important moments.'
            }
          </p>
          <Link
            href="/usersDashboard/voice-notes/record"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                     text-white rounded-xl hover:shadow-lg transition-all font-medium"
            onClick={() => analytics.recordEvent('cta_click', { cta: 'record_first_note_empty' })}
          >
            <Plus className="w-5 h-5" />
            Record Your First Note
          </Link>
        </motion.div>
      )}
    </div>
  );
}