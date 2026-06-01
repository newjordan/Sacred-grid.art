// src/audioVisualizer/F181HarmonicVisualizer.js
//
// Standalone full-screen overlay that visualizes the F181 harmonic address
// system driven by an audio file. The 12×15 lattice (180 cells + source)
// is rendered as a chromatic field; the decagon orbit containing 1 is
// overlaid as a phase-rotating polygon, with the next two most-active
// orbits inset. Hue = 30°·p (panel chromatic map). Brightness = orbit
// address energy from FFT. Rotation = chronometric phase law θ_Δ(t).

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AudioAnalyzer from './AudioAnalyzer';
import {
  extractAddressEnergy,
  aggregateOrbitEnergy,
  topKOrbits,
  chronoPhase,
  CANONICAL_DECAGON,
  ORBITS,
  ORBIT_INDEX,
  TOTAL_ADDRESSES,
  ORBIT_COUNT,
  OCTAVE_LAYERS,
  PITCH_CLASSES,
  octavePitchFromAddress,
  pitchClassToHue,
} from './F181HarmonicAddressing';

const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const F181HarmonicVisualizer = ({ isVisible, onClose }) => {
  const canvasRef = useRef(null);
  const audioElRef = useRef(null);
  const analyzerRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef({
    addressEnergy: new Float32Array(TOTAL_ADDRESSES),
    smoothed: new Float32Array(TOTAL_ADDRESSES),
    orbitEnergy: new Float32Array(ORBIT_COUNT),
    topOrbits: [],
    startMs: 0,
    fileName: null,
    hasAudio: false,
  });

  const [fileName, setFileName] = useState(null);
  const [sourceLabel, setSourceLabel] = useState(null); // 'file' | 'capture'
  const [hasAudio, setHasAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Lazy analyzer init on first show
  useEffect(() => {
    if (!isVisible) return;
    if (!analyzerRef.current) {
      const a = new AudioAnalyzer({ fftSize: 2048, smoothingTimeConstant: 0.7 });
      a.initialize();
      analyzerRef.current = a;
      stateRef.current.startMs = performance.now();
    }
  }, [isVisible]);

  // Permanent cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (analyzerRef.current) analyzerRef.current.disconnectAudio();
      if (audioElRef.current) {
        audioElRef.current.pause();
        if (audioElRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioElRef.current.src);
        }
      }
    };
  }, []);

  // Resize the backing canvas
  useEffect(() => {
    if (!isVisible) return;
    const sync = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.floor(window.innerWidth * dpr);
      c.height = Math.floor(window.innerHeight * dpr);
      c.style.width = '100%';
      c.style.height = '100%';
      c.dataset.dpr = String(dpr);
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [isVisible]);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setFileName(file.name);
    stateRef.current.fileName = file.name;

    if (audioElRef.current) {
      audioElRef.current.pause();
      if (audioElRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioElRef.current.src);
      }
    }

    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.crossOrigin = 'anonymous';
    audio.loop = true;
    audio.addEventListener('canplaythrough', () => {
      try {
        analyzerRef.current.connectAudio(audio);
        audio.play().catch((err) => setErrorMsg('Playback blocked: ' + err.message));
        setHasAudio(true);
        stateRef.current.hasAudio = true;
      } catch (err) {
        setErrorMsg('Connect failed: ' + err.message);
      }
    });
    audio.addEventListener('error', () => setErrorMsg('Failed to load audio file'));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audioElRef.current = audio;
    setSourceLabel('file');
    setIsCapturing(false);
  }, []);

  const captureSystemAudio = useCallback(async () => {
    setErrorMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setErrorMsg('Browser does not support getDisplayMedia. Use Chrome or Edge.');
      return;
    }
    try {
      // Stop any prior file playback so we don't double-feed.
      if (audioElRef.current) {
        audioElRef.current.pause();
        if (audioElRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioElRef.current.src);
        }
        audioElRef.current = null;
      }

      // Need video=true on Chrome for "Share tab audio" checkbox to appear.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        setErrorMsg('No audio in shared source. In the picker, choose a tab and tick "Share tab audio".');
        return;
      }
      // We don't need the video — stop video tracks immediately.
      stream.getVideoTracks().forEach((t) => t.stop());

      const ok = analyzerRef.current.connectStream(stream);
      if (!ok) {
        setErrorMsg('Failed to connect captured stream.');
        return;
      }
      // If the user stops sharing from the browser bar, reflect it in UI.
      audioTracks[0].addEventListener('ended', () => {
        setIsCapturing(false);
        setHasAudio(false);
        setIsPlaying(false);
      });
      setSourceLabel('capture');
      setFileName(null);
      setHasAudio(true);
      setIsPlaying(true);
      setIsCapturing(true);
    } catch (err) {
      if (err && err.name === 'NotAllowedError') {
        setErrorMsg('Permission denied. Click again and approve the share prompt.');
      } else {
        setErrorMsg('Capture failed: ' + (err && err.message ? err.message : err));
      }
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (analyzerRef.current) analyzerRef.current.disconnectAudio();
    setIsCapturing(false);
    setHasAudio(false);
    setIsPlaying(false);
    setSourceLabel(null);
  }, []);

  const togglePlay = () => {
    const a = audioElRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  };

  // Animation loop
  useEffect(() => {
    if (!isVisible) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return undefined;
    }

    const tick = () => {
      const c = canvasRef.current;
      const analyzer = analyzerRef.current;
      const s = stateRef.current;
      if (!c || !analyzer) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = c.getContext('2d');
      const W = c.width;
      const H = c.height;
      const dpr = parseFloat(c.dataset.dpr || '1');

      let totalEnergy = 0;
      if (analyzer.updateAudioData()) {
        const sr = analyzer.audioContext.sampleRate;
        const fft = analyzer.config.fftSize;
        extractAddressEnergy(analyzer.frequencyData, sr, fft, s.addressEnergy);
        for (let i = 0; i < TOTAL_ADDRESSES; i++) {
          s.smoothed[i] = s.smoothed[i] * 0.6 + s.addressEnergy[i] * 0.4;
          totalEnergy += s.smoothed[i];
        }
        aggregateOrbitEnergy(s.smoothed, s.orbitEnergy);
        s.topOrbits = topKOrbits(s.orbitEnergy, 3);
      } else {
        for (let i = 0; i < TOTAL_ADDRESSES; i++) {
          s.smoothed[i] *= 0.95;
          totalEnergy += s.smoothed[i];
        }
      }

      // Background fade trail
      ctx.fillStyle = 'rgba(5, 5, 12, 0.78)';
      ctx.fillRect(0, 0, W, H);

      drawLattice(ctx, W, H, s.smoothed);

      const tSec = (performance.now() - s.startMs) / 1000;
      const phase = chronoPhase(tSec, 1, 1);

      // Canonical decagon (orbit of 1) — primary overlay
      drawDecagon(ctx, W, H, s.smoothed, CANONICAL_DECAGON, {
        radius: Math.min(W, H) * 0.34,
        rotation: phase,
        lineWidth: 2 * dpr,
        baseAlpha: 0.9,
      });

      // Up to two non-canonical top orbits, inset
      const canonicalIdx = ORBIT_INDEX[1];
      let drawn = 0;
      for (const top of s.topOrbits) {
        if (top.orbitIdx === canonicalIdx) continue;
        if (drawn >= 2) break;
        if (top.energy < 0.05) break;
        drawDecagon(ctx, W, H, s.smoothed, ORBITS[top.orbitIdx], {
          radius: Math.min(W, H) * (0.22 - drawn * 0.07),
          rotation: -phase + (drawn + 1) * (Math.PI / 5),
          lineWidth: 1.2 * dpr,
          baseAlpha: 0.55 - drawn * 0.18,
        });
        drawn++;
      }

      drawSourceCore(ctx, W, H, totalEnergy, dpr);
      drawHUD(ctx, W, H, dpr, s.topOrbits);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div style={overlayStyle}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      <div style={titleStyle}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>F181 HARMONIC ADDRESS</div>
        <div style={{ opacity: 0.55, marginTop: 4, fontSize: 11, letterSpacing: 1 }}>
          15 octaves × 12 chromas · 18 decagon orbits · ζ₁₀ = 56
        </div>
      </div>

      <div style={controlsStyle}>
        <label style={glassButtonStyle}>
          {fileName && sourceLabel === 'file'
            ? '🎵 ' + truncate(fileName, 22)
            : 'Load audio'}
          <input type="file" accept="audio/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        <button
          type="button"
          onClick={isCapturing ? stopCapture : captureSystemAudio}
          style={{
            ...glassButtonStyle,
            background: isCapturing
              ? 'rgba(220, 80, 110, 0.35)'
              : glassButtonStyle.background,
          }}
          title="Capture tab/system audio (pick a tab and enable 'Share tab audio')"
        >
          {isCapturing ? '⏹ Capturing' : '🎙 Capture audio'}
        </button>
        {hasAudio && sourceLabel === 'file' && (
          <button type="button" onClick={togglePlay} style={glassButtonStyle}>
            {isPlaying ? '⏸' : '▶'}
          </button>
        )}
        <button type="button" onClick={onClose} style={glassButtonStyle} aria-label="Close">✕</button>
      </div>

      {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
      {!hasAudio && (
        <div style={hintStyle}>
          Load a file or click <b>Capture audio</b> to share a tab/window with audio
          (Chrome/Edge: tick <i>“Share tab audio”</i> in the picker). Pitch class → hue,
          octave → row, decagon → chronometric phase.
        </div>
      )}
    </div>
  );
};

// === drawing helpers ===

function drawLattice(ctx, W, H, energy) {
  const pad = Math.min(W, H) * 0.04;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;
  const cellW = innerW / PITCH_CLASSES;
  const cellH = innerH / OCTAVE_LAYERS;
  const cellMin = Math.min(cellW, cellH);
  const maxR = cellMin * 0.45;

  for (let o = 1; o <= OCTAVE_LAYERS; o++) {
    for (let p = 0; p < PITCH_CLASSES; p++) {
      const n = 1 + 12 * (o - 1) + p;
      const e = Math.min(1.5, energy[n]);
      const cx = pad + (p + 0.5) * cellW;
      const cy = pad + (o - 0.5) * cellH;

      const hue = 30 * p;
      const lightness = 6 + Math.min(60, e * 95);
      const r = Math.max(1.5, maxR * (0.18 + Math.min(1, e) * 0.82));

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `hsla(${hue}, 95%, ${Math.min(80, lightness + 18)}%, ${0.35 + Math.min(0.6, e * 0.6)})`);
      grad.addColorStop(1, `hsla(${hue}, 95%, ${Math.max(4, lightness - 6)}%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawDecagon(ctx, W, H, energy, orbit, opts) {
  const cx = W / 2;
  const cy = H / 2;
  const { radius, rotation, lineWidth, baseAlpha } = opts;

  const verts = [];
  for (let i = 0; i < orbit.length; i++) {
    const angle = rotation + (i / orbit.length) * Math.PI * 2 - Math.PI / 2;
    const a = orbit[i];
    const e = Math.min(1.2, energy[a] || 0);
    const r = radius * (1 + e * 0.18);
    verts.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      address: a,
      energy: e,
    });
  }

  // Edges
  ctx.lineWidth = lineWidth;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const avgE = (a.energy + b.energy) * 0.5;
    const hueA = pitchClassToHue(octavePitchFromAddress(a.address).pitchClass);
    const hueB = pitchClassToHue(octavePitchFromAddress(b.address).pitchClass);
    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    grad.addColorStop(0, `hsla(${hueA}, 95%, 65%, ${baseAlpha * (0.4 + avgE * 0.7)})`);
    grad.addColorStop(1, `hsla(${hueB}, 95%, 65%, ${baseAlpha * (0.4 + avgE * 0.7)})`);
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // Vertices
  for (const v of verts) {
    const { pitchClass, octave } = octavePitchFromAddress(v.address);
    const hue = pitchClassToHue(pitchClass);
    const r = lineWidth * 1.5 + v.energy * 14;
    const grad = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, r * 2);
    grad.addColorStop(0, `hsla(${hue}, 95%, 75%, ${baseAlpha})`);
    grad.addColorStop(1, `hsla(${hue}, 95%, 50%, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(v.x, v.y, r * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${hue}, 95%, 80%, ${baseAlpha})`;
    ctx.beginPath();
    ctx.arc(v.x, v.y, Math.max(2, r * 0.55), 0, Math.PI * 2);
    ctx.fill();

    // Note label on canonical decagon
    if (baseAlpha > 0.7) {
      ctx.font = `${Math.max(10, lineWidth * 5)}px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${baseAlpha * 0.65})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${PITCH_NAMES[pitchClass]}${octave}`, v.x, v.y - r - 10);
    }
  }
}

function drawSourceCore(ctx, W, H, totalEnergy, dpr) {
  const cx = W / 2;
  const cy = H / 2;
  const pulse = Math.min(1, totalEnergy / 30);
  const r = (4 + pulse * 12) * dpr;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4);
  grad.addColorStop(0, `rgba(255,255,255,${0.55 + pulse * 0.4})`);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawHUD(ctx, W, H, dpr, topOrbits) {
  ctx.save();
  ctx.font = `${11 * dpr}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  let x = 20 * dpr;
  const y = H - 30 * dpr;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('TOP ORBITS', x, y - 18 * dpr);

  for (let i = 0; i < topOrbits.length && i < 3; i++) {
    const o = topOrbits[i];
    if (o.energy <= 0) continue;
    const orbit = ORBITS[o.orbitIdx];
    const { pitchClass } = octavePitchFromAddress(orbit[0]);
    const hue = pitchClassToHue(pitchClass);
    ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
    ctx.fillRect(x, y - 7 * dpr, 14 * dpr, 14 * dpr);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(`#${String(o.orbitIdx).padStart(2, '0')}`, x + 22 * dpr, y);
    const barLen = Math.min(80, o.energy * 6) * dpr;
    ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.85)`;
    ctx.fillRect(x + 50 * dpr, y - 2 * dpr, barLen, 4 * dpr);
    x += 150 * dpr;
  }
  ctx.restore();
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// === styles ===

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 500,
  background: '#05050c',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const titleStyle = {
  position: 'absolute',
  top: 20,
  left: 20,
  color: 'rgba(255,255,255,0.92)',
  textShadow: '0 0 12px rgba(0,0,0,0.6)',
  pointerEvents: 'none',
};

const controlsStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
  display: 'flex',
  gap: 10,
};

const glassButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 44,
  height: 44,
  padding: '0 14px',
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: 'white',
  borderRadius: 12,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
};

const errorStyle = {
  position: 'absolute',
  bottom: 80,
  left: 20,
  color: '#ff6680',
  background: 'rgba(20,5,10,0.7)',
  padding: '8px 14px',
  borderRadius: 8,
  fontSize: 12,
};

const hintStyle = {
  position: 'absolute',
  bottom: 20,
  right: 20,
  maxWidth: 360,
  textAlign: 'right',
  color: 'rgba(255,255,255,0.5)',
  fontSize: 11,
  lineHeight: 1.5,
  letterSpacing: 0.5,
  pointerEvents: 'none',
};

export default F181HarmonicVisualizer;
