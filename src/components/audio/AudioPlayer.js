"use client";
import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCcw,
  Download
} from 'lucide-react';

export default function AudioPlayer({ audioUrl, title, onPlay }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = typeof audioUrl === 'function' ? await audioUrl() : audioUrl;
        
        if (!audioRef.current) {
          audioRef.current = new Audio(url);
        } else {
          audioRef.current.src = url;
        }

        audioRef.current.preload = 'metadata';
        
        // Set up event listeners
        audioRef.current.addEventListener('loadedmetadata', () => {
          setDuration(audioRef.current.duration);
          setIsLoading(false);
        });
        
        audioRef.current.addEventListener('timeupdate', () => {
          setCurrentTime(audioRef.current.currentTime);
        });
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });
        
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          setError('Failed to load audio');
          setIsLoading(false);
        });
        
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;

      } catch (err) {
        console.error('Failed to initialize audio:', err);
        setError('Failed to load audio');
        setIsLoading(false);
      }
    };

    initAudio();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          if (onPlay) onPlay();
        })
        .catch(err => {
          console.error('Play failed:', err);
          setError('Failed to play audio');
        });
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    if (!audioRef.current || !volumeBarRef.current) return;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    audioRef.current.volume = newVolume;
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Skip backward
  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, currentTime - 10);
  };

  // Skip forward
  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, currentTime + 10);
  };

  // Reset playback
  const resetPlayback = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  // Change playback rate
  const changePlaybackRate = () => {
    if (!audioRef.current) return;
    
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const nextRate = rates[nextIndex];
    
    setPlaybackRate(nextRate);
    audioRef.current.playbackRate = nextRate;
  };

  // Format time
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Audio Error</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 
                    rounded-2xl p-6 shadow-lg">
      {/* Title */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{title}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {playbackRate}x Speed
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer mb-2"
        >
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-6">
        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={skipBackward}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={isLoading}
            title="Skip backward 10 seconds"
          >
            <SkipBack className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="p-4 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 
                     text-white hover:shadow-lg transition-all disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          
          <button
            onClick={skipForward}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={isLoading}
            title="Skip forward 10 seconds"
          >
            <SkipForward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <div
                ref={volumeBarRef}
                onClick={handleVolumeChange}
                className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
              >
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-10">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={resetPlayback}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Reset to beginning"
            >
              <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <button
              onClick={changePlaybackRate}
              className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
              title="Change playback speed"
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 animate-pulse" 
                 style={{ width: '50%' }} />
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading audio...
          </p>
        </div>
      )}
    </div>
  );
}