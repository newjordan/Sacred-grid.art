# SacredGrid Canvas2D Examples

This directory contains example implementations of SacredGrid Canvas2D to help you get started with the library.

## Running Examples

To run these examples:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open one of the example files and copy its content to `src/App.js` to view it

## Available Examples

### Basic Grid

A simple grid example with customized colors and spacing.

[View Code](./BasicGrid.jsx)

### Flower of Life

Demonstrates the Flower of Life sacred geometry pattern with animation.

[View Code](./FlowerOfLife.jsx)

### Fractal Star

Showcases a fractal star pattern with multiple levels of recursion and color animation.

[View Code](./FractalStar.jsx)

## Creating Your Own Examples

You can use these examples as a starting point for your own creations. The basic structure is:

```jsx
import React from 'react';
import SacredGrid from '../src/SacredGrid';
import { ShapeType } from '../src/constants/ShapeTypes';

const MyExample = () => {
  const settings = {
    // Your custom settings here
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid initialSettings={settings} />
    </div>
  );
};

export default MyExample;
```

Refer to the [API documentation](../docs/API.md) for a complete list of available settings and options.