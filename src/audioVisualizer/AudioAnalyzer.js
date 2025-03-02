// src/audioVisualizer/AudioAnalyzer.js
// This class handles audio analysis with Web Audio API

class AudioAnalyzer {
  constructor(options = {}) {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.audioElement = null;
    
    // Configuration with defaults
    this.config = {
      fftSize: options.fftSize || 2048,
      smoothingTimeConstant: options.smoothingTimeConstant || 0.8,
      minDecibels: options.minDecibels || -100,
      maxDecibels: options.maxDecibels || -30,
      audioUrl: options.audioUrl || null,
      onAudioLoaded: options.onAudioLoaded || (() => {}),
      onError: options.onError || console.error
    };
    
    // Frequency and time-domain data arrays
    this.frequencyData = null;
    this.timeData = null;
    
    // Beat detection properties
    this.beatDetectionThreshold = options.beatDetectionThreshold || 1.15;
    this.beatDetectionHistory = [];
    this.beatDetectionHistorySize = options.beatDetectionHistorySize || 10;
    this.lastBeatTime = 0;
    this.beatCooldownMs = options.beatCooldownMs || 250; // Min time between beats (ms)
    
    // Energy bands
    this.bass = 0;
    this.mid = 0;
    this.treble = 0;
    
    // Smoothed values (attenuated)
    this.bassAtt = 0;
    this.midAtt = 0;
    this.trebleAtt = 0;
    
    // Smoothing for energy values
    this.energySmoothing = 0.8; // Higher = more smoothing
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.connectAudio = this.connectAudio.bind(this);
    this.loadAudio = this.loadAudio.bind(this);
    this.analyzeBeat = this.analyzeBeat.bind(this);
    this.getAudioData = this.getAudioData.bind(this);
    this.disconnectAudio = this.disconnectAudio.bind(this);
    this.updateAudioData = this.updateAudioData.bind(this);
  }
  
  /**
   * Initialize the audio context and analyzer
   */
  initialize() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyzer node
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
      this.analyser.minDecibels = this.config.minDecibels;
      this.analyser.maxDecibels = this.config.maxDecibels;
      
      // Initialize data arrays
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
      
      this.isInitialized = true;
      
      // Connect to audio source if URL was provided
      if (this.config.audioUrl) {
        this.loadAudio(this.config.audioUrl);
      }
      
