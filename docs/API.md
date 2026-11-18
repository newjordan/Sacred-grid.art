# SacredGrid Canvas2D API Documentation

This document provides detailed information about the SacredGrid Canvas2D API.

## Table of Contents

- [SacredGrid Component](#sacredgrid-component)
- [Settings Object](#settings-object)
- [Shape Types](#shape-types)
- [Animation Modes](#animation-modes)
- [Line Styles](#line-styles)
- [Export](#export)

## SacredGrid Component

The main component that renders the sacred geometry visualization.

### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `controlsVisible` | Boolean | Show the settings panel | `true` |
| `guiVisible` | Boolean | Show GUI overlays at all | `true` |
| `ref` | Object | Imperative handle: `updateSettings(settings)` and `getSettings()` | - |

### Example

```jsx
import React, { useEffect, useRef } from 'react';
import SacredGrid from './SacredGrid';

const App = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const settings = grid.getSettings();
    settings.grid.size = 8;
    settings.colors.background = '#111122';
    grid.updateSettings(settings);
  }, []);

  return <SacredGrid ref={gridRef} />;
};
```

## Settings Object

The settings object controls all aspects of the visualization. Below is the complete structure with all available options.

```javascript
{
  // Grid settings
  grid: {
    size: 6, // Number of dots in each direction
    spacing: 140, // Space between dots
    baseDotSize: 2, // Size of each dot
    connectionOpacity: 0.15, // Opacity of grid lines
    noiseIntensity: 1, // Amount of randomness
    lineWidthMultiplier: 1, // Multiplier for line width
    breathingSpeed: 0.0008, // Speed of breathing animation
    breathingIntensity: 0.2, // Intensity of breathing
    useLineFactorySettings: false // Apply line factory to grid
  },

  // Mouse interaction
  mouse: {
    influenceRadius: 200, // Radius of mouse influence
    maxScale: 2, // Maximum scale when mouse influences
  },

  // Colors
  colors: {
    background: '#000000', // Background color
    scheme: 'blue', // Color scheme (blue, grayscale, etc.)
    lineColor: '#0077ff', // Line color
    gradient: {
      lines: {
        enabled: false, // Use gradient for lines
        colors: ['#ff0000', '#ff7700', '#00ff00', '#0000ff'], // Gradient colors
      },
      dots: {
        enabled: false, // Use gradient for dots
        colors: ['#ff00ff', '#ff0077', '#0077ff', '#00ffff'], // Gradient colors
      },
      shapes: {
        enabled: false, // Use gradient for shapes
        colors: ['#ffffff', '#dddddd', '#aaaaaa', '#000000'], // Gradient colors
      },
      easing: 'linear', // Easing function
      cycleDuration: 6000 // Duration of color cycle in ms
    }
  },

  // Animation
  animation: {
    speed: 1 // Global animation speed
  },

  // XY Grid settings
  xyGrid: {
    show: true, // Show XY grid
    size: 20, // Grid size
    spacing: 40, // Grid spacing
    opacity: 0.1, // Grid opacity
    lineWidth: 0.5, // Grid line width
    color: '#444444', // Grid color
    showLabels: false // Show grid labels
  },

  // Line Factory settings
  lineFactory: {
    style: 'solid', // Line style (solid, dashed, etc.)
    taper: {
      type: 'none', // Taper type (none, start, end, both)
      startWidth: 0.1, // Start width
      endWidth: 0.1 // End width
    },
    glow: {
      intensity: 0, // Glow intensity
      color: '#ffffff' // Glow color
    },
    outline: {
      enabled: false, // Enable outline
      color: '#000000', // Outline color
      width: 0.5 // Outline width
    },
    dash: {
      pattern: [5, 5], // Dash pattern
      offset: 0 // Dash offset
    },
    sineWave: {
      type: 'none', // Sine wave type
      amplitude: 5, // Sine amplitude
      frequency: 0.1, // Sine frequency
      phase: 0 // Sine phase
    },
    loopLine: true, // Loop line back to start
    bidirectionalWaves: true // Waves in both directions
  },

  // Shapes
  shapes: {
    // Primary shape
    primary: {
      type: 'polygon', // Shape type
      size: 350, // Shape size
      opacity: 1.0, // Shape opacity
      thickness: 6, // Line thickness
      vertices: 3, // Number of vertices (for polygon)
      rotation: 0, // Rotation in radians
      useLineFactory: false, // Use line factory for shape
      position: {
        offsetX: 0, // X offset
        offsetY: 0 // Y offset
      },
      fractal: {
        depth: 1, // Recursion depth
        scale: 0.5, // Scale factor for children
        thicknessFalloff: 0.8, // Thickness reduction for children
        childCount: 3 // Number of children
      },
      animation: {
        mode: 'grow', // Animation mode
        reverse: false, // Reverse animation
        speed: 0.0008, // Animation speed
        intensity: 0.2, // Animation intensity
        fadeIn: 0.2, // Fade in duration
        fadeOut: 0.2 // Fade out duration
      },
      stacking: {
        enabled: true, // Enable stacking
        count: 3, // Number of stacked shapes
        timeOffset: -3000, // Time offset between stacks
        interval: 1000 // Interval between stacks
      }
    }
  }
}
```

## Shape Types

The following shape types are available for use in the `type` property
(see `ShapeType` in `src/constants/ShapeTypes.js`):

| Value | Description |
|-------|-------------|
| `POLYGON` | Regular polygon with specified number of vertices |
| `CIRCLE` | Perfect circle |
| `STAR` | Star with specified number of points |
| `FLOWER_OF_LIFE` | Sacred geometry Flower of Life pattern |
| `MERKABA` | Sacred geometry Merkaba (Star Tetrahedron) |
| `SPIRAL` | Logarithmic spiral |
| `LISSAJOUS` | Lissajous pattern |
| `HEXAGON` | Hexagon |
| `PENTAGON` | Pentagon |
| `METATRONS_CUBE` | Metatron's Cube pattern |
| `TREE_OF_LIFE` | Tree of Life pattern |
| `MANDALA` | Procedural mandala |
| `CUSTOM_MANDALA` | Mandala defined by custom data |

## Animation Modes

The following animation modes are available for shapes
(see `AnimationMode` in `src/constants/ShapeTypes.js`):

| Value | Description |
|-------|-------------|
| `GROW` | Shape grows and shrinks |
| `PULSE` | Shape pulses opacity |
| `ORBIT` | Shape orbits around its center |
| `WAVEFORM` | Waveform-driven motion |
| `SPIRAL` | Spiral motion |
| `HARMONIC` | Harmonic ratio-driven motion |
| `SWARM` | Swarm-like motion |
| `BREATHE` | Combination of grow and pulse |

## Line Styles

The following line styles are available
(see `LineStyleType` in `src/constants/ShapeTypes.js`):

| Value | Description |
|-------|-------------|
| `SOLID` | Solid line |
| `DASHED` | Dashed line |
| `DOTTED` | Dotted line |
| `WAVY` | Wavy line |
| `ZIGZAG` | Zigzag line |
| `SPIRAL` | Spiral line |
| `RIBBON` | Ribbon line |
| `DOUBLE` | Double line |
| `COMPLEX` | Complex animated dash pattern |

## Export

Exporting is handled by `ExportManager` (`src/export/ExportManager.js`), the
same code behind the in-app Export panel. It produces a PNG of the current
canvas or a standalone HTML file that re-renders your settings without a
build step:

```javascript
import { ExportManager } from './export/ExportManager.js';

const exportManager = new ExportManager();
await exportManager.export(settings, canvas, { format: 'png' });
await exportManager.export(settings, canvas, { format: 'standalone' });
```

## Advanced Usage

For advanced usage examples, check out the [examples directory](../examples/) and the [tutorials](./tutorials/).