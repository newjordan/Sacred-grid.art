// src/export/StandaloneExporter.ts - Standalone HTML File Generator
// Converts application snapshots into self-contained HTML files

import { ApplicationSnapshot } from '../utils/StateDuplicator';
import { generateWallpaperRenderer } from './WallpaperRenderer';

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
  // Wallpaper mode options
  wallpaperMode?: boolean;
  scale?: number; // Zoom level (0.5 = 50%, 1 = 100%, 2 = 200%)
  animationSpeed?: number; // Speed multiplier (0.5 = half speed, 1 = normal)
  disableMouseInteraction?: boolean;
}

export class StandaloneExporter {
  /**
   * Export an application snapshot as a standalone HTML file
   */
  static async exportStandalone(
    snapshot: ApplicationSnapshot,
    config: StandaloneExportConfig
  ): Promise<Blob> {
    // Generate the complete HTML content
    const htmlContent = this.generateStandaloneHTML(snapshot, config);
    
    // Create blob
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

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

        ${generateWallpaperRenderer()}
        ${!config.wallpaperMode ? this.generateApplicationLogic(config) : ''}
        ${config.customJS || ''}
    </script>
</body>
</html>`;
  }
  
  /**
   * Generate CSS styles for the standalone application
   */
  private static generateCSS(config: StandaloneExportConfig): string {
    const isWallpaper = config.wallpaperMode;
    const scale = config.scale || 1;

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
            ${isWallpaper ? `
            width: 100vw;
            height: 100vh;
            ` : `
            width: ${config.width}px;
            height: ${config.height}px;
            max-width: 100vw;
            max-height: 100vh;
            `}
            transform: scale(${scale});
            transform-origin: center center;
        }

        #sacred-grid-canvas {
            display: block;
            width: 100%;
            height: 100%;
            ${isWallpaper ? `
            cursor: default;
            border-radius: 0;
            box-shadow: none;
            ` : `
            cursor: crosshair;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            `}
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
      showInfo: true,
      wallpaperMode: false,
      scale: 1,
      animationSpeed: 1,
      disableMouseInteraction: false
    };
  }

  /**
   * Get wallpaper-optimized export configuration
   */
  static getWallpaperConfig(width: number = 1920, height: number = 1080): StandaloneExportConfig {
    return {
      title: 'Sacred Grid Wallpaper',
      width,
      height,
      includeControls: false,
      backgroundColor: '#000000',
      enableFullscreen: true,
      showInfo: false,
      wallpaperMode: true,
      scale: 1,
      animationSpeed: 0.5, // Slower, more meditative
      disableMouseInteraction: true
    };
  }
}
