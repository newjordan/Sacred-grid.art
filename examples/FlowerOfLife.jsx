import React from 'react';
import SacredGrid from '../src/SacredGrid';
import { ShapeType } from '../src/constants/ShapeTypes';

/**
 * Flower of Life Example
 * 
 * This example demonstrates the Flower of Life sacred geometry pattern.
 */
const FlowerOfLifeExample = () => {
  const settings = {
    grid: {
      size: 4,               // Smaller grid
      connectionOpacity: 0.05, // Very subtle connections
    },
    colors: {
      background: '#110022',  // Deep purple background
      lineColor: '#ffcc00',   // Golden lines
    },
    shapes: {
      primary: {
        type: ShapeType.FLOWER_OF_LIFE,
        size: 350,            // Large size
        opacity: 0.7,         // Partially transparent
        thickness: 2,         // Thin lines
        fractal: {
          depth: 1,           // No fractals in this example
        },
        animation: {
          mode: 'breathe',    // Breathing animation
          speed: 0.0004,      // Slower animation
          intensity: 0.15,    // Subtle animation
        },
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid initialSettings={settings} />
    </div>
  );
};

export default FlowerOfLifeExample;