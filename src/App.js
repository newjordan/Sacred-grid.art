import React, { useState, useEffect } from 'react';
import SacredGrid from './SacredGrid';
import SacredGridAudio from './SacredGridAudio';
import './App.css';

function App() {
  const [audioMode, setAudioMode] = useState(false);
  const [fs, setFs] = useState(false);

  useEffect(() => {
    const handler = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const btn = {
    display: 'block', width: '100%', marginBottom: '6px',
    background: 'rgba(0,0,0,0.7)', color: '#00ffcc',
    border: '1px solid rgba(0,200,200,0.4)',
    borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
    padding: '8px 16px',
  };

  return (
    <div className="App">
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        <button style={btn} onClick={toggleFullscreen}>
          {fs ? '✕ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
        <button style={{ ...btn, marginBottom: 0 }} onClick={() => setAudioMode(!audioMode)}>
          {audioMode ? '⬡ Grid Mode' : '◎ Audio Mode'}
        </button>
      </div>
      {audioMode ? <SacredGridAudio /> : <SacredGrid />}
    </div>
  );
}

export default App;
