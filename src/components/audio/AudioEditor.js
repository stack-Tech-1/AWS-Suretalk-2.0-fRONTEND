"use client";
import { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Save,
  X,
  SkipBack,
  SkipForward,
  Download,
  Loader2
} from 'lucide-react';
import { AudioProcessor } from '@/utils/audioProcessor';

export default function AudioEditor({ audioUrl, onSave, onClose }) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [waveform, setWaveform] = useState([]);
  const [originalBuffer, setOriginalBuffer] = useState(null);
  const [modifiedBuffer, setModifiedBuffer] = useState(null);
  
  const audioProcessor = useRef(new AudioProcessor());
  const audioContext = useRef(null);
  const sourceNode = useRef(null);
  const audioElement = useRef(null);
  const progressBarRef = useRef(null);
  const selectionRef = useRef(null);

  useEffect(() => {
    initializeAudio();
    return () => {
      cleanup();
    };
  }, [audioUrl]);

  const initializeAudio = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize audio processor
      await audioProcessor.current.initialize();

      // Load audio
      const buffer = await audioProcessor.current.loadAudioFromUrl(audioUrl);
      setOriginalBuffer(buffer);
      setModifiedBuffer(buffer);
      
      // Calculate duration
      setDuration(buffer.duration);
      setTrimEnd(buffer.duration);

      // Generate waveform
      const waveformData = audioProcessor.current.getWaveformData(buffer, 400);
      setWaveform(waveformData);

      setLoading(false);

    } catch (error) {
      console.error('Failed to initialize audio:', error);
      setError('Failed to load audio. Please try again.');
      setLoading(false);
    }
  };

  const cleanup = () => {
    if (sourceNode.current) {
      sourceNode.current.stop();
      sourceNode.current.disconnect();
      sourceNode.current = null;
    }

    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close();
      audioContext.current = null;
    }

    audioProcessor.current.cleanup();
  };

  const togglePlayPause = () => {
    if (!modifiedBuffer) return;

    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const startPlayback = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }

    sourceNode.current = audioContext.current.createBufferSource();
    sourceNode.current.buffer = modifiedBuffer;
    sourceNode.current.playbackRate.value = playbackRate;

    const gainNode = audioContext.current.createGain();
    gainNode.gain.value = volume;

    sourceNode.current.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    sourceNode.current.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    sourceNode.current.start();
    setIsPlaying(true);

    // Update current time
    const startTime = audioContext.current.currentTime;
    const updateTime = () => {
      if (!isPlaying) return;
      
      const elapsed = (audioContext.current.currentTime - startTime) * playbackRate;
      setCurrentTime(elapsed);
      
      if (elapsed >= duration) {
        setIsPlaying(false);
        setCurrentTime(0);
      } else {
        requestAnimationFrame(updateTime);
      }
    };

    updateTime();
  };

  const stopPlayback = () => {
    if (sourceNode.current) {
      sourceNode.current.stop();
      sourceNode.current.disconnect();
      sourceNode.current = null;
    }
    setIsPlaying(false);
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !modifiedBuffer) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    setCurrentTime(newTime);
    
    // If playing, restart from new position
    if (isPlaying) {
      stopPlayback();
      setTimeout(() => {
        // Seek to new position would require creating buffer slice
        // For simplicity, we'll just restart from beginning
        startPlayback();
      }, 100);
    }
  };

  const handleTrim = async () => {
    if (!originalBuffer || processing) return;

    try {
      setProcessing(true);
      
      // Apply trim
      let processedBuffer = audioProcessor.current.trimAudio(
        originalBuffer,
        0.01,
        0.1
      );

      // Apply normalization
      processedBuffer = audioProcessor.current.normalizeAudio(processedBuffer, 0.9);

      // Apply fade
      processedBuffer = audioProcessor.current.applyFade(processedBuffer, 0.1, 0.1);

      setModifiedBuffer(processedBuffer);
      
      // Update duration
      setDuration(processedBuffer.duration);
      setTrimEnd(processedBuffer.duration);
      
      // Regenerate waveform
      const waveformData = audioProcessor.current.getWaveformData(processedBuffer, 400);
      setWaveform(waveformData);

      // Stop current playback if any
      if (isPlaying) {
        stopPlayback();
      }

    } catch (error) {
      console.error('Trim error:', error);
      setError('Failed to process audio. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    if (!originalBuffer) return;

    setModifiedBuffer(originalBuffer);
    setDuration(originalBuffer.duration);
    setTrimEnd(originalBuffer.duration);
    
    const waveformData = audioProcessor.current.getWaveformData(originalBuffer, 400);
    setWaveform(waveformData);

    if (isPlaying) {
      stopPlayback();
    }
  };

  const handleSave = async () => {
    if (!modifiedBuffer || processing) return;

    try {
      setProcessing(true);
      
      // Convert to WAV blob
      const wavBlob = audioProcessor.current.audioBufferToWav(modifiedBuffer);
      
      // Create file object
      const file = new File([wavBlob], `edited_audio_${Date.now()}.wav`, {
        type: 'audio/wav'
      });

      if (onSave) {
        await onSave(file);
      }

    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save edited audio. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!modifiedBuffer || processing) return;

    try {
      setProcessing(true);
      
      const wavBlob = audioProcessor.current.audioBufferToWav(modifiedBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_audio_${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download audio. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading audio editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
        <button
          onClick={initializeAudio}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Audio</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Waveform Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 
                      rounded-xl p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Waveform</span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            className="relative w-full h-32 cursor-pointer"
          >
            {/* Waveform Bars */}
            <div className="absolute inset-0 flex items-end justify-between">
              {waveform.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 mx-px"
                  style={{
                    height: `${Math.max(2, value * 100)}%`,
                    backgroundColor: (index / waveform.length) * duration >= trimStart && 
                                   (index / waveform.length) * duration <= trimEnd
                      ? 'linear-gradient(to top, #667eea, #764ba2)'
                      : '#e5e7eb',
                    backgroundImage: (index / waveform.length) * duration >= trimStart && 
                                    (index / waveform.length) * duration <= trimEnd
                      ? 'linear-gradient(to top, #667eea, #764ba2)'
                      : undefined,
                    borderRadius: '2px',
                    opacity: (index / waveform.length) * duration >= currentTime - 0.5 && 
                           (index / waveform.length) * duration <= currentTime + 0.5
                      ? 1 : 0.7
                  }}
                />
              ))}
            </div>

            {/* Progress Indicator */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-brand-500"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-2 -left-2 w-5 h-5 bg-brand-500 rounded-full"></div>
            </div>

            {/* Trim Selection */}
            {trimStart > 0 || trimEnd < duration ? (
              <div
                ref={selectionRef}
                className="absolute top-0 bottom-0 border-2 border-brand-500 bg-brand-500/10"
                style={{
                  left: `${(trimStart / duration) * 100}%`,
                  width: `${((trimEnd - trimStart) / duration) * 100}%`
                }}
              />
            ) : null}
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{formatTime(0)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const newTime = Math.max(0, currentTime - 10);
              setCurrentTime(newTime);
              if (isPlaying) {
                stopPlayback();
                setTimeout(startPlayback, 100);
              }
            }}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={!modifiedBuffer}
          >
            <SkipBack className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={togglePlayPause}
            disabled={!modifiedBuffer || processing}
            className="p-4 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 
                     text-white hover:shadow-lg transition-all disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => {
              const newTime = Math.min(duration, currentTime + 10);
              setCurrentTime(newTime);
              if (isPlaying) {
                stopPlayback();
                setTimeout(startPlayback, 100);
              }
            }}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={!modifiedBuffer}
          >
            <SkipForward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Audio Processing Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Volume
              </label>
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (sourceNode.current) {
                      // Update volume in real-time
                      const gainNode = audioContext.current.createGain();
                      gainNode.gain.value = parseFloat(e.target.value);
                      sourceNode.current.disconnect();
                      sourceNode.current.connect(gainNode);
                      gainNode.connect(audioContext.current.destination);
                    }
                  }}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none 
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 
                           [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full 
                           [&::-webkit-slider-thumb]:bg-brand-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Playback Speed
              </label>
              <div className="flex gap-2">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      if (isPlaying) {
                        stopPlayback();
                        setTimeout(startPlayback, 100);
                      }
                    }}
                    className={`px-3 py-1 rounded-lg ${
                      playbackRate === rate
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleTrim}
              disabled={processing || !originalBuffer}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 
                       bg-gradient-to-r from-brand-500 to-accent-500 text-white 
                       rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  Auto-Trim & Normalize
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={processing || !originalBuffer}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 
                       border-2 border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                       dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Original
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={processing || !modifiedBuffer}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                     border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                     rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 
                     transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          <button
            onClick={handleSave}
            disabled={processing || !modifiedBuffer}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                     bg-gradient-to-r from-brand-500 to-accent-500 text-white 
                     rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                      rounded-xl p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Editing Tips</h4>
        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <li>• Click on the waveform to navigate to different parts of the audio</li>
          <li>• Use "Auto-Trim & Normalize" to remove silence and balance volume</li>
          <li>• Adjust playback speed for faster or slower listening</li>
          <li>• Changes are applied in real-time during playback</li>
        </ul>
      </div>
    </div>
  );
}