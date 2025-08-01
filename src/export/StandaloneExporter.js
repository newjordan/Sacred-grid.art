// src/export/StandaloneExporter.js - Standalone HTML File Generator (JavaScript version)
// Converts application snapshots into self-contained HTML files

import { PackageOptimizer } from '../utils/PackageOptimizer.js';

export class StandaloneExporter {
  /**
   * Export an application snapshot as a standalone HTML file
   */
  static async exportStandalone(snapshot, config) {
    console.log('🚀 Creating standalone HTML file...');

    // Optimize the snapshot first
    let optimizationOptions;
    if (!config.optimize) {
      optimizationOptions = { ...PackageOptimizer.getConservativeOptions(), removeUnusedSettings: false, removeDebugCode: false };
    } else {
      switch (config.optimizationLevel) {
        case 'conservative':
          optimizationOptions = PackageOptimizer.getConservativeOptions();
          break;
        case 'aggressive':
          optimizationOptions = PackageOptimizer.getAggressiveOptions();
          break;
        default:
          optimizationOptions = PackageOptimizer.getDefaultOptions();
      }
    }

    const { snapshot: optimizedSnapshot, result: optimizationResult } =
      PackageOptimizer.optimizeSnapshot(snapshot, optimizationOptions);

    if (config.optimize) {
      console.log('🔧 Package optimization results:');
      console.log(PackageOptimizer.generateOptimizationReport(optimizationResult));
    }

    // Generate the complete HTML content
    let htmlContent = this.generateStandaloneHTML(optimizedSnapshot, config);

    // Optimize HTML if requested
    if (config.optimize) {
      htmlContent = PackageOptimizer.optimizeHTML(htmlContent, optimizationOptions);
    }

    // Create blob
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

    console.log('✅ Standalone HTML file created');
    console.log(`📊 File size: ${(blob.size / 1024).toFixed(1)} KB`);

    return blob;
  }
  
  /**
   * Generate the complete standalone HTML content
   */
  static generateStandaloneHTML(snapshot, config) {
    const snapshotJSON = JSON.stringify(snapshot, null, 2);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        ${this.generateCSS(config)}
        ${config.customCSS || ''}
    </style>
</head>
<body>
    <div id="sacred-grid-container">
        <canvas id="sacred-grid-canvas" width="${config.width}" height="${config.height}"></canvas>
        
        ${config.includeControls ? this.generateControlsHTML() : ''}
        
        ${config.showInfo ? this.generateInfoPanelHTML(snapshot) : ''}
    </div>

    <script>
        // Embedded application snapshot
        const SACRED_GRID_SNAPSHOT = ${snapshotJSON};
        const EXPORT_CONFIG = ${JSON.stringify(config, null, 2)};
        
        console.log('🎨 Sacred Grid Standalone Player loaded!');
        console.log('📊 Snapshot:', SACRED_GRID_SNAPSHOT);
        
        ${this.generateCoreRenderer()}
        ${this.generateApplicationLogic(config)}
        ${config.customJS || ''}
    </script>
</body>
</html>`;
  }
  
  /**
   * Generate CSS styles for the standalone application
   */
  static generateCSS(config) {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: ${config.backgroundColor};
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #sacred-grid-container {
            position: relative;
            width: ${config.width}px;
            height: ${config.height}px;
            max-width: 100vw;
            max-height: 100vh;
        }
        
        #sacred-grid-canvas {
            display: block;
            width: 100%;
            height: 100%;
            cursor: crosshair;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .controls {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            display: ${config.includeControls ? 'flex' : 'none'};
            gap: 12px;
            align-items: center;
            z-index: 10;
        }
        
        .control-btn {
            background: rgba(0, 119, 255, 0.2);
            border: 1px solid rgba(0, 119, 255, 0.4);
            border-radius: 8px;
            color: white;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
            user-select: none;
        }
        
        .control-btn:hover {
            background: rgba(0, 119, 255, 0.4);
            transform: translateY(-1px);
        }
        
        .control-btn:active {
            transform: translateY(0);
        }
        
        .info-panel {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            color: white;
            font-size: 12px;
            max-width: 300px;
            z-index: 10;
        }
        
        .info-title {
            margin: 0 0 8px 0;
            color: #0077ff;
            font-size: 14px;
            font-weight: 600;
        }
        
        .info-subtitle {
            margin: 0 0 8px 0;
            color: #cccccc;
            font-size: 12px;
        }
        
        .info-details {
            font-size: 10px;
            color: #888888;
            line-height: 1.4;
        }
        
        @media (max-width: 768px) {
            .controls {
                top: 10px;
                right: 10px;
                padding: 12px;
                gap: 8px;
            }
            
            .control-btn {
                padding: 6px 10px;
                font-size: 14px;
            }
            
            .info-panel {
                bottom: 10px;
                left: 10px;
                padding: 12px;
                max-width: 250px;
            }
        }
    `;
  }
  
