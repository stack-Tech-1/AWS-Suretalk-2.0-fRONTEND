"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic, Square, Play, Pause, Trash2, Upload,
  Clock, Volume2, Loader2, AlertCircle, CheckCircle,
  Calendar, Users, Search, User, X, ArrowLeft, FileAudio,
  Shield, Lock
} from "lucide-react";
import { api } from '@/utils/api';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from "next/link";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

export default function CreateVoiceWill() {
  const router = useRouter();
  const { user, hasLegacyVault, loading: authLoading } = useAuth();

  // Recording state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveStage, setSaveStage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseCondition, setReleaseCondition] = useState('manual');
  const [releaseDate, setReleaseDate] = useState('');
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);

  // Contacts / beneficiaries
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  // File upload alternative
  const [fileUpload, setFileUpload] = useState(null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mimeTypeRef = useRef('audio/webm');

  // ─── Access guard ────────────────────────────────────────────────────────────

  if (!authLoading && !hasLegacyVault()) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="p-5 rounded-full bg-purple-100 dark:bg-purple-900/30 w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Voice Wills Require Premium</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Upgrade to the Legacy Vault Premium plan to create voice wills — encrypted recordings that release to your beneficiaries under conditions you control.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/usersDashboard/vault" className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
            Go Back
          </Link>
          <Link href="/usersDashboard/settings?tab=billing" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-sm font-semibold shadow-lg shadow-purple-600/25">
            Upgrade Plan
          </Link>
        </div>
      </div>
    );
  }

  // ─── Waveform ────────────────────────────────────────────────────────────────

  const drawIdleWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bars = 32;
    const bw = (canvas.width / bars) * 0.65;
    for (let i = 0; i < bars; i++) {
      const h = Math.sin(i * 0.4) * 4 + 5;
      ctx.fillStyle = 'rgba(147, 51, 234, 0.2)';
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
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.95)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0.85)');
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

      const mimeType =
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
        MediaRecorder.isTypeSupported('audio/mp4')              ? 'audio/mp4'              :
        MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')  ? 'audio/ogg;codecs=opus'  :
        '';
      mimeTypeRef.current = mimeType || 'audio/webm';
      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      drawWaveform();
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
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
        .catch(() => setError('Failed to play recording'));
    }
  };

  const resetRecording = () => {
    if (recording) stopRecording();
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingDuration(0);
    setIsPlaying(false);
    setFileUpload(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  };

  // ─── File Upload ─────────────────────────────────────────────────────────────

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { setError('Please select an audio file'); return; }
    if (file.size > 100 * 1024 * 1024) { setError('File size must be less than 100MB'); return; }
    setFileUpload(file);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => setRecordingDuration(audio.duration);
    setAudioBlob(null);
  };

  // ─── Beneficiary helpers ──────────────────────────────────────────────────────

  const toggleBeneficiary = (contactId) => {
    setSelectedBeneficiaries(prev =>
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!audioBlob && !fileUpload) { setError('Please record or upload an audio file'); return; }
    if (!title.trim()) { setError('Please enter a title for your voice will'); return; }
    if (releaseCondition === 'date' && !releaseDate) { setError('Please select a release date'); return; }

    try {
      setUploading(true);
      setError(null);

      const fileToUpload = fileUpload || audioBlob;
      const fileName = fileUpload ? fileUpload.name : `will_${Date.now()}.webm`;
      const fileType = fileUpload ? fileUpload.type : mimeTypeRef.current;

      setSaveStage('Uploading recording...');
      const uploadResponse = await api.getVaultUploadUrl(fileName, fileType, true);
      if (!uploadResponse.success) throw new Error(uploadResponse.error || 'Failed to get upload URL');
      const { uploadUrl, key, bucket } = uploadResponse.data;

      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileToUpload,
        headers: { 'Content-Type': fileType }
      });
      if (!uploadResult.ok) throw new Error('Failed to upload audio to storage');

      setSaveStage('Saving voice will...');
      const willData = {
        title: title.trim(),
        description: description.trim(),
        s3Key: key,
        s3Bucket: bucket,
        fileSize: fileToUpload.size,
        duration: Math.round(recordingDuration),
        releaseCondition,
        ...(releaseCondition === 'date' && releaseDate && { releaseDate }),
        ...(selectedBeneficiaries.length > 0 && { beneficiaries: selectedBeneficiaries }),
      };

      const createResponse = await api.createVoiceWill(willData);
      if (!createResponse.success) throw new Error(createResponse.error || 'Failed to save voice will');

      setSaveStage('Saved!');
      setSuccess(true);
      toast.success('Voice will created successfully!', 'Will Saved');
      setTimeout(() => router.push('/usersDashboard/vault'), 1800);
    } catch (err) {
      setError(err.message || 'Failed to save voice will. Please try again.');
    } finally {
      setUploading(false);
      setSaveStage('');
    }
  };

  // ─── Utilities ───────────────────────────────────────────────────────────────

  const formatTime = (seconds) => {
    const s = Math.floor(seconds);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoadingContacts(true);
    api.getContacts({ page: 1, limit: 100 })
      .then(res => { if (res?.success) setContacts(res.data.contacts || []); })
      .catch(() => {})
      .finally(() => setLoadingContacts(false));
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

  const hasAudio = !!(audioBlob || fileUpload);
  const btnState = recording ? 'recording' : hasAudio ? (isPlaying ? 'playing' : 'paused') : 'idle';

  const filteredContacts = contacts.filter(c => {
    const q = contactSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });

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
          <Link
            href="/usersDashboard/vault"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Back to Voice Wills"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-600 shadow-lg shadow-purple-700/20">
            <FileAudio className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Create Voice Will</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 ml-24 text-sm">
          Record your message and set release conditions for your beneficiaries
        </p>
      </motion.div>

      {/* Alerts */}
      {success && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">Voice Will Saved!</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">Redirecting to Voice Wills…</p>
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

        {/* ── LEFT: Recording Studio ── */}
        <motion.div variants={itemVariants}>
          <div className="glass-premium rounded-3xl p-8 flex flex-col items-center gap-6 h-full">

            {/* Studio header */}
            <div className="w-full flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                Recording Studio
              </span>
              {recording && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-medium text-purple-500 uppercase tracking-widest">Live</span>
                </div>
              )}
            </div>

            {/* Large circular button */}
            <div className="relative flex items-center justify-center my-2">
              {recording && (
                <span className="absolute w-52 h-52 rounded-full border-4 border-purple-500/30 animate-ping" />
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
                    ? 'bg-gradient-to-br from-red-600 to-red-500 focus:ring-red-400 shadow-red-500/40'
                    : 'bg-gradient-to-br from-purple-700 to-indigo-600 focus:ring-purple-400 shadow-purple-700/40'
                  }`}
              >
                {btnState === 'recording' && <Square className="w-16 h-16 text-white" />}
                {btnState === 'idle'      && <Mic    className="w-16 h-16 text-white" />}
                {btnState === 'paused'   && <Play   className="w-16 h-16 text-white ml-2" />}
                {btnState === 'playing'  && <Pause  className="w-16 h-16 text-white" />}
              </motion.button>
            </div>

            {/* Waveform canvas */}
            <div className="w-full rounded-2xl overflow-hidden bg-gray-900/5 dark:bg-black/20 px-3 py-2">
              <canvas ref={canvasRef} width={320} height={72} className="w-full h-[72px]" />
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className={`text-5xl font-black font-mono tracking-tight tabular-nums transition-colors ${
                recording ? 'text-purple-500' : 'text-purple-700 dark:text-purple-400'
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
                  className="flex items-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold shadow-lg shadow-purple-700/25 transition-all"
                >
                  <Mic className="w-5 h-5" /> Start Recording
                </button>
              )}
              {recording && (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-600/25 transition-all"
                >
                  <Square className="w-5 h-5" /> Stop
                </button>
              )}
              {hasAudio && !recording && (
                <>
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-2 px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold shadow-lg shadow-purple-700/25 transition-all"
                  >
                    {isPlaying ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Play</>}
                  </button>
                  <button
                    onClick={resetRecording}
                    className="flex items-center gap-2 px-5 py-3 border-2 border-red-400 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-5 h-5" /> Discard
                  </button>
                </>
              )}
            </div>

            <audio
              ref={audioRef}
              src={audioUrl || undefined}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              className="hidden"
            />

            {/* File upload zone */}
            <div className="w-full mt-auto">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-5 text-center hover:border-purple-500 transition-colors cursor-pointer"
                onClick={() => !recording && fileInputRef.current?.click()}
              >
                {fileUpload ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Volume2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{fileUpload.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">{(fileUpload.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFileUpload(null); if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(null); setAudioBlob(null); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-7 h-7 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-purple-600 dark:text-purple-400 font-medium">Upload audio</span> or drag & drop
                    </p>
                    <p className="text-xs text-gray-400">MP3, WAV, M4A, WEBM · max 100MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </div>

          </div>
        </motion.div>

        {/* ── RIGHT: Will Details ── */}
        <div className="space-y-5">

          {/* Card 1: Will Details */}
          <motion.div variants={itemVariants}>
            <div className="glass-premium rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <FileAudio className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">Will Details</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Give your voice will a title and description</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    placeholder="e.g. Final Message to Family"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white resize-none"
                    placeholder="Add context or instructions for your beneficiaries"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Release Conditions */}
          <motion.div variants={itemVariants}>
            <div className="glass-premium rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">Release Conditions</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Control when this will becomes accessible</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Release Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={releaseCondition}
                    onChange={(e) => { setReleaseCondition(e.target.value); setReleaseDate(''); }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                  >
                    <option value="manual">Manual — I release it myself</option>
                    <option value="date">Date — Release on a specific date</option>
                    <option value="event">Event — Released upon a triggering event</option>
                  </select>
                </div>

                {releaseCondition === 'date' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Release Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="datetime-local"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                      />
                    </div>
                  </motion.div>
                )}

                {releaseCondition === 'event' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
                  >
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Event-triggered wills are released manually by an administrator when a verified event occurs (e.g. passing verified by next-of-kin).
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 3: Beneficiaries */}
          <motion.div variants={itemVariants}>
            <div className="glass-premium rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">Beneficiaries</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select who should receive this will</p>
                </div>
              </div>

              {/* Selected beneficiaries */}
              {selectedBeneficiaries.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedBeneficiaries.map(id => {
                    const c = contacts.find(x => x.id === id);
                    if (!c) return null;
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {c.name[0]?.toUpperCase()}
                        </span>
                        {c.name}
                        <button onClick={() => toggleBeneficiary(id)} className="ml-0.5 hover:text-purple-900 dark:hover:text-purple-100">×</button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search contacts…"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white text-sm"
                />
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1">
                {loadingContacts ? (
                  <div className="flex items-center justify-center py-5 gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading contacts…</span>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-5">
                    <User className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contactSearch ? 'No contacts match' : 'No contacts yet'}
                    </p>
                  </div>
                ) : filteredContacts.map(contact => {
                  const isSelected = selectedBeneficiaries.includes(contact.id);
                  return (
                    <button
                      key={contact.id}
                      onClick={() => toggleBeneficiary(contact.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0 ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {contact.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{contact.name}</p>
                        {contact.phone && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{contact.phone}</p>
                        )}
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Card 4: Save */}
          <motion.div variants={itemVariants}>
            <div className="glass-premium rounded-2xl p-6">
              {/* Summary */}
              <div className="space-y-2 mb-5 text-sm">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>Audio</span>
                  <span className={hasAudio ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400'}>
                    {hasAudio ? (fileUpload ? fileUpload.name : `Recorded · ${formatTime(recordingDuration)}`) : 'Not recorded'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                  <span>Release</span>
                  <span className="font-medium text-gray-800 dark:text-white capitalize">
                    {releaseCondition === 'date' && releaseDate
                      ? new Date(releaseDate).toLocaleDateString()
                      : releaseCondition}
                  </span>
                </div>
                {selectedBeneficiaries.length > 0 && (
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                    <span>Beneficiaries</span>
                    <span className="font-medium text-gray-800 dark:text-white">{selectedBeneficiaries.length} selected</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={uploading || !hasAudio || !title.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-700/25 hover:shadow-purple-700/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>{saveStage || 'Saving…'}</span></>
                ) : (
                  <><Shield className="w-5 h-5" /><span>Save Voice Will</span></>
                )}
              </button>

              {saveStage && (
                <p className="text-sm text-center text-purple-600 dark:text-purple-400 mt-2 animate-pulse">{saveStage}</p>
              )}

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                {hasAudio && title.trim()
                  ? 'Ready to save — your will is encrypted end-to-end'
                  : !hasAudio ? 'Record or upload audio to continue' : 'Enter a title to continue'}
              </p>
            </div>
          </motion.div>

        </div>{/* end right column */}
      </motion.div>
    </div>
  );
}
