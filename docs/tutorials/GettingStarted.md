# Getting Started with SacredGrid Canvas2D

This tutorial will guide you through the process of setting up and using SacredGrid Canvas2D in your project.

## Installation

### Setup as a Project Dependency

```bash
# Using npm
npm install sacredgrid-canvas2d

# Using yarn
yarn add sacredgrid-canvas2d
```

### Setup From Source

```bash
# Clone the repository
git clone https://github.com/newjordan/sacred-grid.art.git
cd sacred-grid.art

# Install dependencies
npm install

# Start the development server
npm start
```

## Basic Usage

### Using the Component

The simplest way to use SacredGrid Canvas2D is to import the component and add it to your React application:

```jsx
import React from 'react';
import SacredGrid from 'sacredgrid-canvas2d';

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid />
    </div>
  );
}

export default App;
```

This will create a full-screen visualization with the default settings.

### Customizing Settings

You can customize the visualization by passing an `initialSettings` prop:

```jsx
import React from 'react';
import SacredGrid from 'sacredgrid-canvas2d';
import { ShapeType } from 'sacredgrid-canvas2d/constants';

function App() {
  const settings = {
    grid: {
      size: 8,
      spacing: 100,
    },
    colors: {
      background: '#001122',
      lineColor: '#00ff88',
    },
    shapes: {
      primary: {
        type: ShapeType.FLOWER_OF_LIFE,
        size: 300,
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid initialSettings={settings} />
    </div>
  );
}

export default App;
```

## Working with Shapes

SacredGrid Canvas2D includes a variety of shape types that you can use:

### Polygon

```jsx
const settings = {
  shapes: {
    primary: {
      type: ShapeType.POLYGON,
      vertices: 6, // Hexagon
      size: 200,
    }
  }
};
```

### Star

```jsx
const settings = {
  shapes: {
    primary: {
      type: ShapeType.STAR,
      vertices: 5, // 5-pointed star
      size: 200,
    }
  }
};
```

### Flower of Life

```jsx
const settings = {
  shapes: {
    primary: {
      type: ShapeType.FLOWER_OF_LIFE,
      size: 300,
    }
  }
};
```

## Animating Shapes

You can animate shapes by configuring their animation properties:

```jsx
const settings = {
  shapes: {
    primary: {
      type: ShapeType.POLYGON,
      vertices: 3,
      size: 200,
      animation: {
        mode: AnimationMode.ROTATE,
        speed: 0.001,
      }
    }
  }
};
```

Available animation modes include:
- `NONE` - No animation
- `GROW` - Scale in and out
- `PULSE` - Opacity pulsing
- `ROTATE` - Rotation
- `BREATHE` - Combination of grow and pulse

## Working with Colors

### Basic Colors

```jsx
const settings = {
  colors: {
    background: '#000000', // Black background
    lineColor: '#ffffff', // White lines
  }
};
```

### Gradients

```jsx
const settings = {
  colors: {
    gradient: {
      lines: {
        enabled: true,
        colors: ['#ff0000', '#00ff00', '#0000ff'], // RGB gradient
      },
      cycleDuration: 5000, // 5 seconds per cycle
    }
  }
};
```

## Handling Mouse Interaction

The grid and shapes can react to mouse movement:

```jsx
const settings = {
  mouse: {
    influenceRadius: 200, // Area affected by mouse
    maxScale: 2, // Maximum scale when influenced by mouse
  }
};
```

## Next Steps

- Explore the [API Documentation](../API.md) for a complete reference
- Check out the [Examples](../../examples/) for more complex configurations
- See the live demo at [sacred-grid.art](https://sacred-grid.art) for inspiration