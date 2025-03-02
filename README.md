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

- Node.js 16.x or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/newjordan/sacred-grid.art.git
cd sacred-grid.art

# Install dependencies
npm install

# Start the development server
npm start
```

## 🎮 Usage

### Basic Example

```jsx
import React from 'react';
import SacredGrid from 'sacredgrid-canvas2d';

const App = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid />
    </div>
  );
};

export default App;
```

### Customizing Settings

```jsx
import React from 'react';
import SacredGrid from 'sacredgrid-canvas2d';
import { ShapeType } from 'sacredgrid-canvas2d/constants';

const App = () => {
  const customSettings = {
    grid: {
      size: 8,
      spacing: 100,
      baseDotSize: 3,
    },
    shapes: {
      primary: {
        type: ShapeType.FLOWER_OF_LIFE,
        size: 400,
        opacity: 0.8,
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SacredGrid initialSettings={customSettings} />
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

### Basic Grid

<!-- Example visualization of a basic grid -->

```jsx
<SacredGrid 
  initialSettings={{
    grid: { size: 10, spacing: 80 },
    colors: { lineColor: '#00ff00' }
  }}
/>
```

### Flower of Life

<!-- Example visualization of the Flower of Life pattern -->

```jsx
<SacredGrid 
  initialSettings={{
    shapes: {
      primary: {
        type: ShapeType.FLOWER_OF_LIFE,
        size: 300,
        opacity: 0.7
      }
    }
  }}
/>
```

### Fractal Star

<!-- Example visualization of a fractal star pattern -->

```jsx
<SacredGrid 
  initialSettings={{
    shapes: {
      primary: {
        type: ShapeType.STAR,
        vertices: 5,
        fractal: {
          depth: 3,
          scale: 0.5
        }
      }
    }
  }}
/>
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

See the [open issues](https://github.com/newjordan/sacred-grid.art/issues) for a full list of proposed features and known issues.

## 👥 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 💝 Sponsor

If you find Sacred Grid useful for your projects or appreciate our work in advancing sacred geometry visualization tools, please consider supporting the project:

<p align="center">
  <a href="https://www.patreon.com/Frosty40" target="_blank"><img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron" height="45"></a>
  &nbsp;&nbsp;
  <a href="https://ko-fi.com/frosty40" target="_blank"><img src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" alt="Buy Me A Coffee" height="45" width="180"></a>
</p>

Your support will help us:
- Expand the library with more sacred geometry patterns
- Maintain and improve performance
- Create more examples and documentation
- Support integrations with other frameworks
- Respond to community requests

If you're representing a company that would like to sponsor Sacred Grid, please reach out to Frosty40 on Patreon or Ko-fi for corporate sponsorship options.

### Corporate Sponsors

<p align="center">
  <em>Become our first corporate sponsor! Contact Frosty40 on Patreon or Ko-fi for details.</em>
</p>

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by sacred geometry principles from various traditions
- Built with React and modern JavaScript
- Special thanks to Claude-Code and ChatGPT for AI assistance in development and documentation
- Special thanks to all contributors and the open-source community

---

<p align="center">
  Made with ❤️ by SacredGrid Contributors
</p>