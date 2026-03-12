"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic, Square, Play, Pause, Trash2, Upload, Save,
  Clock, Volume2, Loader2, AlertCircle, CheckCircle,
  Shield, Tag, Users, Star, Search, Phone, Plus, User, X
} from "lucide-react";
import { api } from '@/utils/api';
import { useAnalytics } from '@/hooks/useAnalytics.client';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

export default function RecordVoiceNote() {
  const router = useRouter();
  const analytics = useAnalytics();

  // Recording state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    isPermanent: false,
    isFavorite: false,
    contactId: null,
    newContact: null,
    contactPending: false
  });
  const [tagInput, setTagInput] = useState('');

  // Contact state
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [newContactData, setNewContactData] = useState({ name: '', phone: '', email: '', relationship: '' });

  // File upload state
  const [fileUpload, setFileUpload] = useState(null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // ─── Waveform Drawing ────────────────────────────────────────────────────────

  const drawIdleWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bars = 32;
    const bw = (canvas.width / bars) * 0.65;
    for (let i = 0; i < bars; i++) {
      const h = Math.sin(i * 0.4) * 4 + 5;
      ctx.fillStyle = 'rgba(29, 78, 216, 0.2)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(i * (canvas.width / bars), canvas.height - h, bw, h, 2);
      } else {
        ctx.rect(i * (canvas.width / bars), canvas.height - h, bw, h);
      }
      ctx.fill();
    }
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 0.78;
      const gap = (canvas.width / bufferLength) * 0.22;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(4, (dataArray[i] / 255) * canvas.height);
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(29, 78, 216, 0.95)');
        gradient.addColorStop(1, 'rgba(220, 38, 38, 0.85)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 3);
        } else {
          ctx.rect(x, canvas.height - barHeight, barWidth, barHeight);
        }
        ctx.fill();
        x += barWidth + gap;
      }
    };
    draw();
  }, []);

  // Draw idle waveform on mount and when recording stops
  useEffect(() => {
    if (!recording) {
      const t = setTimeout(drawIdleWaveform, 50);
      return () => clearTimeout(t);
    }
  }, [recording, drawIdleWaveform]);

  // ─── Recording Controls ──────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);

      // Web Audio API waveform
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      drawWaveform();

      analytics.recordEvent('recording_started');
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to access microphone. Please check permissions.');
      analytics.recordEvent('recording_error', { error: err.message });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
      setRecordingDuration(recordingTime);

      cancelAnimationFrame(animationFrameRef.current);
      audioContextRef.current?.close();
      audioContextRef.current = null;
      analyserRef.current = null;

      analytics.recordEvent('recording_stopped', { duration: recordingTime });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => { console.error('Playback error:', err); setError('Failed to play recording'); });
    }
  };

  const resetRecording = () => {
    if (recording) stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingDuration(0);
    setIsPlaying(false);
    setFileUpload(null);
    setFormData({ title: '', description: '', tags: [], isPermanent: false, isFavorite: false, contactId: null, newContact: null, contactPending: false });
    setContactSearch('');
    setShowNewContactForm(false);
    setNewContactData({ name: '', phone: '', email: '', relationship: '' });
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    analytics.recordEvent('recording_reset');
  };

  // ─── File Upload ─────────────────────────────────────────────────────────────

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { setError('Please select an audio file'); return; }
    if (file.size > 100 * 1024 * 1024) { setError('File size must be less than 100MB'); return; }
    setFileUpload(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => setRecordingDuration(audio.duration);
    analytics.recordEvent('audio_file_selected', { fileName: file.name, fileSize: file.size, fileType: file.type });
  };

  // ─── Form Submission ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!audioBlob && !fileUpload) { setError('Please record or upload an audio file'); return; }
    if (!formData.title.trim()) { setError('Please enter a title for your voice note'); return; }

    try {
      setUploading(true);
      setError(null);

      let resolvedContactId = formData.contactId;
      if (formData.newContact && !formData.contactPending) {
        const contactResp = await api.createContact(formData.newContact);
        if (contactResp.success) {
          resolvedContactId = contactResp.data.id;
          setContacts(prev => [contactResp.data, ...prev]);
        } else {
          throw new Error(contactResp.error || 'Failed to create contact');
        }
      }

      let fileToUpload, fileName, fileType;
      if (fileUpload) {
        fileToUpload = fileUpload; fileName = fileUpload.name; fileType = fileUpload.type;
      } else {
        fileToUpload = audioBlob; fileName = `recording_${Date.now()}.webm`; fileType = 'audio/webm';
      }

      const uploadResponse = await api.getUploadUrl(fileName, fileType);
      const { uploadUrl, key, bucket } = uploadResponse.data;

      const uploadResult = await fetch(uploadUrl, { method: 'PUT', body: fileToUpload, headers: { 'Content-Type': fileType } });
      if (!uploadResult.ok) throw new Error('Failed to upload to storage');

      const noteData = {
        title: formData.title,
        description: formData.description,
        s3Key: key,
        s3Bucket: bucket,
        fileSize: fileToUpload.size,
        duration: Math.round(recordingDuration),
        tags: formData.tags,
        isPermanent: formData.isPermanent,
        ...(resolvedContactId && { contactId: resolvedContactId }),
        ...(formData.newContact && formData.contactPending && { contactPending: true, pendingContactData: formData.newContact })
      };

      const createResponse = await api.createVoiceNote(noteData);
      if (createResponse.success) {
        if (formData.isFavorite) await api.updateVoiceNote(createResponse.data.id, { isFavorite: true });
        analytics.recordEvent('voice_note_created', { noteId: createResponse.data.id, title: formData.title, duration: recordingDuration, size: fileToUpload.size, isPermanent: formData.isPermanent, method: fileUpload ? 'upload' : 'record' });
        setSuccess(true);
        setTimeout(() => router.push(`/usersDashboard/voice-notes/${createResponse.data.id}`), 2000);
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

  // ─── Utilities ───────────────────────────────────────────────────────────────

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const resp = await api.getContacts({ page: 1, limit: 100 });
        if (resp.success) setContacts(resp.data.contacts || []);
      } catch (e) { console.error('Failed to fetch contacts', e); }
      finally { setLoadingContacts(false); }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(animationFrameRef.current);
      audioContextRef.current?.close();
    };
  }, [audioUrl]);

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const hasAudio = audioBlob || fileUpload;
  const linkedContact = formData.newContact
    ? formData.newContact
    : contacts.find(c => c.id === formData.contactId) || null;
  const isLinked = !!(formData.contactId || formData.newContact);

  // Circular button state
  const getButtonState = () => {
    if (recording) return 'recording';
    if (hasAudio) return isPlaying ? 'playing' : 'paused';
    return 'idle';
  };
  const btnState = getButtonState();

  // ─── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-700 to-accent-600 shadow-lg shadow-brand-700/20">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Studio Recording</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 ml-14 text-sm">
          Record a voice note or upload an existing audio file
        </p>
      </motion.div>

      {/* Alerts */}
      {success && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">Voice Note Saved Successfully!</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">Redirecting to your new voice note…</p>
          </div>
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Two-column grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6"
      >

        {/* ── LEFT COLUMN: Recording Studio ── */}
        <motion.div variants={itemVariants}>
          <div className="glass-premium rounded-3xl p-8 flex flex-col items-center gap-6 h-full">

            {/* Studio header */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                  Recording Studio
                </span>
              </div>
              {recording && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                  <span className="text-xs font-medium text-accent-500 uppercase tracking-widest">Live</span>
                </div>
              )}
            </div>

            {/* Large circular button + ping ring */}
            <div className="relative flex items-center justify-center my-2">
              {recording && (
                <span className="absolute w-52 h-52 rounded-full border-4 border-accent-500/30 animate-ping" />
              )}
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (btnState === 'idle') startRecording();
                  else if (btnState === 'recording') stopRecording();
                  else togglePlayback();
                }}
                disabled={uploading}
                className={`relative w-44 h-44 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2
                  ${btnState === 'recording'
                    ? 'bg-gradient-to-br from-accent-600 to-accent-500 focus:ring-accent-400 shadow-accent-500/40'
                    : 'bg-gradient-to-br from-brand-700 to-brand-500 focus:ring-brand-400 shadow-brand-700/40'
                  }`}
              >
                {btnState === 'recording' && <Square className="w-16 h-16 text-white" />}
                {btnState === 'idle' && <Mic className="w-16 h-16 text-white" />}
                {btnState === 'paused' && <Play className="w-16 h-16 text-white ml-2" />}
                {btnState === 'playing' && <Pause className="w-16 h-16 text-white" />}
              </motion.button>
            </div>

            {/* Waveform canvas */}
            <div className="w-full rounded-2xl overflow-hidden bg-gray-900/5 dark:bg-black/20 px-3 py-2">
              <canvas
                ref={canvasRef}
                width={320}
                height={72}
                className="w-full h-[72px]"
              />
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className={`text-5xl font-black font-mono tracking-tight tabular-nums transition-colors ${
                recording ? 'text-accent-500' : 'text-brand-700 dark:text-brand-400'
              }`}>
                {formatTime(recording ? recordingTime : recordingDuration)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[0.2em]">
                {recording ? 'recording' : hasAudio ? 'duration' : 'ready'}
              </p>
            </div>

            {/* Control buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              {!recording && !hasAudio && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-semibold shadow-lg shadow-brand-700/25 transition-all"
                >
                  <Mic className="w-5 h-5" /> Start Recording
                </button>
              )}
              {recording && (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-semibold shadow-lg shadow-accent-600/25 transition-all"
                >
                  <Square className="w-5 h-5" /> Stop
                </button>
              )}
              {hasAudio && !recording && (
                <>
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-2 px-5 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-semibold shadow-lg shadow-brand-700/25 transition-all"
                  >
                    {isPlaying ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Play</>}
                  </button>
                  <button
                    onClick={resetRecording}
                    className="flex items-center gap-2 px-5 py-3 border-2 border-accent-500 text-accent-600 dark:text-accent-400 rounded-xl font-semibold hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-all"
                  >
                    <Trash2 className="w-5 h-5" /> Discard
                  </button>
                </>
              )}
            </div>

            {/* Hidden audio element */}
            <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} className="hidden" />

            {/* File upload zone */}
            <div className="w-full mt-auto">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-5 text-center hover:border-brand-500 transition-colors cursor-pointer"
                onClick={() => !recording && fileInputRef.current?.click()}
              >
                {fileUpload ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Volume2 className="w-5 h-5 text-brand-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{fileUpload.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">{(fileUpload.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFileUpload(null); if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(null); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex-shrink-0">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-7 h-7 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-brand-600 dark:text-brand-400 font-medium">Upload audio</span> or drag & drop
                    </p>
                    <p className="text-xs text-gray-400">MP3, WAV, M4A, WEBM · max 100MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </div>

            {/* Linked contact indicator (bottom of left card) */}
            {isLinked && linkedContact && (
              <div className="w-full flex items-center gap-2 px-3 py-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {linkedContact.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-brand-700 dark:text-brand-300 font-medium truncate flex-1">{linkedContact.name}</span>
                <span className="text-xs text-brand-500 flex-shrink-0">Linked</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          {/* Card 1: Linked Contact */}
          <motion.div variants={itemVariants}>
            <div className="glass-premium rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                  <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">Linked Contact</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Associate this recording with a contact</p>
                </div>
              </div>

              {/* Selected contact badge */}
              {isLinked ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl mb-4">
                    <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {linkedContact?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 dark:text-white truncate">{linkedContact?.name}</p>
                        {formData.newContact && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex-shrink-0">New</span>
                        )}
                      </div>
                      {linkedContact?.phone && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />{linkedContact.phone}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, contactId: null, newContact: null, contactPending: false }))}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Save contact later toggle */}
                  {formData.newContact && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">Save contact later</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formData.contactPending ? 'Contact saved with this note' : 'Contact created on save'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={formData.contactPending}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactPending: e.target.checked }))}
                            className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
                        </label>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="search" placeholder="Search by name or phone…" value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white text-sm" />
                  </div>

                  {/* Contacts list */}
                  <div className="max-h-44 overflow-y-auto space-y-1 mb-3">
                    {loadingContacts ? (
                      <div className="flex items-center justify-center py-5 gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading contacts…</span>
                      </div>
                    ) : (() => {
                      const q = contactSearch.toLowerCase();
                      const filtered = contacts.filter(c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)));
                      return filtered.length === 0 ? (
                        <div className="text-center py-5">
                          <User className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {contactSearch ? 'No contacts match' : 'No contacts yet'}
                          </p>
                        </div>
                      ) : filtered.map(contact => (
                        <button key={contact.id}
                          onClick={() => setFormData(prev => ({ ...prev, contactId: contact.id, newContact: null, contactPending: false }))}
                          className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium text-sm flex-shrink-0">
                            {contact.name[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{contact.name}</p>
                            {contact.phone && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />{contact.phone}
                              </p>
                            )}
                          </div>
                        </button>
                      ));
                    })()}
                  </div>

                  {/* Create new contact */}
                  {showNewContactForm ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Contact</p>
                      {[
                        { placeholder: 'Full name *', field: 'name', type: 'text' },
                        { placeholder: 'Phone number *', field: 'phone', type: 'tel' },
                        { placeholder: 'Email (optional)', field: 'email', type: 'email' },
                      ].map(({ placeholder, field, type }) => (
                        <input key={field} type={type} placeholder={placeholder} value={newContactData[field]}
                          onChange={(e) => setNewContactData(prev => ({ ...prev, [field]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white text-sm" />
                      ))}
                      <select value={newContactData.relationship}
                        onChange={(e) => setNewContactData(prev => ({ ...prev, relationship: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white text-sm">
                        <option value="">Relationship (optional)</option>
                        <option value="family">Family</option>
                        <option value="friend">Friend</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          if (!newContactData.name.trim() || !newContactData.phone.trim()) { setError('Contact name and phone are required'); return; }
                          setFormData(prev => ({ ...prev, newContact: { ...newContactData }, contactId: null }));
                          setShowNewContactForm(false);
                        }} className="flex-1 px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-sm font-semibold transition-colors">
                          Use this contact
                        </button>
                        <button onClick={() => { setShowNewContactForm(false); setNewContactData({ name: '', phone: '', email: '', relationship: '' }); }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowNewContactForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400">
                      <Plus className="w-4 h-4" /> Create new contact
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Card 2: Note Details */}
          <motion.div variants={itemVariants}>
            <div className="glass-premium rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-base font-bold text-gray-800 dark:text-white">Note Details</h2>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Title <span className="text-accent-500">*</span>
                  </label>
                  <input type="text" value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white"
                    placeholder="Give your voice note a title" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-white resize-none"
                    placeholder="Add context or notes about this recording" />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
                  <div className="flex gap-2">
                    <input type="text" value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="Add tag, press Enter" />
                    <button onClick={addTag}
                      className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm">
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-brand-900 dark:hover:text-brand-100">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Save Options */}
          <motion.div variants={itemVariants}>
            <div className="glass-premium rounded-2xl p-6">
              <div className="space-y-4 mb-5">
                {/* Favorites toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Add to Favorites</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Mark as a favorite note</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isFavorite}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500" />
                  </label>
                </div>

                {/* Legacy Vault toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Shield className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Store in Legacy Vault</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Permanent bank-level encryption</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isPermanent}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPermanent: e.target.checked }))}
                      className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500" />
                  </label>
                </div>
              </div>

              {/* Contact badge in save area */}
              {isLinked && linkedContact && (
                <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl mb-4">
                  <Users className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                  <span className="text-sm text-brand-700 dark:text-brand-300 font-medium truncate">
                    Linked to: {linkedContact.name}
                  </span>
                  {formData.newContact && !formData.contactPending && (
                    <span className="text-xs text-gray-500 flex-shrink-0">(will be created)</span>
                  )}
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSubmit}
                disabled={uploading || !hasAudio || !formData.title.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 brand-gradient text-white rounded-xl font-bold text-base shadow-lg shadow-brand-700/25 hover:shadow-brand-700/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {uploading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving Voice Note…</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Voice Note</>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                {hasAudio
                  ? `Ready to save · ${formatTime(recordingDuration)}`
                  : 'Record or upload audio to continue'}
              </p>
            </div>
          </motion.div>

        </div>{/* end right column */}
      </motion.div>
    </div>
  );
}
