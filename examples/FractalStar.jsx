import React from 'react';
import SacredGrid from '../src/SacredGrid';
import { ShapeType, AnimationMode } from '../src/constants/ShapeTypes';

/**
 * Fractal Star Example
 * 
 * This example demonstrates a fractal star pattern with animation.
 */
const FractalStarExample = () => {
  const settings = {
    grid: {
      size: 0,               // No grid in this example
    },
    colors: {
      background: '#001133',  // Deep blue background
      lineColor: '#ffffff',   // White lines
      gradient: {
        shapes: {
          enabled: true,      // Use gradient for shapes
          colors: ['#ff3366', '#3366ff', '#66ffcc', '#ffcc33'], // Colorful gradient
        },
        cycleDuration: 8000,   // 8 second cycle
        easing: 'easeInOutQuad', // Smooth easing
      }
    },
    shapes: {
      primary: {
        type: ShapeType.STAR,
        size: 300,            // Medium size
        opacity: 1.0,         // Fully opaque
        thickness: 3,         // Medium line thickness
        vertices: 5,          // 5-pointed star
        rotation: Math.PI / 5, // Slight rotation
        fractal: {
          depth: 3,           // 3 levels of fractals
          scale: 0.4,         // Each child is 40% of parent
          childCount: 2,      // 2 children per vertex
          thicknessFalloff: 0.7, // Lines get thinner in children
        },
        animation: {
          mode: AnimationMode.ROTATE, // Rotation animation
          speed: 0.0005,      // Slow rotation
          reverse: true,      // Reverse direction
        },
        stacking: {
          enabled: true,      // Enable stacking
          count: 2,           // 2 stacked stars
          interval: 4000,     // 4 second interval
        }
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid initialSettings={settings} />
    </div>
  );
};

export default FractalStarExample;