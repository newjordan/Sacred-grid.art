// src/SacredGridAudio.js
import React, { useState, useEffect } from 'react';
import SacredGrid from './SacredGrid';
import { GridAudioConnector } from './audioVisualizer';
import { useSpring, animated } from '@react-spring/web';

// SacredGridAudio wraps the SacredGrid component with audio reactivity
const SacredGridAudio = ({
  audioUrl = 'https://cdn.freesound.org/previews/669/669214_1648170-lq.mp3',
  visualizationMode = 'react',
  responseIntensity = 0.5,
  beatMultiplier = 1.5,
  showControls = true
}) => {
  // Keep track of the SacredGrid settings
  const [gridSettings, setGridSettings] = useState(null);
  const [gridRef, setGridRef] = useState(null);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  
  // Selected visualization mode
  const [currentMode, setCurrentMode] = useState(visualizationMode);
  const [currentIntensity, setCurrentIntensity] = useState(responseIntensity);
  
  // Audio visualization modes
  const visualizationModes = [
    { value: 'none', label: 'No Audio Reaction' },
    { value: 'react', label: 'Reactive Mode' },
    { value: 'drive', label: 'Driving Mode' },
    { value: 'pulse', label: 'Pulse Mode' },
    { value: 'breathe', label: 'Breathing Mode' },
    { value: 'contour', label: 'Contour Mode' }
  ];
  
  // Animation for pulsing based on beats
  const [beatAnimation, api] = useSpring(() => ({
    transform: 'scale(1)',
    filter: 'brightness(1)',
    config: { tension: 300, friction: 10 }
  }));
  
  // Setup audio element
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    setAudioElement(audio);
    
    // Event listeners
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);
  
  // Toggle play/pause
  const togglePlayback = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(err => {
        console.error('Playback failed:', err);
      });
    }
  };
  
  // Handle beat detection from GridAudioConnector
  const handleBeat = (beatAnimation, isActiveBeat) => {
    if (isActiveBeat) {
      api.start({
        transform: `scale(${1 + (beatMultiplier - 1) * 0.05})`,
        filter: 'brightness(1.2)',
        config: { tension: 300, friction: 10 }
      });
    } else {
      api.start({
        transform: 'scale(1)',
        filter: 'brightness(1)',
        config: { tension: 200, friction: 15 }
      });
    }
  };
  
  // Get settings from SacredGrid and keep reference to grid renderer
  const getGridSettings = (settings, gridInstance) => {
    setGridSettings(settings);
    if (!gridRef && gridInstance) {
      console.log('SacredGridAudio: Received grid instance reference');
      setGridRef(gridInstance);
    }
  };
  
  // Update settings based on audio
  const updateGridSettings = (newSettings) => {
    if (gridRef && gridRef.current && gridRef.current.updateSettings) {
      gridRef.current.updateSettings(newSettings);
    } else {
      console.warn('SacredGridAudio: Grid ref or updateSettings method not available');
    }
  };
  
  // Render controls for audio visualization
  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <div className="audioControls" style={{
        position: 'absolute',
        top: '70px',
        left: '20px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 200, 200, 0.3)',
        maxWidth: '250px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#00ffcc' }}>
          Audio Visualization Controls
        </h3>
        
        {/* Play/Pause button */}
        <button 
          onClick={togglePlayback}
          style={{
            backgroundColor: 'rgba(0, 50, 50, 0.8)',
            color: 'white',
            border: '1px solid rgba(0, 200, 200, 0.5)',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            outline: 'none',
            width: '100%'
          }}
        >
          {isPlaying ? 'Pause Audio' : 'Play Audio'}
        </button>
        
        {/* Visualization mode selection */}
        <div style={{ margin: '5px 0' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Visualization Mode:
          </label>
          <select 
            value={currentMode}
            onChange={(e) => setCurrentMode(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: '1px solid rgba(0, 200, 200, 0.5)',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            {visualizationModes.map(mode => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Intensity slider */}
        <div style={{ margin: '5px 0' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Response Intensity: {currentIntensity.toFixed(1)}
          </label>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={currentIntensity}
            onChange={(e) => setCurrentIntensity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#00ffcc' }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <animated.div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      ...beatAnimation
    }}>
      {/* Audio controls */}
      {renderControls()}
      
      {/* Audio connector to modify grid settings based on music */}
      {gridSettings && currentMode !== 'none' && (
        <GridAudioConnector
          audioElement={audioElement}
          gridSettings={gridSettings}
          onUpdateSettings={updateGridSettings}
          responseIntensity={currentIntensity}
          beatMultiplier={beatMultiplier}
          visualizationMode={currentMode}
        />
      )}
      
      {/* Sacred Grid visualization */}
      <SacredGrid 
        ref={gridRef} 
        onSettingsUpdate={getGridSettings} 
      />
    </animated.div>
  );
};

export default SacredGridAudio;