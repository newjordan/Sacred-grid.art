// src/App.js
import React, { useState } from 'react';
import SacredGrid from './SacredGrid';
import UIDemo from './components/UIDemoJS';
import './App.css';

function App() {
    const [showDemo, setShowDemo] = useState(false);
    
    return (
        <div className="App">
            {/* Toggle Button */}
            <button
                onClick={() => setShowDemo(!showDemo)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    backgroundColor: 'rgba(0, 119, 255, 0.8)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 119, 255, 1)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(0, 119, 255, 0.8)'}
            >
                {showDemo ? '← Back to Sacred Grid' : '✨ View New UI Demo'}
            </button>

            {showDemo ? <UIDemo /> : <SacredGrid />}
        </div>
    );
}

export default App;
