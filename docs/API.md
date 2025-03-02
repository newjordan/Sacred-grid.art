# SacredGrid Canvas2D API Documentation

This document provides detailed information about the SacredGrid Canvas2D API.

## Table of Contents

- [SacredGrid Component](#sacredgrid-component)
- [Settings Object](#settings-object)
- [Shape Types](#shape-types)
- [Animation Modes](#animation-modes)
- [Line Styles](#line-styles)
- [Utility Functions](#utility-functions)

## SacredGrid Component

The main component that renders the sacred geometry visualization.

### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `initialSettings` | Object | Initial settings for the visualization | `{}` |
| `width` | Number | Canvas width in pixels | `window.innerWidth` |
| `height` | Number | Canvas height in pixels | `window.innerHeight` |
| `autoResize` | Boolean | Auto-resize on window resize | `true` |
| `onRender` | Function | Callback fired on each render frame | `null` |
| `onMouseMove` | Function | Callback fired on mouse movement | `null` |
| `className` | String | Additional CSS class names | `''` |

### Example

```jsx
import SacredGrid from 'sacredgrid-canvas2d';

const App = () => (
  <SacredGrid 
    initialSettings={{
      grid: { size: 8 },
      colors: { background: '#111122' }
    }}
    onRender={(stats) => console.log('FPS:', stats.fps)}
  />
);
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

The following shape types are available for use in the `type` property:

| Value | Description |
|-------|-------------|
| `POLYGON` | Regular polygon with specified number of vertices |
| `CIRCLE` | Perfect circle |
| `STAR` | Star with specified number of points |
| `FLOWER_OF_LIFE` | Sacred geometry Flower of Life pattern |
| `MERKABA` | Sacred geometry Merkaba (Star Tetrahedron) |
| `SPIRAL` | Logarithmic spiral |
| `LISSAJOUS` | Lissajous pattern |
| `GRID` | Grid pattern |
| `CUSTOM` | Custom shape defined by points |

## Animation Modes

The following animation modes are available for shapes:

| Value | Description |
|-------|-------------|
| `NONE` | No animation |
| `GROW` | Shape grows and shrinks |
| `PULSE` | Shape pulses opacity |
| `ROTATE` | Shape rotates |
| `BREATHE` | Combination of grow and pulse |
| `MORPH` | Shape morphs between vertices counts |

## Line Styles

The following line styles are available:

| Value | Description |
|-------|-------------|
| `SOLID` | Solid line |
| `DASHED` | Dashed line |
| `DOTTED` | Dotted line |
| `DOUBLE` | Double line |
| `GLOW` | Line with glow effect |

## Utility Functions

### `exportToPNG(settings, width, height)`

Exports the current visualization to a PNG image.

```javascript
import { exportToPNG } from 'sacredgrid-canvas2d/utils';

// Export current visualization
const pngDataUrl = exportToPNG(currentSettings, 1920, 1080);
```

### `generateRandomSettings()`

Generates random settings for the visualization.

```javascript
import { generateRandomSettings } from 'sacredgrid-canvas2d/utils';

const randomSettings = generateRandomSettings();
```

### `interpolateSettings(settingsA, settingsB, progress)`

Interpolates between two settings objects.

```javascript
import { interpolateSettings } from 'sacredgrid-canvas2d/utils';

// Get settings halfway between A and B
const midwaySettings = interpolateSettings(settingsA, settingsB, 0.5);
```

## Advanced Usage

For advanced usage examples, check out the [examples directory](../examples/) and the [tutorials](./tutorials/).