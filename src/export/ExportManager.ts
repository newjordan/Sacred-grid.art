// src/export/ExportManager.ts - PNG Export Manager
// Handles PNG image export only

import { ExportOptions } from '../types';
import { ImageExporter } from './ImageExporter';
import { StandaloneExporter, StandaloneExportConfig } from './StandaloneExporter';
import { ApplicationSnapshot } from '../utils/StateDuplicator';

export interface ExportProgressCallback {
  (progress: number, message: string): void;
}

/**
 * Export manager - handles PNG exports and standalone HTML generation
 */
export class ExportManager {
  private imageExporter: ImageExporter;

  constructor() {
    this.imageExporter = new ImageExporter();
  }

  /**
   * Export PNG image or standalone HTML
   */
  async export(
    settings: any,
    canvas: HTMLCanvasElement | null,
    options: ExportOptions,
    onProgress?: ExportProgressCallback
  ): Promise<void> {
    onProgress?.(0, `Starting ${options.format} export...`);

    try {
      let blob: Blob;
      let filename: string;

      switch (options.format) {
        case 'png':
          if (!canvas) {
            throw new Error('Canvas is required for PNG export');
          }
          blob = await this.exportImage(canvas, options, onProgress);
          filename = 'sacred-grid.png';
          break;

        case 'standalone':
          blob = await this.exportStandalone(settings, canvas, options, onProgress);
          filename = options.standaloneTitle ?
            `${options.standaloneTitle.toLowerCase().replace(/\s+/g, '-')}.html` :
            'sacred-grid-standalone.html';
          break;

        case 'wallpaper':
          // Wallpaper mode automatically enables wallpaperMode
          blob = await this.exportStandalone(settings, canvas, {
            ...options,
            wallpaperMode: true,
            includeControls: false,
            showInfo: false,
            animationSpeed: options.animationSpeed ?? 0.5
          }, onProgress);
          filename = options.standaloneTitle ?
            `${options.standaloneTitle.toLowerCase().replace(/\s+/g, '-')}-wallpaper.html` :
            'sacred-grid-wallpaper.html';
          break;

        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Download the file
      this.downloadBlob(blob, filename);
      onProgress?.(1, `${options.format.toUpperCase()} export complete!`);

    } catch (error) {
      throw error;
    }
  }

  /**
   * Export as PNG image
   */
  private async exportImage(
    canvas: HTMLCanvasElement,
    options: ExportOptions,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    onProgress?.(0.2, 'Preparing PNG export...');

    const config = {
      format: 'png' as const,
      quality: options.quality || 1,
      width: options.width || canvas.width,
      height: options.height || canvas.height,
      scale: options.scale || 1,
      transparent: options.transparent ?? true,
      backgroundColor: options.transparent ? undefined : '#000000'
    };

    onProgress?.(0.5, 'Rendering PNG...');
    return await this.imageExporter.exportCanvas(canvas, config);
  }

  /**
   * Export as standalone HTML file
   */
  private async exportStandalone(
    settings: any,
    canvas: HTMLCanvasElement | null,
    options: ExportOptions,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    onProgress?.(0.2, 'Preparing standalone export...');

    // Import StateDuplicator dynamically to avoid circular dependencies
    const { StateDuplicator } = await import('../utils/StateDuplicator');

    onProgress?.(0.3, 'Creating application snapshot...');

    // Create a snapshot of the current application state
    const snapshot: ApplicationSnapshot = await StateDuplicator.createSnapshot(
      canvas,
      settings,
      {
        performance: {
          fps: 60,
          frameTime: 16.67,
          memoryUsage: 0,
          renderTime: 0,
          particleCount: 0,
          shapeCount: 0
        },
        animation: {
          currentTime: performance.now(),
          isPlaying: true,
          speed: 1,
          startTime: performance.now()
        },
        mouse: {
          position: { x: -1000, y: -1000 },
          isActive: false
        },
        ui: {
          showControls: true,
          activePanel: null,
          isLoading: false
        }
      }
    );

    onProgress?.(0.6, 'Generating standalone HTML...');

    // Create standalone export configuration
    // Use wallpaper preset if wallpaperMode is enabled
    const isWallpaper = options.wallpaperMode ?? false;
    const config: StandaloneExportConfig = isWallpaper
      ? {
          ...StandaloneExporter.getWallpaperConfig(
            options.width || canvas?.width || 1920,
            options.height || canvas?.height || 1080
          ),
          title: options.standaloneTitle || 'Sacred Grid Wallpaper',
          backgroundColor: settings.colors?.background || '#000000',
          scale: options.scale ?? 1,
          animationSpeed: options.animationSpeed ?? 0.5,
          customCSS: options.customCSS || '',
          customJS: options.customJS || ''
        }
      : {
          title: options.standaloneTitle || 'Sacred Grid Player',
          width: options.width || canvas?.width || 1920,
          height: options.height || canvas?.height || 1080,
          includeControls: options.includeControls ?? true,
          backgroundColor: settings.colors?.background || '#000000',
          enableFullscreen: options.enableFullscreen ?? true,
          showInfo: options.showInfo ?? true,
          customCSS: options.customCSS || '',
          customJS: options.customJS || '',
          wallpaperMode: false,
          scale: options.scale ?? 1,
          animationSpeed: options.animationSpeed ?? 1,
          disableMouseInteraction: options.disableMouseInteraction ?? false
        };

    onProgress?.(0.8, 'Creating standalone file...');

    // Generate the standalone HTML file
    const blob = await StandaloneExporter.exportStandalone(snapshot, config);

    onProgress?.(0.9, 'Standalone export complete');
    return blob;
  }





  /**
   * Download a blob as a file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get estimated PNG file size
   */
  static estimateFileSize(options: ExportOptions): string {
    const pixels = (options.width || 1920) * (options.height || 1080);
    const sizeKB = pixels * (options.transparent ? 4 : 3) / 1024;

    if (sizeKB < 1024) {
      return `~${Math.round(sizeKB)} KB`;
    } else {
      return `~${(sizeKB / 1024).toFixed(1)} MB`;
    }
  }
}
