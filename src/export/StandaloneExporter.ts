// src/export/StandaloneExporter.ts - Standalone HTML File Generator
// Converts application snapshots into self-contained HTML files

import { ApplicationSnapshot } from '../utils/StateDuplicator';

export interface StandaloneExportConfig {
  title: string;
  width: number;
  height: number;
  includeControls: boolean;
  backgroundColor: string;
  customCSS?: string;
  customJS?: string;
  enableFullscreen?: boolean;
  showInfo?: boolean;
}

export class StandaloneExporter {
  /**
   * Export an application snapshot as a standalone HTML file
   */
  static async exportStandalone(
    snapshot: ApplicationSnapshot,
    config: StandaloneExportConfig
  ): Promise<Blob> {
    console.log('🚀 Creating standalone HTML file...');
    
    // Generate the complete HTML content
    const htmlContent = this.generateStandaloneHTML(snapshot, config);
    
    // Create blob
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    
    console.log('✅ Standalone HTML file created');
    console.log(`📊 File size: ${(blob.size / 1024).toFixed(1)} KB`);
    
    return blob;
  }
  
  /**
   * Generate the complete standalone HTML content
   */
  private static generateStandaloneHTML(
    snapshot: ApplicationSnapshot,
    config: StandaloneExportConfig
  ): string {
    const settingsJSON = JSON.stringify(snapshot.settings, null, 2);
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
  private static generateCSS(config: StandaloneExportConfig): string {
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
        
        ${config.enableFullscreen ? `
        .fullscreen-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: ${config.backgroundColor};
            z-index: 9999;
        }
        
        .fullscreen-container #sacred-grid-canvas {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
        }
        ` : ''}
        
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
  private static generateControlsHTML(): string {
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
  private static generateInfoPanelHTML(snapshot: ApplicationSnapshot): string {
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
   * Generate the core Sacred Grid renderer (simplified version)
   */
  private static generateCoreRenderer(): string {
    return `
        // Sacred Grid Standalone Renderer
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
                
                // Mouse tracking
                this.mousePos = { x: -1000, y: -1000 };
                
                console.log('🎨 Standalone renderer initialized');
                this.setupEventListeners();
                this.start();
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
                
                // Restore canvas content if available
                if (this.snapshot.canvas.dataURL && !this.hasRenderedSnapshot) {
                    this.restoreCanvasContent();
                    this.hasRenderedSnapshot = true;
                    return;
                }
                
                // Basic rendering (simplified version)
                this.renderBasicGrid();
            }
            
            restoreCanvasContent() {
                const img = new Image();
                img.onload = () => {
                    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                };
                img.src = this.snapshot.canvas.dataURL;
            }
            
            renderBasicGrid() {
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;
                const gridSize = this.settings.grid?.size || 6;
                const spacing = this.settings.grid?.spacing || 50;
                
                this.ctx.strokeStyle = '#0077ff';
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.5;
                
                // Draw basic grid
                for (let x = -gridSize; x <= gridSize; x++) {
                    for (let y = -gridSize; y <= gridSize; y++) {
                        const px = centerX + x * spacing;
                        const py = centerY + y * spacing;
                        
                        this.ctx.beginPath();
                        this.ctx.arc(px, py, 2, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                }
                
                this.ctx.globalAlpha = 1;
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
                this.hasRenderedSnapshot = false;
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
  private static generateApplicationLogic(config: StandaloneExportConfig): string {
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
  static getDefaultConfig(width: number = 1920, height: number = 1080): StandaloneExportConfig {
    return {
      title: 'Sacred Grid Player',
      width,
      height,
      includeControls: true,
      backgroundColor: '#000000',
      enableFullscreen: true,
      showInfo: true
    };
  }
}
