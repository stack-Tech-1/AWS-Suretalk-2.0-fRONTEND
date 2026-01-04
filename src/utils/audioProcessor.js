export class AudioProcessor {
    constructor() {
      this.audioContext = null;
      this.sourceNode = null;
      this.analyserNode = null;
      this.gainNode = null;
      this.isInitialized = false;
    }
  
    async initialize() {
      if (this.isInitialized) return;
  
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyserNode = this.audioContext.createAnalyser();
        this.gainNode = this.audioContext.createGain();
        
        // Configure analyser
        this.analyserNode.fftSize = 2048;
        this.analyserNode.smoothingTimeConstant = 0.8;
        
        this.isInitialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize audio processor:', error);
        return false;
      }
    }
  
    async loadAudioFromUrl(url) {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) throw new Error('Failed to initialize audio processor');
      }
  
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        return audioBuffer;
      } catch (error) {
        console.error('Failed to load audio:', error);
        throw error;
      }
    }
  
    async loadAudioFromBlob(blob) {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) throw new Error('Failed to initialize audio processor');
      }
  
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        return audioBuffer;
      } catch (error) {
        console.error('Failed to load audio from blob:', error);
        throw error;
      }
    }
  
    // Get audio waveform data for visualization
    getWaveformData(audioBuffer, width = 200) {
      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(channelData.length / width);
      const waveform = [];
  
      for (let i = 0; i < width; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[(i * blockSize) + j]);
        }
        waveform.push(sum / blockSize);
      }
  
      return waveform;
    }
  
    // Normalize audio volume
    normalizeAudio(audioBuffer, targetPeak = 0.9) {
      const channelData = audioBuffer.getChannelData(0);
      let maxPeak = 0;
  
      // Find the maximum peak
      for (let i = 0; i < channelData.length; i++) {
        const absValue = Math.abs(channelData[i]);
        if (absValue > maxPeak) {
          maxPeak = absValue;
        }
      }
  
      // Calculate gain factor
      if (maxPeak > 0) {
        const gainFactor = targetPeak / maxPeak;
  
        // Apply gain to all samples
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] *= gainFactor;
        }
      }
  
      return audioBuffer;
    }
  
    // Trim audio (remove silence from start and end)
    trimAudio(audioBuffer, silenceThreshold = 0.01, minSilenceDuration = 0.1) {
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const minSilenceSamples = Math.floor(minSilenceDuration * sampleRate);
  
      let start = 0;
      let end = channelData.length;
  
      // Find start (skip initial silence)
      for (let i = 0; i < channelData.length; i++) {
        if (Math.abs(channelData[i]) > silenceThreshold) {
          start = Math.max(0, i - Math.floor(sampleRate * 0.1)); // Keep 100ms before first sound
          break;
        }
      }
  
      // Find end (skip trailing silence)
      for (let i = channelData.length - 1; i >= 0; i--) {
        if (Math.abs(channelData[i]) > silenceThreshold) {
          end = Math.min(channelData.length, i + Math.floor(sampleRate * 0.1)); // Keep 100ms after last sound
          break;
        }
      }
  
      // Ensure minimum duration
      if (end - start < sampleRate * 0.5) { // Minimum 0.5 seconds
        return audioBuffer;
      }
  
      // Create trimmed buffer
      const trimmedLength = end - start;
      const trimmedBuffer = this.audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        sampleRate
      );
  
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        
        for (let i = 0; i < trimmedLength; i++) {
          trimmedData[i] = originalData[start + i];
        }
      }
  
      return trimmedBuffer;
    }
  
    // Apply fade in/out
    applyFade(audioBuffer, fadeInDuration = 0.1, fadeOutDuration = 0.1) {
      const sampleRate = audioBuffer.sampleRate;
      const fadeInSamples = Math.floor(fadeInDuration * sampleRate);
      const fadeOutSamples = Math.floor(fadeOutDuration * sampleRate);
      const totalSamples = audioBuffer.length;
  
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
  
        // Fade in
        for (let i = 0; i < fadeInSamples && i < totalSamples; i++) {
          const fadeFactor = i / fadeInSamples;
          channelData[i] *= fadeFactor;
        }
  
        // Fade out
        for (let i = 0; i < fadeOutSamples && i < totalSamples; i++) {
          const fadeFactor = i / fadeOutSamples;
          const index = totalSamples - 1 - i;
          channelData[index] *= fadeFactor;
        }
      }
  
      return audioBuffer;
    }
  
    // Change playback speed (pitch preserved using pitch shifting algorithm)
    async changePlaybackSpeed(audioBuffer, speedFactor) {
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length / speedFactor,
        audioBuffer.sampleRate
      );
  
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = speedFactor;
  
      source.connect(offlineContext.destination);
      source.start();
  
      const renderedBuffer = await offlineContext.startRendering();
      return renderedBuffer;
    }
  
    // Convert audio buffer to WAV blob
    audioBufferToWav(audioBuffer) {
      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const length = audioBuffer.length * numChannels * 2;
      const buffer = new ArrayBuffer(44 + length);
      const view = new DataView(buffer);
  
      // Write WAV header
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + length, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * 2, true);
      view.setUint16(32, numChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, 'data');
      view.setUint32(40, length, true);
  
      // Write PCM samples
      const offset = 44;
      let pos = offset;
  
      for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
          view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          pos += 2;
        }
      }
  
      return new Blob([buffer], { type: 'audio/wav' });
    }
  
    // Convert audio buffer to MP3 (would require external library like lamejs)
    // This is a placeholder for MP3 conversion
    async audioBufferToMp3(audioBuffer) {
      // Note: MP3 conversion requires additional libraries
      // For now, we'll return WAV format
      return this.audioBufferToWav(audioBuffer);
    }
  
    // Clean up resources
    cleanup() {
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
  
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
  
      this.isInitialized = false;
    }
  }
  
  // Helper function to write string to DataView
  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }