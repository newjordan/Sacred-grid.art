// src/audioVisualizer/GridAudioConnector.js
import React, { useEffect, useRef, useState } from 'react';
import AudioAnalyzer from './AudioAnalyzer';
import { useSpring } from '@react-spring/web';
import {
  extractAddressEnergy,
  aggregateOrbitEnergy,
  topKOrbits,
  orbitsToGradientPalette,
  chronoPhase,
  TOTAL_ADDRESSES,
  ORBIT_COUNT,
} from './F181HarmonicAddressing';

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const GridAudioConnector = ({
  audioUrl = null,
  audioElement = null,
  getSettings = () => ({}),
  onUpdateSettings = () => {},
  fftSize = 2048,
  children,
  responseIntensity = 0.5,
  beatMultiplier = 1.5,
  visualizationMode = 'react'
}) => {
  const [analyzer, setAnalyzer] = useState(null);
  const [isBeat, setIsBeat] = useState(false);
  const harmonicStateRef = useRef({
    addressEnergy: new Float32Array(TOTAL_ADDRESSES),
    orbitEnergy: new Float32Array(ORBIT_COUNT),
    startMs: typeof performance !== 'undefined' ? performance.now() : Date.now(),
  });

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
  }, [analyzer, beatMultiplier, responseIntensity, visualizationMode]);

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

    const gridSettings = getSettings();
    if (!gridSettings || Object.keys(gridSettings).length === 0) return;

    const { bass, mid, treble, bassAtt, midAtt, trebleAtt } = data.energyBands;
    const r = responseIntensity;

    const primary = gridSettings?.shapes?.primary || {};
    const baseSize = primary.size || 350;
    const baseThickness = primary.thickness || 6;
    const baseOpacity = primary.opacity || 1.0;
    const baseRotation = primary.rotation || 0;
    const vertexCount = primary.vertices || 6;
    const vertexFrequencies = getVertexFrequencies(frequencyData, vertexCount);

    let primaryDelta = { vertexFrequencies };

    switch (mode) {
      case 'react':
        primaryDelta = {
          ...primaryDelta,
          size: baseSize * clamp(1 + (bass - 1) * 0.2 * r, 0.5, 3),
          thickness: baseThickness * clamp(1 + (mid - 1) * 0.15 * r, 0.5, 3),
          animation: {
            ...primary.animation,
            speed: 0.0008 + Math.max(0, treble - 1) * 0.0006 * r,
            intensity: clamp(0.2 + (midAtt - 1) * 0.1 * r, 0.05, 1),
          },
          vertexAudioIntensity: r * 0.4,
        };
        break;

      case 'drive':
        primaryDelta = {
          ...primaryDelta,
          size: baseSize * clamp(1 + bassAtt * 0.3 * r, 0.5, 3),
          rotation: (baseRotation + mid * 0.5 * r) % 360,
          thickness: baseThickness * clamp(1 + treble * 0.2 * r, 0.5, 3),
          animation: {
            ...primary.animation,
            speed: clamp(0.001 + bassAtt * 0.002 * r, 0.0001, 0.01),
            reverse: data.isBeat ? !primary.animation?.reverse : primary.animation?.reverse,
          },
          vertexAudioIntensity: r * 0.6,
        };
        break;

      case 'pulse':
        primaryDelta = {
          ...primaryDelta,
          size: isBeat
            ? baseSize * clamp(1 + bassAtt * 0.3 * r, 0.5, 3)
            : baseSize * clamp(1 + (bass - 1) * 0.05 * r, 0.8, 1.5),
          opacity: clamp(isBeat ? 0.7 + 0.3 * r : baseOpacity * clamp(0.8 + mid * 0.2 * r, 0.5, 1), 0.3, 1),
          thickness: isBeat
            ? baseThickness * clamp(1.5 + bassAtt * 0.5 * r, 1, 5)
            : baseThickness,
          vertexAudioIntensity: r * 0.8,
        };
        break;

      case 'breathe':
        primaryDelta = {
          ...primaryDelta,
          size: baseSize * clamp(1 + (bassAtt - 1) * 0.15 * r, 0.7, 1.5),
          animation: {
            ...primary.animation,
            speed: clamp(0.0005 + bassAtt * 0.0005 * r, 0.0001, 0.005),
            intensity: clamp(0.15 + mid * 0.1 * r, 0.05, 0.8),
          },
          rotation: (baseRotation + 0.01 * r) % 360,
          vertexAudioIntensity: r * 0.25,
        };
        break;

      case 'contour':
        primaryDelta = {
          ...primaryDelta,
          size: baseSize * clamp(1 + (bass - 1) * 0.2 * r, 0.5, 3),
          thickness: baseThickness * clamp(1 + treble * 0.2 * r, 0.5, 4),
          animation: {
            ...primary.animation,
            speed: clamp(0.0008 + mid * 0.001 * r, 0.0001, 0.01),
          },
          vertexAudioIntensity: r * 0.5,
        };
        break;

      case 'harmonic': {
        if (!analyzer?.audioContext || !frequencyData) break;

        const hState = harmonicStateRef.current;
        const addressEnergy = extractAddressEnergy(
          frequencyData,
          analyzer.audioContext.sampleRate,
          analyzer.config.fftSize,
          hState.addressEnergy
        );
        const orbitEnergy = aggregateOrbitEnergy(addressEnergy, hState.orbitEnergy);
        const top = topKOrbits(orbitEnergy, 3);
        const totalTopEnergy = top.reduce((sum, orbit) => sum + orbit.energy, 0);
        const intensity = Math.min(1, totalTopEnergy / 6);
        const tSec = ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - hState.startMs) / 1000;
        const phaseRad = chronoPhase(tSec, 1, 1);
        const rotationDeg = ((phaseRad * 180 / Math.PI) % 360 + 360) % 360;

        primaryDelta = {
          ...primaryDelta,
          vertices: 10,
          rotation: rotationDeg,
          opacity: clamp(0.5 + intensity * 0.4 * r, 0.3, 1),
          animation: {
            ...primary.animation,
            speed: 0.0005 + intensity * 0.001 * r,
            intensity: clamp(0.15 + midAtt * 0.2 * r, 0.05, 1),
          },
          vertexAudioIntensity: r,
        };

        onUpdateSettings({
          ...gridSettings,
          grid: {
            ...gridSettings.grid,
            breathingSpeed: 0.0006 + intensity * 0.001 * r,
            breathingIntensity: 0.15 + bassAtt * 0.2 * r,
            connectionOpacity: 0.1 + intensity * 0.15 * r,
            lineWidthMultiplier: 1 + (data.isBeat ? 0.4 : 0) * r,
          },
          colors: {
            ...gridSettings.colors,
            gradient: {
              ...gridSettings.colors?.gradient,
              lines: {
                ...gridSettings.colors?.gradient?.lines,
                enabled: true,
                colors: orbitsToGradientPalette(top, {
                  saturation: 0.9,
                  baseLightness: 0.5,
                  energyBoost: 0.15,
                }),
              },
              dots: {
                ...gridSettings.colors?.gradient?.dots,
                enabled: true,
                colors: orbitsToGradientPalette(top, {
                  saturation: 0.7,
                  baseLightness: 0.4,
                  energyBoost: 0.2,
                }),
              },
              shapes: {
                ...gridSettings.colors?.gradient?.shapes,
                enabled: true,
                colors: orbitsToGradientPalette(top, {
                  saturation: 1,
                  baseLightness: 0.55,
                  energyBoost: 0.1,
                }),
              },
            },
          },
          shapes: {
            ...gridSettings.shapes,
            primary: {
              ...primary,
              ...primaryDelta,
            },
          },
          lineFactory: {
            ...gridSettings.lineFactory,
            glow: {
              ...gridSettings.lineFactory?.glow,
              intensity: (gridSettings.lineFactory?.glow?.intensity || 0) +
                trebleAtt * 4 * r +
                (data.isBeat ? 6 : 0),
            },
          },
        });
        return;
      }

      default:
        break;
    }

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