  /**
   * Generate HTML for interactive controls
   */
  static generateControlsHTML() {
    return `
        <div class="controls">
            <button id="play-pause-btn" class="control-btn" title="Play/Pause (Space)">⏸️</button>
            <button id="reset-btn" class="control-btn" title="Reset (R)">🔄</button>
            <button id="fullscreen-btn" class="control-btn" title="Fullscreen (F)">⛶</button>
        </div>
    `;
  }
  
  /**
   * Generate HTML for info panel
   */
  static generateInfoPanelHTML(snapshot) {
    const settings = snapshot.settings;
    const gridSize = settings.grid?.size || 6;
    const shapeVertices = settings.shapes?.primary?.vertices || 3;
    const animationSpeed = settings.animation?.speed || 1;
    
    return `
        <div class="info-panel">
            <h3 class="info-title">🎨 Sacred Grid Player</h3>
            <p class="info-subtitle">Algorithmic Sacred Geometry</p>
            <div class="info-details">
                Grid: ${gridSize} × ${gridSize} | 
                Shape: ${shapeVertices}-gon | 
                Speed: ${animationSpeed}x<br>
                Created: ${new Date(snapshot.metadata.timestamp).toLocaleDateString()}
            </div>
        </div>
    `;
  }
  
  /**
   * Generate the core Sacred Grid renderer (FULL IMPLEMENTATION)
   */
  static generateCoreRenderer() {
    return `
        // Sacred Grid Standalone Renderer - COMPLETE IMPLEMENTATION
        class StandaloneSacredGridRenderer {
            constructor(canvas, snapshot) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.snapshot = snapshot;
                this.settings = snapshot.settings;
                this.isPlaying = true;
                this.time = 0;
                this.startTime = performance.now();
                this.animationFrame = null;

                // Sacred Grid constants
                this.PHI = (1 + Math.sqrt(5)) / 2;
                this.gridPoints = [];

                // Mouse tracking
                this.mousePos = { x: -1000, y: -1000 };

                console.log('🎨 Standalone renderer initialized with settings:', this.settings);
                this.generateGridPoints();
                this.setupEventListeners();
                this.start();
            }
            
            generateGridPoints() {
                this.gridPoints = [];
                const offsetX = this.canvas.width / 2;
                const offsetY = this.canvas.height / 2;
                const { size, spacing } = this.settings.grid;

                for (let x = -size; x <= size; x++) {
                    for (let y = -size; y <= size; y++) {
                        const goldenOffset = (x * y) / this.PHI;
                        this.gridPoints.push({
                            x: offsetX + x * spacing + Math.sin(goldenOffset) * 2,
                            y: offsetY + y * spacing + Math.cos(goldenOffset) * 2,
                            noiseOffset: Math.random() * 10,
                        });
                    }
                }
                console.log('Generated ' + this.gridPoints.length + ' grid points');
            }

            setupEventListeners() {
                // Mouse tracking
                this.canvas.addEventListener('mousemove', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mousePos.x = e.clientX - rect.left;
                    this.mousePos.y = e.clientY - rect.top;
                });

                this.canvas.addEventListener('mouseleave', () => {
                    this.mousePos.x = -1000;
                    this.mousePos.y = -1000;
                });

                // Keyboard controls
                document.addEventListener('keydown', (e) => {
                    switch(e.code) {
                        case 'Space':
                            e.preventDefault();
                            this.togglePlayPause();
                            break;
                        case 'KeyR':
                            this.reset();
                            break;
                        case 'KeyF':
                            this.toggleFullscreen();
                            break;
                    }
                });
            }
            
            start() {
                if (this.isPlaying) {
                    this.animate();
                }
            }
            
            animate() {
                if (!this.isPlaying) return;
                
                this.time = (performance.now() - this.startTime) * 0.001;
                this.render();
                
                this.animationFrame = requestAnimationFrame(() => this.animate());
            }
            
            render() {
                // Clear canvas
                this.ctx.fillStyle = this.settings.colors?.background || '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;

                // Draw XY Grid if enabled
                if (this.settings.xyGrid?.show) {
                    this.drawXYGrid();
                }

                // Draw grid lines (golden ratio connections)
                this.drawGridLines(centerX, centerY);

                // Draw grid dots
                this.drawGridDots();

                // Draw shapes
                this.drawShapes(centerX, centerY);
            }
            
            // Utility functions
            noise(x, y, t) {
                return Math.sin(x * 0.1 + t) * Math.cos(y * 0.1 + t) * 0.5;
            }

            parseHexColor(hex) {
                const c = hex.replace('#', '');
                const r = parseInt(c.substring(0, 2), 16);
                const g = parseInt(c.substring(2, 4), 16);
                const b = parseInt(c.substring(4, 6), 16);
                return [r, g, b];
            }

            applyEasing(easingType, t) {
                switch (easingType) {
                    case 'easeInOutQuad':
                        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                    case 'easeInOutCubic':
                        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    case 'linear':
                    default:
                        return t;
                }
            }

            getMultiEasedColor(time, colors, alpha, cycleDuration, easingType) {
                const n = colors.length;
                let progress = (time % cycleDuration) / cycleDuration;
                const scaledProgress = progress * n;
                const index = Math.floor(scaledProgress);
                const nextIndex = (index + 1) % n;
                let t = scaledProgress - index;
                t = this.applyEasing(easingType, t);
                const [r1, g1, b1] = this.parseHexColor(colors[index]);
                const [r2, g2, b2] = this.parseHexColor(colors[nextIndex]);
                const r = Math.round(r1 + (r2 - r1) * t);
                const g = Math.round(g1 + (g2 - g1) * t);
                const b = Math.round(b1 + (b2 - b1) * t);
                return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
            }

            getShapeColor(alpha, colorScheme) {
                switch (colorScheme) {
                    case 'red': return \`rgba(255,100,100,\${alpha})\`;
                    case 'green': return \`rgba(100,255,100,\${alpha})\`;
                    case 'purple': return \`rgba(200,100,255,\${alpha})\`;
                    case 'grayscale': return \`rgba(220,220,220,\${alpha})\`;
                    case 'blue':
                    default: return \`rgba(200,220,255,\${alpha})\`;
                }
            }

            drawXYGrid() {
                const { xyGrid } = this.settings;
                if (!xyGrid.show) return;

                this.ctx.strokeStyle = xyGrid.color || '#444444';
                this.ctx.lineWidth = xyGrid.lineWidth || 0.5;
                this.ctx.globalAlpha = xyGrid.opacity || 0.86;

                const spacing = xyGrid.spacing || 35;
                const size = xyGrid.size || 15;

                // Draw vertical lines
                for (let i = -size; i <= size; i++) {
                    const x = this.canvas.width / 2 + i * spacing;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }

                // Draw horizontal lines
                for (let i = -size; i <= size; i++) {
                    const y = this.canvas.height / 2 + i * spacing;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }

                this.ctx.globalAlpha = 1;
            }

            drawGridLines(centerX, centerY) {
                const { grid } = this.settings;
                if (!grid.showConnections) return;

                this.ctx.strokeStyle = grid.connectionColor || '#0077ff';
                this.ctx.lineWidth = grid.connectionWidth || 1;
                this.ctx.globalAlpha = grid.connectionOpacity || 0.5;

                // Draw golden ratio connections
                for (let i = 0; i < this.gridPoints.length; i++) {
                    for (let j = i + 1; j < this.gridPoints.length; j++) {
                        const p1 = this.gridPoints[i];
                        const p2 = this.gridPoints[j];
                        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

                        if (distance < grid.spacing * this.PHI) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(p1.x, p1.y);
                            this.ctx.lineTo(p2.x, p2.y);
                            this.ctx.stroke();
                        }
                    }
                }

                this.ctx.globalAlpha = 1;
            }

            drawGridDots() {
                const { grid } = this.settings;
                if (!grid.showVertices) return;

                const breathingIntensity = grid.breathingIntensity || 0.2;
                const breathingSpeed = grid.breathingSpeed || 1;
                const baseDotSize = grid.baseDotSize || 3;

                this.gridPoints.forEach(point => {
                    const noiseValue = this.noise(point.x, point.y, this.time * breathingSpeed + point.noiseOffset);
                    const breathingEffect = 1 + noiseValue * breathingIntensity;
                    const dotSize = baseDotSize * breathingEffect;

                    this.ctx.fillStyle = grid.vertexColor || '#0077ff';
                    this.ctx.globalAlpha = grid.vertexOpacity || 0.8;
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
                    this.ctx.fill();
                });

                this.ctx.globalAlpha = 1;
            }

            drawShapes(centerX, centerY) {
                const { shapes } = this.settings;
                if (!shapes?.primary) return;

                const shape = shapes.primary;
                if (shape.enabled === false) return;

                // Draw stacked shapes if enabled (this is critical for green flower!)
                if (shape.stacking?.enabled) {
                    for (let i = 0; i < shape.stacking.count; i++) {
                        const stackTimeOffset = shape.stacking.timeOffset + (i * shape.stacking.interval);
                        const adjustedTime = this.time + stackTimeOffset * 0.001; // Convert to seconds

                        // Calculate animation parameters for this stack layer
                        const animParams = this.calculateAnimationParams(shape, adjustedTime);

                        // Draw fractal layers if enabled
                        if (shape.fractal?.depth > 1) {
                            this.drawFractalShape(centerX, centerY, shape, animParams, stackTimeOffset * 0.001);
                        } else {
                            this.drawSingleShape(centerX, centerY, shape, animParams, stackTimeOffset * 0.001);
                        }
                    }
                } else {
                    // Single shape without stacking
                    const animParams = this.calculateAnimationParams(shape);

                    if (shape.fractal?.depth > 1) {
                        this.drawFractalShape(centerX, centerY, shape, animParams);
                    } else {
                        this.drawSingleShape(centerX, centerY, shape, animParams);
                    }
                }
            }

            calculateAnimationParams(shape, timeOverride = null) {
                const { animation } = shape;
                const currentTime = timeOverride !== null ? timeOverride : this.time;

                let size = shape.size;
                let opacity = shape.opacity;
                let rotation = 0;

                if (!animation) {
                    return { size, opacity, rotation };
                }

                // Apply animation modes with proper timing
                if (animation.mode === 'pulse') {
                    const speed = animation.speed || 0.0006;
                    const intensity = animation.intensity || 0.4;
                    const pulsePhase = currentTime * speed * 1000; // Convert to match original timing
                    const pulseValue = Math.sin(pulsePhase) * 0.5 + 0.5;

                    size *= (1 + pulseValue * intensity);
                    opacity *= (0.7 + pulseValue * 0.3);
                } else if (animation.mode === 'grow') {
                    const speed = animation.speed || 0.0006;
                    const intensity = animation.intensity || 0.4;
                    const growPhase = currentTime * speed * 1000;
                    const growValue = (Math.sin(growPhase) + 1) / 2;

                    size *= (0.5 + growValue * intensity);
                }

                // Add rotation if specified
                if (animation.rotation) {
                    rotation = currentTime * (animation.rotationSpeed || 0.1);
                }

                return { size, opacity, rotation };
            }

            drawSingleShape(centerX, centerY, shape, animParams, timeOffset = 0) {
                this.ctx.save();
                this.ctx.translate(centerX, centerY);
                this.ctx.rotate(animParams.rotation);

                // Get color - use GLOBAL gradient colors (this is the key!)
                let color;
                const globalGradient = this.settings.colors?.gradient?.shapes;
                if (globalGradient?.enabled) {
                    const colors = globalGradient.colors || ['#377642', '#335b39', '#39d5ae', '#2aea6a'];
                    const cycleDuration = this.settings.colors.gradient.cycleDuration || 9600;
                    const easingType = this.settings.colors.gradient.easing || 'easeInOutCubic';
                    const adjustedTime = this.time + timeOffset;
                    color = this.getMultiEasedColor(adjustedTime, colors, animParams.opacity, cycleDuration, easingType);
                } else {
                    const baseColor = shape.color || this.settings.colors?.lineColor || '#0077ff';
                    const [r, g, b] = this.parseHexColor(baseColor);
                    color = \`rgba(\${r}, \${g}, \${b}, \${animParams.opacity})\`;
                }

                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = shape.thickness || 2;

                // Draw based on shape type
                switch (shape.type) {
                    case 'flowerOfLife':
                        this.drawFlowerOfLife(0, 0, animParams.size, color);
                        break;
                    case 'circle':
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, animParams.size, 0, Math.PI * 2);
                        this.ctx.stroke();
                        break;
                    case 'polygon':
                        this.drawPolygon(0, 0, animParams.size, shape.vertices || 6);
                        break;
                    default:
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, animParams.size, 0, Math.PI * 2);
                        this.ctx.stroke();
                }

                this.ctx.restore();
            }

            drawFlowerOfLife(centerX, centerY, radius, color) {
                this.ctx.strokeStyle = color;

                // Central circle
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();

                // First ring of 6 circles
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }

                // Second ring of 12 circles
                const outerRadius = radius * Math.sqrt(3);
                for (let i = 0; i < 12; i++) {
                    const angle = (i * Math.PI) / 6;
                    const x = centerX + Math.cos(angle) * outerRadius;
                    const y = centerY + Math.sin(angle) * outerRadius;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }

            drawPolygon(centerX, centerY, radius, vertices) {
                this.ctx.beginPath();
                for (let i = 0; i < vertices; i++) {
                    const angle = (i * 2 * Math.PI) / vertices - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.stroke();
            }

            drawFractalShape(centerX, centerY, shape, animParams, baseTimeOffset = 0) {
                const { fractal } = shape;
                const depth = fractal.depth || 3;
                const scale = fractal.scale || 0.7;
                const thicknessFalloff = fractal.thicknessFalloff || 0.89;

                for (let i = 0; i < depth; i++) {
                    const layerScale = Math.pow(scale, i);
                    const layerThickness = shape.thickness * Math.pow(thicknessFalloff, i);
                    const layerTimeOffset = baseTimeOffset + i * 0.5;

                    // Calculate layer-specific animation with proper time offset
                    const layerAnimParams = {
                        size: animParams.size * layerScale,
                        opacity: animParams.opacity * Math.pow(0.8, i), // More subtle falloff
                        rotation: animParams.rotation + layerTimeOffset * 0.1
                    };

                    // Temporarily override thickness for this layer
                    const originalThickness = shape.thickness;
                    shape.thickness = layerThickness;

                    this.drawSingleShape(centerX, centerY, shape, layerAnimParams, layerTimeOffset);

                    // Restore original thickness
                    shape.thickness = originalThickness;
                }
            }
            
            togglePlayPause() {
                this.isPlaying = !this.isPlaying;
                if (this.isPlaying) {
                    this.startTime = performance.now() - this.time * 1000;
                    this.animate();
                } else {
                    if (this.animationFrame) {
                        cancelAnimationFrame(this.animationFrame);
                    }
                }

                const btn = document.getElementById('play-pause-btn');
                if (btn) {
                    btn.textContent = this.isPlaying ? '⏸️' : '▶️';
                }
            }

            reset() {
                this.time = 0;
                this.startTime = performance.now();
                this.render();
            }

            toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        }
    `;
  }
  