      return true;
    } catch (error) {
      this.config.onError('Failed to initialize audio analyzer:', error);
      return false;
    }
  }
  
  /**
   * Connect to an existing audio element
   * @param {HTMLAudioElement} audioElement - The audio element to analyze
   */
  connectAudio(audioElement) {
    if (!this.isInitialized) {
      if (!this.initialize()) return false;
    }
    
    try {
      // Disconnect any existing source
      if (this.source) {
        this.disconnectAudio();
      }
      
      this.audioElement = audioElement;
      
      // Create new media element source
      this.source = this.audioContext.createMediaElementSource(audioElement);
      
      // Connect nodes: source -> analyzer -> destination
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.isPlaying = !audioElement.paused;
      
      // Set up event listeners
      audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        // Resume audio context if it was suspended
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      });
      
      audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
      });
      
      audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
      });
      
      return true;
    } catch (error) {
      this.config.onError('Error connecting audio:', error);
      return false;
    }
  }
  
  /**
   * Load audio from URL
   * @param {string} url - URL of the audio file to load
   */
  loadAudio(url) {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = url;
    
    audio.addEventListener('canplaythrough', () => {
      this.connectAudio(audio);
      this.config.onAudioLoaded(audio);
    });
    
    audio.addEventListener('error', (err) => {
      this.config.onError('Error loading audio:', err);
    });
    
    return audio;
  }
  
  /**
   * Disconnect and clean up audio source
   */
  disconnectAudio() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    this.isPlaying = false;
  }
  
  /**
   * Update audio data arrays (call this in animation frame)
   */
  updateAudioData() {
    if (!this.isInitialized || !this.isPlaying) return false;
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.frequencyData);
    
    // Get waveform data
    this.analyser.getByteTimeDomainData(this.timeData);
    
    // Calculate energy in different frequency bands
    this.calculateEnergyBands();
    
    // Detect beats
    this.analyzeBeat();
    
    return true;
  }
  
  /**
   * Calculate energy values in different frequency bands
   */
  calculateEnergyBands() {
    if (!this.frequencyData) return;
    
    const binCount = this.analyser.frequencyBinCount;
    
    // Calculate band boundaries
    const bassRange = [0, Math.floor(binCount * 0.1)]; // Lower 10%
    const midRange = [bassRange[1], Math.floor(binCount * 0.5)]; // 10% - 50%
    const trebleRange = [midRange[1], binCount - 1]; // 50% - 100%
    
    // Calculate energy for each band
    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;
    
    // Bass range
    for (let i = bassRange[0]; i <= bassRange[1]; i++) {
      bassSum += this.frequencyData[i];
    }
    
    // Mid range
    for (let i = midRange[0]; i <= midRange[1]; i++) {
      midSum += this.frequencyData[i];
    }
    
    // Treble range
    for (let i = trebleRange[0]; i <= trebleRange[1]; i++) {
      trebleSum += this.frequencyData[i];
    }
    
    // Normalize values (0-1 range)
    const bassAvg = bassSum / (bassRange[1] - bassRange[0] + 1) / 255;
    const midAvg = midSum / (midRange[1] - midRange[0] + 1) / 255;
    const trebleAvg = trebleSum / (trebleRange[1] - trebleRange[0] + 1) / 255;
    
    // Apply scaling to make values more useful (centered around 1.0)
    const bassScaled = bassAvg * 3.0; 
    const midScaled = midAvg * 3.0;
    const trebleScaled = trebleAvg * 3.0;
    
    // Update values with smoothing
    this.bass = this.bass * this.energySmoothing + bassScaled * (1 - this.energySmoothing);
    this.mid = this.mid * this.energySmoothing + midScaled * (1 - this.energySmoothing);
    this.treble = this.treble * this.energySmoothing + trebleScaled * (1 - this.energySmoothing);
    
    // Update attenuated values with more smoothing
    const attSmoothing = this.energySmoothing * 1.2; // More smoothing for attenuated values
    this.bassAtt = Math.max(this.bass, this.bassAtt * attSmoothing + this.bass * (1 - attSmoothing));
    this.midAtt = Math.max(this.mid, this.midAtt * attSmoothing + this.mid * (1 - attSmoothing));
    this.trebleAtt = Math.max(this.treble, this.trebleAtt * attSmoothing + this.treble * (1 - attSmoothing));
  }
  
  /**
   * Detect beats in the audio
   * @returns {boolean} - True if a beat was detected
   */
  analyzeBeat() {
    if (!this.frequencyData) return false;
    
    // Calculate instantaneous energy (focusing on bass frequencies)
    const binCount = this.analyser.frequencyBinCount;
    const bassRange = [0, Math.floor(binCount * 0.1)]; // Focus on bass for beat detection
    
    let bassEnergy = 0;
    for (let i = bassRange[0]; i <= bassRange[1]; i++) {
      bassEnergy += this.frequencyData[i];
    }
    bassEnergy /= (bassRange[1] - bassRange[0] + 1);
    
    // Add energy to history
    this.beatDetectionHistory.push(bassEnergy);
    
    // Keep history at the right size
    if (this.beatDetectionHistory.length > this.beatDetectionHistorySize) {
      this.beatDetectionHistory.shift();
    }
    
    // Need enough history to detect beats
    if (this.beatDetectionHistory.length < this.beatDetectionHistorySize) {
      return false;
    }
    
    // Calculate average energy from history
    const avgEnergy = this.beatDetectionHistory.reduce((a, b) => a + b, 0) / 
                       this.beatDetectionHistory.length;
    
    // Check if current energy is significantly higher than average (a beat)
    const now = Date.now();
    const isBeat = bassEnergy > avgEnergy * this.beatDetectionThreshold &&
                   now - this.lastBeatTime > this.beatCooldownMs;
    
    if (isBeat) {
      this.lastBeatTime = now;
    }
    
    return isBeat;
  }
  
  /**
   * Get current audio analysis data
   * @returns {Object} - The current audio data
   */
  getAudioData() {
    return {
      frequencyData: this.frequencyData,
      timeData: this.timeData,
      energyBands: {
        bass: this.bass,
        mid: this.mid,
        treble: this.treble,
        bassAtt: this.bassAtt,
        midAtt: this.midAtt,
        trebleAtt: this.trebleAtt
      },
      isBeat: this.analyzeBeat(),
      isPlaying: this.isPlaying
    };
  }
  
  /**
   * Resume audio context (must be called after user interaction)
   */
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export default AudioAnalyzer;