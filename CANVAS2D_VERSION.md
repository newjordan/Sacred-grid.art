# Canvas2D Version

This is a modified version of the Sacred Grid project that uses only the Canvas2D rendering system, removing all WebGL-specific code.

## Changes Made

1. Removed WebGL renderer and all associated components
2. Updated the renderer factory to only use Canvas2D renderer
3. Simplified settings by removing WebGL-specific settings
4. Removed WebGL effects sections from the control panel
5. Removed WebGL shader files and utilities
6. Updated the README with Canvas2D-specific information
7. Renamed the project to "sacredgrid-canvas2d"
8. Created fixed default settings for Canvas2D rendering

## Benefits

- Better compatibility with all browsers and devices
- Lighter weight without WebGL dependencies
- Simpler codebase that's easier to understand and modify
- Focus on optimizing the Canvas2D rendering pathway

## File Structure

The main files of the project:

- `src/SacredGrid.js` - Main component
- `src/renderers/Canvas2DRenderer.js` - Canvas2D renderer implementation
- `src/components/SacredGridCanvas.js` - Canvas component
- `src/components/SacredGridControls.js` - Controls UI

## Getting Started

Run the following commands to start the development server:

```
npm install
npm start
```