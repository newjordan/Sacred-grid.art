import React, { useState, useEffect, useRef } from 'react';
import SacredGrid from './SacredGrid';
import { GridAudioConnector } from './audioVisualizer';
import { useSpring, animated } from '@react-spring/web';

const MODES = [
  { value: 'none', label: 'No Reaction' },
  { value: 'react', label: 'Reactive' },
  { value: 'drive', label: 'Drive' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'breathe', label: 'Breathe' },
  { value: 'contour', label: 'Contour' },
];

const SacredGridAudio = ({ responseIntensity = 0.5, beatMultiplier = 1.5 }) => {
  const gridRef = useRef(null);
  const [audioEl, setAudioEl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState('react');
  const [intensity, setIntensity] = useState(responseIntensity);
  const [localUrl, setLocalUrl] = useState(null);
  const rotRef = useRef(0);

  const [anim, api] = useSpring(() => ({
    transform: 'rotate(0deg)',
    config: { tension: 280, friction: 24 }
  }));

  useEffect(() => {
    const a = new Audio(localUrl || '');
    a.loop = true;
    a.crossOrigin = 'anonymous';
    setAudioEl(a);
    a.addEventListener('play', () => setPlaying(true));
    a.addEventListener('pause', () => setPlaying(false));
    return () => { a.pause(); a.src = ''; };
  }, [localUrl]);

  const toggle = () => {
    if (!audioEl) return;
    playing ? audioEl.pause() : audioEl.play().catch(console.error);
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    if (f) setLocalUrl(URL.createObjectURL(f));
  };


  const updateSettings = (s) => {
    if (s._beat) {
      rotRef.current += 0.5;
      api.start({ transform: `rotate(${rotRef.current}deg)` });
      setTimeout(() => {
        rotRef.current -= 0.5;
        api.start({ transform: `rotate(${rotRef.current}deg)` });
      }, 300);
      delete s._beat;
    }
    if (gridRef?.current?.updateSettings) gridRef.current.updateSettings(s);
  };

  const panelStyle = {
    position: 'absolute', top: 60, left: 16, zIndex: 100,
    background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(0,200,200,0.3)',
    borderRadius: 8, padding: 14, width: 220,
    display: 'flex', flexDirection: 'column', gap: 8,
  };

  const btnStyle = {
    background: playing ? 'rgba(0,100,80,0.8)' : 'rgba(0,40,40,0.8)',
    color: '#fff', border: '1px solid rgba(0,200,200,0.5)',
    padding: '7px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
  };

  const selStyle = {
    width: '100%', background: 'rgba(0,0,0,0.8)', color: '#fff',
    border: '1px solid rgba(0,200,200,0.4)', padding: '6px 8px',
    borderRadius: 4, fontSize: 13,
  };

  return (
    <animated.div style={{ position: 'relative', width: '100%', height: '100%', ...anim }}>
      <div style={panelStyle}>
        <span style={{ color: '#00ffcc', fontWeight: 600, fontSize: 14 }}>Audio Visualization</span>
        <span style={{ color: '#888', fontSize: 11 }}>hide controls ↑ for best view</span>
        <input type="file" accept="audio/*" onChange={onFile} style={{ color: '#ccc', fontSize: 12 }} />
        <button style={btnStyle} onClick={toggle}>{playing ? 'Pause' : 'Play'}</button>
        <div>
          <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>Mode:</div>
          <select style={selStyle} value={mode} onChange={e => setMode(e.target.value)}>
            {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>Intensity: {intensity.toFixed(1)}</div>
          <input type="range" min="0.1" max="10" step="0.1" value={intensity}
            onChange={e => setIntensity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#00ffcc' }} />
        </div>
      </div>

      {mode !== 'none' && (
        <GridAudioConnector
          audioElement={audioEl}
          gridSettings={gridRef.current?.getSettings() || {}}
          onUpdateSettings={updateSettings}
          responseIntensity={intensity}
          beatMultiplier={beatMultiplier}
          visualizationMode={mode}
        />
      )}

      <SacredGrid ref={gridRef} />
    </animated.div>
  );
};

export default SacredGridAudio;
