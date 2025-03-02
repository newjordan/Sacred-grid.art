import React from 'react';
import SacredGrid from '../src/SacredGrid';

/**
 * BasicGrid Example
 * 
 * This example demonstrates a simple grid configuration.
 */
const BasicGridExample = () => {
  const settings = {
    grid: {
      size: 10,           // 10x10 grid
      spacing: 80,        // 80px between points
      baseDotSize: 3,     // Slightly larger dots
      connectionOpacity: 0.2, // Slightly more opaque connections
    },
    colors: {
      background: '#000022', // Dark blue background
      lineColor: '#00ff88',  // Bright teal lines
    },
    mouse: {
      influenceRadius: 180, // Slightly smaller influence area
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid initialSettings={settings} />
    </div>
  );
};

export default BasicGridExample;