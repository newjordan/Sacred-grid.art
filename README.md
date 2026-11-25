# Sacred-grid.art

<p align="center">
  <img src="public/logo512.png" alt="SacredGrid Canvas2D Logo" width="150" />
</p>

<p align="center">
  A high-performance Canvas2D library for creating interactive sacred geometry visualizations. Render beautiful patterns like Flower of Life with real-time animations, custom shapes, and responsive design. Perfect for meditation apps and creative coding.
</p>

<p align="center">
  <a href="#demo">Demo</a> •
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#examples">Examples</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#sponsor">Sponsor</a> •
  <a href="#license">License</a>
</p>

## 🔆 Demo

View the live demo at: [https://sacred-grid.art](https://sacred-grid.art)

![SacredGrid Canvas2D Demo](public/logo512.png)

## ✨ Features

- **High-Performance Canvas2D Rendering**: Optimized for smooth animations across all devices
- **Rich Shape Library**: Create polygons, circles, stars, flower of life patterns, and more
- **Interactive Visualization**: Real-time mouse interaction and responsiveness
- **Customizable Styling**: Fine-tune colors, line styles, gradients, and animations
- **Sacred Geometry Patterns**: Generate complex geometric patterns with ease
- **Fractal Support**: Create nested patterns with configurable recursion
- **Line Effects**: Apply glow, tapers, sine waves, and more to all drawn elements
- **Audio Reactivity**: Connect to audio input for music-driven visualizations
- **Export Capabilities**: Save your creations as high-quality images

## 🔌 Installation

### Prerequisites

- Node.js 22.12 or higher
- npm 10 or higher

### Setup

The library is not published to npm yet, so use it from this repository:

```bash
# Clone the repository
git clone https://github.com/newjordan/Sacred-grid.art.git
cd Sacred-grid.art

# Install dependencies
npm install

# Start the development server
npm start
```

Client environment variables use Vite's `VITE_` prefix and are read with
`import.meta.env.VITE_*`. `import.meta.env.MODE` is `development` in the dev
server, `production` in `npm run build`, and `test` under Vitest.

Other useful commands:

```bash
npm test                      # run the test suite once
npm run test:watch            # re-run tests while editing
npm run build                 # production build into dist/
npm run preview               # serve the production build locally
npm run lint                  # Oxlint over src/
npm run typecheck             # TypeScript check over src/
```

## 🎮 Usage

Components are imported from the source tree (paths below assume you are
inside `src/`).

### Basic Example

```jsx
import React, { useRef } from 'react';
import SacredGrid from './SacredGrid';

const App = () => {
  const gridRef = useRef(null);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid ref={gridRef} />
    </div>
  );
};

export default App;
```

### Customizing Settings

`SacredGrid` exposes an imperative API through its ref: `getSettings()`
returns the live settings object, and `updateSettings(settings)` applies your
changes. Mutate the object you get back and push it through
`updateSettings()`:

```jsx
import React, { useEffect, useRef } from 'react';
import SacredGrid from './SacredGrid';
import { ShapeType } from './constants/ShapeTypes';

const App = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const settings = grid.getSettings();
    settings.grid.size = 8;
    settings.grid.spacing = 100;
    settings.grid.baseDotSize = 3;
    settings.shapes.primary.type = ShapeType.FLOWER_OF_LIFE;
    settings.shapes.primary.size = 400;
    settings.shapes.primary.opacity = 0.8;
    grid.updateSettings(settings);
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid ref={gridRef} />
    </div>
  );
};

export default App;
```

## 📚 Documentation

### Core Components

- **SacredGrid**: Main component that orchestrates the rendering
- **SacredGridCanvas**: The canvas component that performs the actual drawing
- **SacredGridControls**: UI controls for adjusting visualization settings

### Main Configuration Options

| Category | Property | Description | Default |
|----------|----------|-------------|---------|
| Grid | size | Number of dots in each direction | 6 |
| Grid | spacing | Space between grid dots | 140 |
| Grid | baseDotSize | Size of each dot | 2 |
| Colors | background | Background color | #000000 |
| Colors | lineColor | Line color | #0077ff |
| Shapes | type | Primary shape type | POLYGON |
| Shapes | size | Size of the shape | 350 |
| Animation | speed | Overall animation speed | 1 |

For complete API documentation, see the [full documentation](docs/API.md).

## 🎨 Examples

Each example below tweaks the live settings object and applies it with
`updateSettings()` (see above for the full ref setup).

### Basic Grid

```jsx
const settings = gridRef.current.getSettings();
settings.grid.size = 10;
settings.grid.spacing = 80;
settings.colors.lineColor = '#00ff00';
gridRef.current.updateSettings(settings);
```

### Flower of Life

```jsx
const settings = gridRef.current.getSettings();
settings.shapes.primary.type = ShapeType.FLOWER_OF_LIFE;
settings.shapes.primary.size = 300;
settings.shapes.primary.opacity = 0.7;
gridRef.current.updateSettings(settings);
```

### Fractal Star

```jsx
const settings = gridRef.current.getSettings();
settings.shapes.primary.type = ShapeType.STAR;
settings.shapes.primary.vertices = 5;
settings.shapes.primary.fractal.depth = 3;
settings.shapes.primary.fractal.scale = 0.5;
gridRef.current.updateSettings(settings);
```

More examples can be found in the [examples directory](examples/).

## 🗺️ Roadmap

- [ ] More shape types (Metatron's Cube, Tree of Life)
- [ ] Improved performance optimizations
- [ ] Shape interaction and selection
- [ ] Save/load functionality for configurations
- [ ] WebRTC support for collaborative creation
- [ ] Expanded animation options
- [ ] Timeline editor for creating animated sequences
- [ ] Node-based editor for complex pattern creation

See the [open issues](https://github.com/newjordan/Sacred-grid.art/issues) for a full list of proposed features and known issues.

## 👥 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Community

Join our Discord community to connect with other users, share your creations, get help, and contribute to the project:

<p align="center">
  <a href="https://discord.gg/RHj4mpvBFb" target="_blank"><img src="https://img.shields.io/discord/1234567890?color=5865F2&logo=discord&logoColor=white&label=Join%20Our%20Discord" alt="Join Discord Server" height="40"></a>
</p>

## 💝 Sponsor

If you find Sacred Grid useful for your projects or appreciate our work in advancing sacred geometry visualization tools, please consider supporting the project through GitHub Sponsors or other funding platforms.

Your support will help us:
- Expand the library with more sacred geometry patterns
- Maintain and improve performance
- Create more examples and documentation
- Support integrations with other frameworks
- Respond to community requests

### Corporate Sponsors

<p align="center">
  <em>Become our first corporate sponsor! Contact us through GitHub Issues for corporate sponsorship options.</em>
</p>

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by sacred geometry principles from various traditions
- Built with React and modern JavaScript
- Special thanks to all contributors and the open-source community

---

<p align="center">
  Made with ❤️ by SacredGrid Contributors
</p>