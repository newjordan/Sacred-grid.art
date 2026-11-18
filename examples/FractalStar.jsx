import React, { useEffect, useRef } from 'react';
import SacredGrid from '../src/SacredGrid';
import { ShapeType, AnimationMode } from '../src/constants/ShapeTypes';

/**
 * Fractal Star Example
 *
 * This example demonstrates a fractal star pattern with animation.
 */
const FractalStarExample = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Start from the live settings, apply the overrides, then push them back.
    const settings = grid.getSettings();
    settings.grid.size = 0;                    // No grid in this example
    settings.colors.background = '#001133';   // Deep blue background
    settings.colors.lineColor = '#ffffff';    // White lines
    settings.colors.gradient.shapes.enabled = true; // Use gradient for shapes
    settings.colors.gradient.shapes.colors = ['#ff3366', '#3366ff', '#66ffcc', '#ffcc33'];
    settings.colors.gradient.cycleDuration = 8000;   // 8 second cycle
    settings.colors.gradient.easing = 'easeInOutQuad'; // Smooth easing
    settings.shapes.primary.type = ShapeType.STAR;
    settings.shapes.primary.size = 300;       // Medium size
    settings.shapes.primary.opacity = 1.0;    // Fully opaque
    settings.shapes.primary.thickness = 3;    // Medium line thickness
    settings.shapes.primary.vertices = 5;      // 5-pointed star
    settings.shapes.primary.rotation = Math.PI / 5; // Slight rotation
    settings.shapes.primary.fractal.depth = 3;           // 3 levels of fractals
    settings.shapes.primary.fractal.scale = 0.4;        // Each child is 40% of parent
    settings.shapes.primary.fractal.childCount = 2;     // 2 children per vertex
    settings.shapes.primary.fractal.thicknessFalloff = 0.7; // Lines get thinner in children
    settings.shapes.primary.animation.mode = AnimationMode.ORBIT; // Orbiting motion
    settings.shapes.primary.animation.speed = 0.0005;   // Slow orbit
    settings.shapes.primary.animation.reverse = true;   // Reverse direction
    settings.shapes.primary.stacking.enabled = true;   // Enable stacking
    settings.shapes.primary.stacking.count = 2;         // 2 stacked stars
    settings.shapes.primary.stacking.interval = 4000;  // 4 second interval
    grid.updateSettings(settings);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid ref={gridRef} />
    </div>
  );
};

export default FractalStarExample;
