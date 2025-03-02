// src/App.js
import React, { useState } from 'react';
import SacredGrid from './SacredGrid';
import SacredGridAudio from './SacredGridAudio';
import { AudioVisualizer } from './audioVisualizer';
import './App.css';

function App() {
    const [visualizerType, setVisualizerType] = useState('both');
    
    // Sample audio from a CDN
    const sampleAudioUrl = 'https://cdn.freesound.org/previews/669/669214_1648170-lq.mp3';
    
    // App display mode
    const [displayMode, setDisplayMode] = useState('grid'); // 'grid', 'audioGrid', 'visualizer'
    
    const renderControls = () => {
        return (
            <div className="controls">
                <select 
                    value={displayMode} 
                    onChange={(e) => setDisplayMode(e.target.value)}
                >
                    <option value="grid">Sacred Grid</option>
                    <option value="audioGrid">Sacred Grid + Audio</option>
                    <option value="visualizer">Audio Visualizer</option>
                </select>
                
                {displayMode === 'visualizer' && (
                    <select 
                        value={visualizerType} 
                        onChange={(e) => setVisualizerType(e.target.value)}
                        style={{ marginLeft: '10px' }}
                    >
                        <option value="both">Waveform & Bars</option>
                        <option value="waveform">Waveform Only</option>
                        <option value="frequency">Frequency Bars Only</option>
                        <option value="circular">Circular Mode</option>
                    </select>
                )}
            </div>
        );
    };
    
    const renderContent = () => {
        switch (displayMode) {
            case 'audioGrid':
                return <SacredGridAudio />;
                
            case 'visualizer':
                return (
                    <div className="audioVisualizerContainer">
                        <h2>Music Visualization</h2>
                        <AudioVisualizer
                            audioUrl={sampleAudioUrl}
                            visualizerType={visualizerType}
                            height={500}
                            backgroundColor="rgba(0, 0, 0, 0.8)"
                            waveColor="rgba(0, 255, 200, 0.8)"
                            freqColor="#00ffcc"
                            frequencyBarOptions={{
                                barWidth: 3,
                                barSpacing: 1,
                                barCornerRadius: 1,
                                gradient: {
                                    start: 'rgba(0, 100, 150, 0.8)',
                                    end: 'rgba(0, 255, 200, 0.8)'
                                }
                            }}
                            waveformOptions={{
                                lineWidth: 2,
                                fillColor: 'rgba(0, 100, 150, 0.1)',
                                symmetric: true
                            }}
                            analyzerOptions={{
                                smoothingTimeConstant: 0.8,
                                fftSize: 1024
                            }}
                            onBeat={(data) => {
                                // Can respond to beats here if needed
                                console.log('Beat detected!', data.energyBands);
                            }}
                        />
                    </div>
                );
                
            case 'grid':
            default:
                return <SacredGrid />;
        }
    };
    
    return (
        <div className="App">
            {renderControls()}
            {renderContent()}
        </div>
    );
}

export default App;
