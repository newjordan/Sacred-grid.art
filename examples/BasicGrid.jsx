import React, { useEffect, useRef } from 'react';
import SacredGrid from '../src/SacredGrid';

/**
 * BasicGrid Example
 *
 * This example demonstrates a simple grid configuration.
 */
const BasicGridExample = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Start from the live settings, apply the overrides, then push them back.
    const settings = grid.getSettings();
    settings.grid.size = 10;                // 10x10 grid
    settings.grid.spacing = 80;             // 80px between points
    settings.grid.baseDotSize = 3;          // Slightly larger dots
    settings.grid.connectionOpacity = 0.2;  // Slightly more opaque connections
    settings.colors.background = '#000022'; // Dark blue background
    settings.colors.lineColor = '#00ff88';  // Bright teal lines
    settings.mouse.influenceRadius = 180;   // Slightly smaller influence area
    grid.updateSettings(settings);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid ref={gridRef} />
    </div>
  );
};

export default BasicGridExample;
