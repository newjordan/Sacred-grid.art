// src/App.js
import React, { useState } from 'react';
import SacredGrid from './SacredGrid';
import SacredGridTest from './SacredGridTest.jsx';
import SacredGridComplete from './SacredGridComplete.jsx';
import SacredGridAdvanced from './SacredGridAdvanced.jsx';
import UIDemo from './components/UIDemoJS';
import './App.css';

function App() {
    const [currentView, setCurrentView] = useState('original'); // 'original', 'test', 'complete', 'advanced', 'demo'
    
    const getButtonText = () => {
        switch (currentView) {
            case 'original': return '🧪 View Test System';
            case 'test': return '🚀 View Complete System';
            case 'complete': return '⚡ View Advanced System';
            case 'advanced': return '✨ View UI Demo';
            case 'demo': return '← Back to Original';
            default: return '🧪 View Test System';
        }
    };

    const handleToggle = () => {
        switch (currentView) {
            case 'original': setCurrentView('test'); break;
            case 'test': setCurrentView('complete'); break;
            case 'complete': setCurrentView('advanced'); break;
            case 'advanced': setCurrentView('demo'); break;
            case 'demo': setCurrentView('original'); break;
        }
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case 'original': return <SacredGrid />;
            case 'test': return <SacredGridTest />;
            case 'complete': return <SacredGridComplete />;
            case 'advanced': return <SacredGridAdvanced />;
            case 'demo': return <UIDemo />;
            default: return <SacredGrid />;
        }
    };
    
    return (
        <div className="App">
            {/* Toggle Button */}
            <button
                onClick={handleToggle}
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
                    transition: 'all 0.3s ease',
                    fontSize: '14px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 119, 255, 1)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(0, 119, 255, 0.8)'}
            >
                {getButtonText()}
            </button>

            {/* Current View Indicator */}
            <div style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '15px',
                fontSize: '12px',
                backdropFilter: 'blur(10px)'
            }}>
                {currentView === 'original' && '📐 Original Sacred Grid'}
                {currentView === 'test' && '🧪 Test System'}
                {currentView === 'complete' && '🌟 Complete System'}
                {currentView === 'advanced' && '⚡ Advanced System'}
                {currentView === 'demo' && '✨ UI Demo'}
            </div>

            {renderCurrentView()}
        </div>
    );
}

export default App;
