"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic, MicOff, Save, X, Play, Pause,
  Trash2, Clock, Volume2, Upload,
  Loader2, AlertCircle, CheckCircle,
  Shield, Lock, Tag, Calendar,
  Users, Star
} from "lucide-react";
import { api } from '@/utils/api';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function RecordVoiceNote() {
  const router = useRouter();
  const analytics = useAnalytics();
  
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    isPermanent: false,
    isFavorite: false
  });
  
  const [tagInput, setTagInput] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      analytics.recordEvent('recording_started');
      
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to access microphone. Please check permissions.');
      analytics.recordEvent('recording_error', { error: err.message });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
      
      // Calculate duration in seconds
      setRecordingDuration(recordingTime);
      analytics.recordEvent('recording_stopped', { duration: recordingTime });
    }
  };

  // Toggle playback
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Playback error:', err);
          setError('Failed to play recording');
        });
    }
  };

  // Reset recording
  const resetRecording = () => {
    if (recording) {
      stopRecording();
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingDuration(0);
    setIsPlaying(false);
    setFormData({
      title: '',
      description: '',
      tags: [],
      isPermanent: false,
      isFavorite: false
    });
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    analytics.recordEvent('recording_reset');
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB');
      return;
    }
    
    setFileUpload(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Get duration
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setRecordingDuration(audio.duration);
    };
    
    analytics.recordEvent('audio_file_selected', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!audioBlob && !fileUpload) {
      setError('Please record or upload an audio file');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Please enter a title for your voice note');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      // Get file to upload
      let fileToUpload;
      let fileName;
      let fileType;
      
      if (fileUpload) {
        fileToUpload = fileUpload;
        fileName = fileUpload.name;
        fileType = fileUpload.type;
      } else {
        fileToUpload = audioBlob;
        fileName = `recording_${Date.now()}.webm`;
        fileType = 'audio/webm';
      }
      
      // Step 1: Get upload URL from backend
      const uploadResponse = await api.getUploadUrl(fileName, fileType);
      const { uploadUrl, key, bucket } = uploadResponse.data;
      
      // Step 2: Upload to S3
      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileToUpload,
        headers: {
          'Content-Type': fileType
        }
      });
      
      if (!uploadResult.ok) {
        throw new Error('Failed to upload to storage');
      }
      
      // Step 3: Create voice note record in database
      const noteData = {
        title: formData.title,
        description: formData.description,
        s3Key: key,
        s3Bucket: bucket,
        fileSize: fileToUpload.size,
        duration: Math.round(recordingDuration),
        tags: formData.tags,
        isPermanent: formData.isPermanent
      };
      
      const createResponse = await api.createVoiceNote(noteData);
      
      if (createResponse.success) {
        // Mark as favorite if needed
        if (formData.isFavorite) {
          await api.updateVoiceNote(createResponse.data.id, { isFavorite: true });
        }
        
        // Record analytics
        analytics.recordEvent('voice_note_created', {
          noteId: createResponse.data.id,
          title: formData.title,
          duration: recordingDuration,
          size: fileToUpload.size,
          isPermanent: formData.isPermanent,
          method: fileUpload ? 'upload' : 'record'
        });
        
        setSuccess(true);
        
        // Redirect after success
        setTimeout(() => {
          router.push(`/usersDashboard/voice-notes/${createResponse.data.id}`);
        }, 2000);
        
      } else {
        throw new Error(createResponse.error || 'Failed to create voice note');
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to save voice note. Please try again.');
      analytics.recordEvent('voice_note_creation_failed', { error: err.message });
    } finally {
      setUploading(false);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add tag
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Record Voice Note
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Record a new voice note or upload an existing audio file
        </p>
      </motion.div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-green-800 dark:text-green-300">
                Voice Note Saved Successfully!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Redirecting to your new voice note...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-300">Error</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Recording/Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Recording Controls */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Record Audio
            </h2>
            
            <div className="flex flex-col items-center justify-center py-8">
              {/* Recording Visualization */}
              <div className="relative mb-8">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  recording 
                    ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse' 
                    : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'
                }`}>
                  {recording ? (
                    <MicOff className="w-12 h-12 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                
                {/* Timer */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-mono font-bold text-gray-800 dark:text-white">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Recording Buttons */}
              <div className="flex items-center gap-4">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="px-8 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
                    disabled={audioBlob || fileUpload}
                  >
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 
                             text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
                  >
                    <MicOff className="w-5 h-5" />
                    Stop Recording
                  </button>
                )}
                
                {(audioBlob || fileUpload) && (
                  <button
                    onClick={resetRecording}
                    className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                             dark:hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear
                  </button>
                )}
              </div>
              
              {/* Recording Status */}
              {recording && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Recording in progress...
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Speak clearly into your microphone
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Or Upload Audio File
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 
                          rounded-2xl p-8 text-center hover:border-brand-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag & drop an audio file here, or click to browse
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                         rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors font-medium"
                disabled={recording}
              >
                Browse Files
              </button>
              
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                Supports MP3, WAV, M4A, WEBM (Max 100MB)
              </p>
            </div>
            
            {fileUpload && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {fileUpload.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {(fileUpload.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFileUpload(null);
                      if (audioUrl) URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audio Preview */}
          {(audioUrl || audioBlob) && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Preview
              </h2>
              
              <div className="space-y-4">
                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  className="hidden"
                />
                
                {/* Playback Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all"
                    disabled={!audioUrl}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Play
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-mono font-medium">
                      {formatTime(recordingDuration)}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
                    style={{ 
                      width: audioRef.current 
                        ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100 || 0}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Column - Note Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Note Information Form */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Note Information
            </h2>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                           text-gray-800 dark:text-white"
                  placeholder="Give your voice note a title"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                           text-gray-800 dark:text-white"
                  placeholder="Add a description or notes about this recording"
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                             rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {/* Tag List */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 
                                 text-brand-600 dark:text-brand-400 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-brand-700 dark:hover:text-brand-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Add to Favorites</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Mark this note as a favorite
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFavorite}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                 after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                 peer-checked:bg-brand-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Shield className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Store in Legacy Vault</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Permanent storage with bank-level encryption
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPermanent}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPermanent: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                 after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                 peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="glass rounded-2xl p-6">
            <button
              onClick={handleSubmit}
              disabled={uploading || (!audioBlob && !fileUpload) || !formData.title.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 
                       bg-gradient-to-r from-brand-500 to-accent-500 text-white 
                       rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 
                       disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Voice Note...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Voice Note
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-4">
              {audioBlob || fileUpload 
                ? `Ready to save ${formatTime(recordingDuration)} of audio`
                : 'Record or upload audio to continue'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}