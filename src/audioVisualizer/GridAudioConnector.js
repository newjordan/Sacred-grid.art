// src/audioVisualizer/GridAudioConnector.js
import React, { useEffect, useState } from 'react';
import AudioAnalyzer from './AudioAnalyzer';
import { useSpring } from '@react-spring/web';

const GridAudioConnector = ({
  audioUrl = null,
  audioElement = null,
  gridSettings = {},
  onUpdateSettings = () => {},
  fftSize = 2048,
  children,
  responseIntensity = 0.5,
  beatMultiplier = 1.5,
  visualizationMode = 'react'
}) => {
  const [analyzer, setAnalyzer] = useState(null);
  const [isBeat, setIsBeat] = useState(false);

  const [, setBeatAnimation] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 }
  }));

  useEffect(() => {
    const audioAnalyzer = new AudioAnalyzer({
      fftSize,
      audioUrl,
      onError: (msg, err) => console.error('Audio error:', msg, err),
    });

    setAnalyzer(audioAnalyzer);

    if (audioElement) {
      audioAnalyzer.connectAudio(audioElement);
    } else {
      audioAnalyzer.initialize();
    }

    return () => audioAnalyzer.disconnectAudio();
  }, [audioUrl, audioElement, fftSize]);

  useEffect(() => {
    if (!analyzer) return;

    let animationFrame;

    const update = () => {
      if (analyzer.updateAudioData()) {
        const data = analyzer.getAudioData();

        if (data.isBeat) {
          setIsBeat(true);
          setBeatAnimation({ scale: 1 + (beatMultiplier - 1) * responseIntensity });
          setTimeout(() => {
            setIsBeat(false);
            setBeatAnimation({ scale: 1 });
          }, 100);
        }

        applyAudioToGrid(data, visualizationMode, analyzer.frequencyData);
      }

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [analyzer, beatMultiplier, responseIntensity, visualizationMode, isBeat]);

  // Slice frequencyData into N bands, return normalized 0-1 values
  const getVertexFrequencies = (frequencyData, vertexCount) => {
    if (!frequencyData || !vertexCount) return null;
    const binCount = frequencyData.length;
    const bands = [];
    const bandSize = Math.floor(binCount / vertexCount);

    for (let i = 0; i < vertexCount; i++) {
      const start = i * bandSize;
      const end = start + bandSize;
      let sum = 0;
      for (let j = start; j < end; j++) sum += frequencyData[j];
      bands.push((sum / bandSize) / 255);
    }

    return bands;
  };

  const applyAudioToGrid = (data, mode, frequencyData) => {
    if (!data || !data.energyBands) return;

    const { bass, mid, treble, bassAtt, midAtt, trebleAtt } = data.energyBands;
    const r = responseIntensity;

    const primary = gridSettings?.shapes?.primary || {};
    const vertexCount = primary.vertices || 6;
    const vertexFrequencies = getVertexFrequencies(frequencyData, vertexCount);

    // only send a delta of audio-owned properties — never touch mouse, grid, xyGrid etc
    let primaryDelta = { vertexFrequencies };

    switch (mode) {
      case 'react':
        primaryDelta = {
          ...primaryDelta,
          size: (primary.size || 350) * (1 + (bass - 1) * 0.2 * r),
          thickness: (primary.thickness || 6) * (1 + (mid - 1) * 0.15 * r),
          animation: {
            ...primary.animation,
            speed: 0.0008 + (treble - 1) * 0.0006 * r,
            intensity: 0.2 + (midAtt - 1) * 0.1 * r,
          },
          vertexAudioIntensity: r * 0.4,
        };
        break;

      case 'drive':
        primaryDelta = {
          ...primaryDelta,
          size: (primary.size || 350) * (1 + bassAtt * 0.3 * r),
          rotation: ((primary.rotation || 0) + mid * 0.5 * r) % 360,
          thickness: (primary.thickness || 6) * (1 + treble * 0.2 * r),
          animation: {
            ...primary.animation,
            speed: 0.001 + bassAtt * 0.002 * r,
            reverse: data.isBeat ? !primary.animation?.reverse : primary.animation?.reverse,
          },
          vertexAudioIntensity: r * 0.6,
        };
        break;

      case 'pulse':
        primaryDelta = {
          ...primaryDelta,
          size: isBeat
            ? (primary.size || 350) * (1 + bassAtt * 0.3 * r)
            : (primary.size || 350) * (1 + (bass - 1) * 0.05 * r),
          opacity: isBeat ? 0.7 + 0.3 * r : 0.5 + (mid - 1) * 0.1 * r,
          thickness: isBeat
            ? (primary.thickness || 6) * (1.5 + bassAtt * 0.5 * r)
            : primary.thickness || 6,
          vertexAudioIntensity: r * 0.8,
        };
        break;

      case 'breathe':
        primaryDelta = {
          ...primaryDelta,
          size: (primary.size || 350) * (1 + (bassAtt - 1) * 0.15 * r),
          animation: {
            ...primary.animation,
            speed: 0.0005 + bassAtt * 0.0005 * r,
            intensity: 0.15 + mid * 0.1 * r,
          },
          rotation: ((primary.rotation || 0) + 0.01 * r) % 360,
          vertexAudioIntensity: r * 0.25,
        };
        break;

      case 'contour':
        primaryDelta = {
          ...primaryDelta,
          size: (primary.size || 350) * (1 + (bass - 1) * 0.2 * r),
          thickness: (primary.thickness || 6) * (1 + treble * 0.2 * r),
          animation: {
            ...primary.animation,
            speed: 0.0008 + mid * 0.001 * r,
          },
          vertexAudioIntensity: r * 0.5,
        };
        break;

      default:
        break;
    }

    // merge only the shapes.primary delta — everything else in gridSettings is untouched
    onUpdateSettings({
      ...gridSettings,
      shapes: {
        ...gridSettings.shapes,
        primary: {
          ...primary,
          ...primaryDelta,
        },
      },
    });
  };

  return <>{children}</>;
};

export default GridAudioConnector;
