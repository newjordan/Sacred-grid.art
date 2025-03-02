// src/audioVisualizer/AudioVisualizer.js
import React, { useState, useEffect, useRef } from 'react';
import AudioAnalyzer from './AudioAnalyzer';
import WaveformVisualizer from './WaveformVisualizer';
import FrequencyBars from './FrequencyBars';
import { useSpring, animated } from '@react-spring/web';

// Main container component for audio visualization
const AudioVisualizer = ({
  audioUrl = null,
  audioElement = null,
  fftSize = 2048,
  visualizerType = 'both', // 'waveform', 'frequency', 'both', 'circular'
  height = 300,
  backgroundColor = 'rgba(0,0,0,0.7)',
  waveColor = 'rgba(0, 255, 255, 0.8)',
  freqColor = '#00FFFF',
  autoStart = false,
  showControls = true,
  onAudioLoaded = null,
  onBeat = null, // Callback when a beat is detected
  frequencyBarOptions = {},
  waveformOptions = {},
  analyzerOptions = {},
}) => {
  // Audio analyzer and state
  const [analyzer, setAnalyzer] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioIsReady, setAudioIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Beat detection state
  const [beatActive, setBeatActive] = useState(false);
  const beatTimeoutRef = useRef(null);
  
  // Energy level (bass, mid, treble) for visualization intensity
  const [energyLevels, setEnergyLevels] = useSpring(() => ({
    bass: 1,
    mid: 1,
    treble: 1,
    config: {
      tension: 120,
      friction: 14
    }
  }));
  
  // Initialize audio analyzer
  useEffect(() => {
    const audioAnalyzer = new AudioAnalyzer({
      fftSize,
      audioUrl,
      onAudioLoaded: (audio) => {
        audioRef.current = audio;
        setAudioIsReady(true);
        if (onAudioLoaded) onAudioLoaded(audio);
        if (autoStart) {
          audio.play().catch((err) => {
            console.error('Auto-play failed:', err);
            setError('Auto-play failed. Please click play to start audio.');
          });
        }
      },
      onError: (msg, err) => {
        console.error(msg, err);
        setError(msg);
      },
      ...analyzerOptions
    });
    
    setAnalyzer(audioAnalyzer);
    
    // If user provided their own audio element, connect to it
    if (audioElement) {
      audioRef.current = audioElement;
      audioAnalyzer.connectAudio(audioElement);
      setAudioIsReady(true);
    } else {
      audioAnalyzer.initialize();
    }
    
    // Clean up analyzer on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (beatTimeoutRef.current) {
        clearTimeout(beatTimeoutRef.current);
      }
      audioAnalyzer.disconnectAudio();
    };
  }, []);
  
  // Animation loop to update audio data
  useEffect(() => {
    if (!analyzer) return;
    
    const updateData = () => {
      if (analyzer.updateAudioData()) {
        const data = analyzer.getAudioData();
        setAudioData(data);
        setIsPlaying(data.isPlaying);
        
        // Update energy level springs
        setEnergyLevels({
          bass: data.energyBands.bass,
          mid: data.energyBands.mid,
          treble: data.energyBands.treble
        });
        
        // Handle beat detection
        if (data.isBeat) {
          setBeatActive(true);
          if (onBeat) onBeat(data);
          
          // Reset beat active state after a short time
          if (beatTimeoutRef.current) {
            clearTimeout(beatTimeoutRef.current);
          }
          beatTimeoutRef.current = setTimeout(() => {
            setBeatActive(false);
          }, 100); // 100ms pulse
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(updateData);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateData);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyzer, onBeat]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      // Need to resume audio context on user interaction due to browser policies
      if (analyzer) analyzer.resume();
      audioRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        setError('Playback failed. Audio may not be loaded or another error occurred.');
      });
    } else {
      audioRef.current.pause();
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuted = !muted;
    setMuted(newMuted);
    audioRef.current.muted = newMuted;
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };
  
  // Render visualizers based on type and available data
  const renderVisualizers = () => {
    if (!audioData) return null;
    
    // Common section styles
    const sectionStyle = {
      position: 'relative',
      width: '100%',
      height: (visualizerType === 'both' ? '50%' : '100%')
    };
    
    // Determine what to render based on visualizer type
    switch (visualizerType) {
      case 'waveform':
        return (
          <div style={sectionStyle}>
            <WaveformVisualizer 
              audioData={audioData}
              height="100%"
              lineColor={waveColor}
              energyFactor={energyLevels.bass.get()}
              {...waveformOptions}
            />
          </div>
        );
        
      case 'frequency':
        return (
          <div style={sectionStyle}>
            <FrequencyBars 
              audioData={audioData}
              height="100%"
              color={freqColor}
              energyFactor={energyLevels.bass.get()}
              {...frequencyBarOptions}
            />
          </div>
        );
        
      case 'circular':
        // Circular mode combines waveform in radial mode with frequency bars
        return (
          <div style={sectionStyle}>
            <div style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%',
              zIndex: 2
            }}>
              <WaveformVisualizer 
                audioData={audioData}
                height="100%"
                lineColor={waveColor}
                radial={true}
                radialRadius={Math.min(height, document.body.clientWidth) * 0.25}
                energyFactor={energyLevels.bass.get()}
                {...waveformOptions}
              />
            </div>
            <div style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%',
              zIndex: 1
            }}>
              <FrequencyBars 
                audioData={audioData}
                height="100%"
                color={freqColor}
                barDirection="both"
                logarithmic={true}
                maxFrequency={8000}
                energyFactor={energyLevels.bass.get()}
                {...frequencyBarOptions}
              />
            </div>
          </div>
        );
        
      case 'both':
      default:
        return (
          <>
            <div style={{...sectionStyle, borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
              <WaveformVisualizer 
                audioData={audioData}
                height="100%"
                lineColor={waveColor}
                energyFactor={energyLevels.bass.get()}
                {...waveformOptions}
              />
            </div>
            <div style={sectionStyle}>
              <FrequencyBars 
                audioData={audioData}
                height="100%"
                color={freqColor}
                energyFactor={energyLevels.mid.get()}
                {...frequencyBarOptions}
              />
            </div>
          </>
        );
    }
  };
  
  return (
    <animated.div 
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        backgroundColor: beatActive ? 
          'rgba(0,128,255,0.7)' : 
          backgroundColor,
        overflow: 'hidden',
        borderRadius: '4px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transition: 'background-color 0.1s ease'
      }}
    >
      {/* Visualization area */}
      {renderVisualizers()}
      
      {/* Loading/error message */}
      {(!audioIsReady || error) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#fff',
          fontSize: '14px',
          zIndex: 300
        }}>
          {error ? error : 'Loading audio...'}
        </div>
      )}
      
      {/* Audio controls */}
      {showControls && audioIsReady && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 250
        }}>
          {/* Play/Pause button */}
          <button 
            onClick={togglePlayPause}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px'
            }}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          
          {/* Mute button */}
          <button 
            onClick={toggleMute}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px'
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          
          {/* Volume slider */}
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              width: '100px',
              accentColor: waveColor
            }}
          />
        </div>
      )}
    </animated.div>
  );
};

export default AudioVisualizer;