// src/export/ExportManager.js - PNG Export Manager (JavaScript version)
// Handles PNG image export only

export class ExportManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Main export method - PNG and Standalone HTML
   */
  async export(settings, canvas, options, onProgress) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d');

    console.log(`🚀 Starting ${options.format} export with options:`, options);

    let blob;
    let filename;

    switch (options.format) {
      case 'png':
        if (!canvas) {
          throw new Error('Canvas is required for PNG export');
        }
        blob = await this.exportPNG(settings, options, onProgress);
        filename = 'sacred-grid.png';
        break;

      case 'standalone':
        blob = await this.exportStandalone(settings, canvas, options, onProgress);
        filename = options.standaloneTitle ?
          `${options.standaloneTitle.toLowerCase().replace(/\s+/g, '-')}.html` :
          'sacred-grid-standalone.html';
        break;

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Download the file
    onProgress?.(0.95, 'Downloading file...');
    this.downloadBlob(blob, filename);
    onProgress?.(1.0, 'Export complete!');

    console.log(`✅ ${options.format.toUpperCase()} export complete: ${filename}`);
    return blob;
  }

  /**
   * Export PNG image from canvas
   */
  async exportPNG(settings, options, onProgress) {
    onProgress?.(0.1, 'Preparing PNG export...');

    if (!this.canvas) {
      throw new Error('Canvas is required for PNG export');
    }

    onProgress?.(0.3, 'Configuring export settings...');
    
    // Create export configuration
    const config = {
      format: 'png',
      quality: options.quality || 1,
      width: options.width || this.canvas.width,
      height: options.height || this.canvas.height,
      scale: options.scale || 1,
      transparent: options.transparent ?? true,
      backgroundColor: options.transparent ? undefined : '#000000'
    };

    onProgress?.(0.5, 'Rendering PNG...');

    // Create export canvas with proper scaling
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    const exportWidth = config.width * config.scale;
    const exportHeight = config.height * config.scale;
    
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;

    // Clear and set background if needed
    exportCtx.clearRect(0, 0, exportWidth, exportHeight);
    
    if (!config.transparent && config.backgroundColor) {
      exportCtx.fillStyle = config.backgroundColor;
      exportCtx.fillRect(0, 0, exportWidth, exportHeight);
    }

    // Draw source canvas scaled
    exportCtx.drawImage(
      this.canvas,
      0, 0, this.canvas.width, this.canvas.height,
      0, 0, exportWidth, exportHeight
    );

    onProgress?.(0.8, 'Converting to PNG...');

    // Convert to blob
    return new Promise((resolve, reject) => {
      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            onProgress?.(0.9, 'PNG export complete');
            resolve(blob);
          } else {
            reject(new Error('Failed to generate PNG blob'));
          }
        },
        'image/png',
        config.quality
      );
    });
  }

  /**
   * Export as standalone HTML file
   */
  async exportStandalone(settings, canvas, options, onProgress) {
    onProgress?.(0.1, 'Preparing standalone export...');

    try {
      // Import StateDuplicator dynamically
      const { StateDuplicator } = await import('../utils/StateDuplicator.js');
      const { StandaloneExporter } = await import('./StandaloneExporter.js');

      onProgress?.(0.3, 'Creating application snapshot...');

      // Create a snapshot of the current application state
      const snapshot = await StateDuplicator.createSnapshot(
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
      const config = {
        title: options.standaloneTitle || 'Sacred Grid Player',
        width: options.width || canvas?.width || 1920,
        height: options.height || canvas?.height || 1080,
        includeControls: options.includeControls ?? true,
        backgroundColor: settings.colors?.background || '#000000',
        enableFullscreen: options.enableFullscreen ?? true,
        showInfo: options.showInfo ?? true,
        customCSS: options.customCSS || '',
        customJS: options.customJS || '',
        optimize: options.optimize ?? true,
        optimizationLevel: options.optimizationLevel || 'default'
      };

      onProgress?.(0.8, 'Creating standalone file...');

      // Generate the standalone HTML file
      const blob = await StandaloneExporter.exportStandalone(snapshot, config);

      onProgress?.(0.9, 'Standalone export complete');
      return blob;
    } catch (error) {
      console.error('Standalone export failed:', error);
      throw error;
    }
  }

  /**
   * Download a blob as a file
   */
  downloadBlob(blob, filename) {
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
  static estimateFileSize(options) {
    const pixels = (options.width || 1920) * (options.height || 1080);
    const sizeKB = pixels * (options.transparent ? 4 : 3) / 1024;

    if (sizeKB < 1024) {
      return `~${Math.round(sizeKB)} KB`;
    } else {
      return `~${(sizeKB / 1024).toFixed(1)} MB`;
    }
  }
}
