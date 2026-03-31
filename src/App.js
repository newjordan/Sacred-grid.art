import React, { useState, useEffect, useRef } from 'react';
import SacredGrid from './SacredGrid';
import SacredGridAudio from './SacredGridAudio';
import './App.css';

function App() {
  const [audioMode, setAudioMode] = useState(false);
  const [fs, setFs] = useState(false);
  const [guiVisible, setGuiVisible] = useState(true);
  const gridRef = useRef(null);

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
        {guiVisible && (
          <>
            <button style={btn} onClick={toggleFullscreen}>
              {fs ? '✕ Exit Fullscreen' : '⛶ Fullscreen'}
            </button>
            <button style={{ ...btn, marginBottom: 0 }} onClick={() => setAudioMode(!audioMode)}>
              {audioMode ? '⬡ Grid Mode' : '◎ Audio Mode'}
            </button>
          </>
        )}

        <button
          aria-label="Toggle GUI"
          style={{ ...btn, marginTop: guiVisible ? '8px' : 0, marginBottom: 0, fontWeight: 700 }}
          onClick={() => setGuiVisible(!guiVisible)}
        >
          H
        </button>
      </div>

      {/* always mounted — settings survive mode switches */}
      <SacredGrid ref={gridRef} controlsVisible={guiVisible && !audioMode} guiVisible={guiVisible} />

      {audioMode && <SacredGridAudio gridRef={gridRef} guiVisible={guiVisible} />}
    </div>
  );
}

export default App;
