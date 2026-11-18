import React, { useEffect, useRef } from 'react';
import SacredGrid from '../src/SacredGrid';
import { ShapeType, AnimationMode } from '../src/constants/ShapeTypes';

/**
 * Flower of Life Example
 *
 * This example demonstrates the Flower of Life sacred geometry pattern.
 */
const FlowerOfLifeExample = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Start from the live settings, apply the overrides, then push them back.
    const settings = grid.getSettings();
    settings.grid.size = 4;                  // Smaller grid
    settings.grid.connectionOpacity = 0.05;  // Very subtle connections
    settings.colors.background = '#110022';  // Deep purple background
    settings.colors.lineColor = '#ffcc00';   // Golden lines
    settings.shapes.primary.type = ShapeType.FLOWER_OF_LIFE;
    settings.shapes.primary.size = 350;      // Large size
    settings.shapes.primary.opacity = 0.7;   // Partially transparent
    settings.shapes.primary.thickness = 2;   // Thin lines
    settings.shapes.primary.fractal.depth = 1; // No fractals in this example
    settings.shapes.primary.animation.mode = AnimationMode.BREATHE;
    settings.shapes.primary.animation.speed = 0.0004;  // Slower animation
    settings.shapes.primary.animation.intensity = 0.15; // Subtle animation
    grid.updateSettings(settings);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid ref={gridRef} />
    </div>
  );
};

export default FlowerOfLifeExample;