  /**
   * Generate application logic and initialization
   */
  static generateApplicationLogic(config) {
    return `
        // Initialize the standalone application
        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('sacred-grid-canvas');
            const renderer = new StandaloneSacredGridRenderer(canvas, SACRED_GRID_SNAPSHOT);
            
            // Setup control buttons
            ${config.includeControls ? `
            const playPauseBtn = document.getElementById('play-pause-btn');
            const resetBtn = document.getElementById('reset-btn');
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            
            if (playPauseBtn) {
                playPauseBtn.addEventListener('click', () => renderer.togglePlayPause());
            }
            
            if (resetBtn) {
                resetBtn.addEventListener('click', () => renderer.reset());
            }
            
            if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', () => renderer.toggleFullscreen());
            }
            ` : ''}
            
            console.log('✅ Sacred Grid Standalone Player ready!');
        });
    `;
  }
  
  /**
   * Get default export configuration
   */
  static getDefaultConfig(width = 1920, height = 1080) {
    return {
      title: 'Sacred Grid Player',
      width,
      height,
      includeControls: true,
      backgroundColor: '#000000',
      enableFullscreen: true,
      showInfo: true,
      optimize: true
    };
  }

  /**
   * Get optimized export configuration for minimal file size
   */
  static getOptimizedConfig(width = 1920, height = 1080) {
    return {
      title: 'Sacred Grid Player',
      width,
      height,
      includeControls: false,
      backgroundColor: '#000000',
      enableFullscreen: false,
      showInfo: false,
      optimize: true,
      customCSS: '',
      customJS: ''
    };
  }
}
