// src/audioVisualizer/GridAudioConnector.js
import React, { useEffect, useState, useMemo } from 'react';
import AudioAnalyzer from './AudioAnalyzer';
import { useSpring, animated } from '@react-spring/web';

// Component to connect audio analysis to the Sacred Grid settings
const GridAudioConnector = ({ 
  audioUrl = null,
  audioElement = null,
  gridSettings = {}, 
  onUpdateSettings = () => {}, 
  fftSize = 2048,
  children,
  responseIntensity = 0.5,  // How much the grid responds to audio (0-1)
  beatMultiplier = 1.5,     // How much to amplify on beats
  visualizationMode = 'react' // 'react', 'drive', 'pulse', 'breathe', 'contour', etc.
}) => {
  // Audio analyzer and state
  const [analyzer, setAnalyzer] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBeat, setIsBeat] = useState(false);
  
  // Energy bands for different responses
  const [energyBands, setEnergyBands] = useState({
    bass: 1,
    mid: 1,
    treble: 1,
    bassAtt: 1,
    midAtt: 1,
    trebleAtt: 1
  });
  
  // Spring animations for smoother transitions
  const [beatAnimation, setBeatAnimation] = useSpring(() => ({
    scale: 1,
    brightness: 1,
    config: {
      tension: 300,
      friction: 10 
    }
  }));
  
  // Initialize the audio analyzer
  useEffect(() => {
    const audioAnalyzer = new AudioAnalyzer({
      fftSize,
      audioUrl,
      onAudioLoaded: (audio) => {
        // If auto-play is required, you could add it here
      },
      onError: (msg, err) => {
        console.error("Audio error:", msg, err);
      },
    });
    
    setAnalyzer(audioAnalyzer);
    
    // Connect to audio element or initialize with URL
    if (audioElement) {
      audioAnalyzer.connectAudio(audioElement);
    } else {
      audioAnalyzer.initialize();
    }
    
    // Cleanup on unmount
    return () => {
      audioAnalyzer.disconnectAudio();
    };
  }, [audioUrl, audioElement, fftSize]);
  
  // Animation loop for audio analysis
  useEffect(() => {
    if (!analyzer) return;
    
    let animationFrame;
    
    const updateData = () => {
      if (analyzer.updateAudioData()) {
        const data = analyzer.getAudioData();
        setAudioData(data);
        setIsPlaying(data.isPlaying);
        setEnergyBands(data.energyBands);
        
        // Handle beat detection
        if (data.isBeat) {
          setIsBeat(true);
          
          // Trigger beat animation
          setBeatAnimation({
            scale: 1 + (beatMultiplier - 1) * responseIntensity,
            brightness: 1.5,
            config: { 
              tension: 300, 
              friction: data.energyBands.bassAtt > 1.5 ? 5 : 10 
            }
          });
          
          // Reset beat flag after a short time
          setTimeout(() => {
            setIsBeat(false);
            setBeatAnimation({
              scale: 1,
              brightness: 1,
              config: { tension: 200, friction: 15 }
            });
          }, 100);
        }
        
        // Apply audio data to grid settings
        applyAudioToGrid(data, visualizationMode);
      }
      
      animationFrame = requestAnimationFrame(updateData);
    };
    
    // Start the animation loop
    animationFrame = requestAnimationFrame(updateData);
    
    // Cleanup animation frame on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [analyzer, beatMultiplier, responseIntensity, visualizationMode]);
  
  // Apply audio data to sacred grid settings based on mode
  const applyAudioToGrid = (data, mode) => {
    if (!data || !data.energyBands) return;
    
    // Make a copy of current settings to modify
    let newSettings = { ...gridSettings };
    
    // Get energy values
    const { bass, mid, treble, bassAtt, midAtt, trebleAtt } = data.energyBands;
    
    // Common response factor based on response intensity
    const responseFactor = responseIntensity;
    
    // Apply different changes based on visualization mode
    switch (mode) {
      case 'react':
        // Basic reactive mode - moderate changes to several parameters
        newSettings = {
          ...newSettings,
          grid: {
            ...newSettings.grid,
            // Grid breathing speed increases with treble
            breathingSpeed: 0.0008 + (treble - 1) * 0.0004 * responseFactor,
            // Breathing intensity increases with bass hits
            breathingIntensity: 0.2 + (bassAtt - 1) * 0.15 * responseFactor,
            // Connection opacity fluctuates with mid
            connectionOpacity: 0.15 + (mid - 1) * 0.05 * responseFactor
          },
          shapes: {
            ...newSettings.shapes,
            primary: {
              ...newSettings.shapes?.primary,
              // Primary size pulses with bass
              size: newSettings.shapes?.primary?.size * (1 + (bass - 1) * 0.2 * responseFactor),
              // Animation speed follows treble
              animation: {
                ...newSettings.shapes?.primary?.animation,
                speed: 0.0008 + (treble - 1) * 0.0006 * responseFactor,
                intensity: 0.2 + (midAtt - 1) * 0.1 * responseFactor
              }
            }
          }
        };
        break;
        
      case 'drive':
        // Driving mode - more dramatic motion changes
        newSettings = {
          ...newSettings,
          grid: {
            ...newSettings.grid,
            // More aggressive breathing with bass
            breathingSpeed: 0.001 + bass * 0.0015 * responseFactor,
            breathingIntensity: 0.3 + bassAtt * 0.3 * responseFactor,
            // Noise intensity follows treble
            noiseIntensity: 1 + trebleAtt * 0.8 * responseFactor
          },
          shapes: {
            ...newSettings.shapes,
            primary: {
              ...newSettings.shapes?.primary,
              // More rotation with mid frequencies
              rotation: (newSettings.shapes?.primary?.rotation || 0) + mid * 0.5 * responseFactor,
              animation: {
                ...newSettings.shapes?.primary?.animation,
                speed: 0.001 + bassAtt * 0.002 * responseFactor,
                // Reverse direction on strong beats
                reverse: data.isBeat ? !newSettings.shapes?.primary?.animation?.reverse : 
                         newSettings.shapes?.primary?.animation?.reverse
              }
            }
          }
        };
        break;
        
      case 'pulse':
        // Pulsing mode - emphasizes beat detection
        newSettings = {
          ...newSettings,
          grid: {
            ...newSettings.grid,
            // Minimal breathing
            breathingSpeed: 0.0005,
            breathingIntensity: 0.1,
            // Line width pulses with beats
            lineWidthMultiplier: isBeat ? 
              1.5 + bassAtt * 0.5 * responseFactor : 
              1 + (bass - 1) * 0.1 * responseFactor,
            // Grid size can pulse with strong bass
            size: newSettings.grid.size * (1 + (bassAtt > 1.8 && isBeat ? 0.1 * responseFactor : 0))
          },
          shapes: {
            ...newSettings.shapes,
            primary: {
              ...newSettings.shapes?.primary,
              // Size pulses dramatically on beats
              size: isBeat ? 
                newSettings.shapes?.primary?.size * (1 + bassAtt * 0.3 * responseFactor) : 
                newSettings.shapes?.primary?.size * (1 + (bass - 1) * 0.05 * responseFactor),
              // Opacity increases on beats
              opacity: isBeat ? 
                0.7 + 0.3 * responseFactor : 
                0.5 + (mid - 1) * 0.1 * responseFactor
            }
          }
        };
        break;
        
      case 'breathe':
        // Breathing mode - subtle, ambient changes
        newSettings = {
          ...newSettings,
          grid: {
            ...newSettings.grid,
            // Slow, deep breathing based on bass
            breathingSpeed: 0.0005 + (bass - 1) * 0.0002 * responseFactor,
            breathingIntensity: 0.25 + bassAtt * 0.15 * responseFactor,
            // Subtle connection changes
            connectionOpacity: 0.12 + mid * 0.06 * responseFactor,
            baseDotSize: newSettings.grid.baseDotSize * (1 + (treble - 1) * 0.1 * responseFactor)
          },
          shapes: {
            ...newSettings.shapes,
            primary: {
              ...newSettings.shapes?.primary,
              // Slow, fluid animation
              animation: {
                ...newSettings.shapes?.primary?.animation,
                speed: 0.0005 + bassAtt * 0.0005 * responseFactor,
                intensity: 0.15 + mid * 0.1 * responseFactor
              },
              // Very slow rotation
              rotation: (newSettings.shapes?.primary?.rotation || 0) + 0.01 * responseFactor
            }
          }
        };
        break;
        
      case 'contour':
        // Contour mode - emphasizes shapes and outlines
        newSettings = {
          ...newSettings,
          grid: {
            ...newSettings.grid,
            // Less emphasis on grid
            connectionOpacity: 0.08 + mid * 0.04 * responseFactor,
            // Minimal grid breathing
            breathingIntensity: 0.1
          },
          shapes: {
            ...newSettings.shapes,
            primary: {
              ...newSettings.shapes?.primary,
              // Emphasize shape
              thickness: newSettings.shapes?.primary?.thickness * (1 + treble * 0.2 * responseFactor),
              // Size changes with bass
              size: newSettings.shapes?.primary?.size * (1 + (bass - 1) * 0.2 * responseFactor),
              // More vertices with higher treble
              vertices: Math.max(3, Math.floor(3 + trebleAtt * 2 * responseFactor)),
              animation: {
                ...newSettings.shapes?.primary?.animation,
                // Animation follows mid frequencies
                speed: 0.0008 + mid * 0.001 * responseFactor
              }
            }
          },
          lineFactory: {
            ...newSettings.lineFactory,
            // Increase glow with treble
            glow: {
              ...newSettings.lineFactory?.glow,
              intensity: (newSettings.lineFactory?.glow?.intensity || 0) + trebleAtt * 5 * responseFactor
            }
          }
        };
        break;
  
      default:
        // No changes
        break;
    }
    
    // Apply the updated settings
    onUpdateSettings(newSettings);
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Render children with additional audio props */}
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          audioData, 
          isPlaying,
          isBeat,
          energyBands,
          beatAnimation
        })
      )}
    </div>
  );
};

export default GridAudioConnector;