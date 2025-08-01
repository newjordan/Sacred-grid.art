// src/export/ImageExporter.ts - High-resolution image export system

import { Vector2D } from '../types';

/**
 * Export format options
 */
export type ExportFormat = 'png' | 'jpeg' | 'webp';

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat;
  quality: number; // 0-1 for JPEG/WebP
  width: number;
  height: number;
  scale: number; // Multiplier for high-res export
  backgroundColor?: string;
  transparent?: boolean;
  filename?: string;
}

/**
 * Export progress callback
 */
export type ExportProgressCallback = (progress: number, stage: string) => void;

/**
 * Renderable content interface
 */
export interface RenderableContent {
  render(ctx: CanvasRenderingContext2D, width: number, height: number): void;
}

/**
 * High-resolution image exporter
 */
export class ImageExporter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Export content as image
   */
  async export(
    content: RenderableContent,
    config: ExportConfig,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    onProgress?.(0, 'Preparing export...');

    // Set up canvas for high-resolution export
    const exportWidth = config.width * config.scale;
    const exportHeight = config.height * config.scale;
    
    this.canvas.width = exportWidth;
    this.canvas.height = exportHeight;

    // Set up context
    this.ctx.save();
    this.ctx.scale(config.scale, config.scale);

    onProgress?.(0.1, 'Setting up canvas...');

    // Set background
    if (!config.transparent && config.backgroundColor) {
      this.ctx.fillStyle = config.backgroundColor;
      this.ctx.fillRect(0, 0, config.width, config.height);
    }

    onProgress?.(0.2, 'Rendering content...');

    // Render content
    content.render(this.ctx, config.width, config.height);

    this.ctx.restore();

    onProgress?.(0.8, 'Generating image data...');

    // Convert to blob
    const blob = await this.canvasToBlob(config);

    onProgress?.(1, 'Export complete');

    return blob;
  }

  /**
   * Export multiple frames for animation
   */
  async exportFrames(
    frames: RenderableContent[],
    config: ExportConfig,
    onProgress?: ExportProgressCallback
  ): Promise<Blob[]> {
    const blobs: Blob[] = [];
    
    for (let i = 0; i < frames.length; i++) {
      const frameProgress = i / frames.length;
      onProgress?.(frameProgress, `Exporting frame ${i + 1}/${frames.length}`);
      
      const blob = await this.export(frames[i], config);
      blobs.push(blob);
    }

    onProgress?.(1, 'All frames exported');
    return blobs;
  }

  /**
   * Export with custom render function
   */
  async exportCustom(
    renderFunction: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
    config: ExportConfig,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    const content: RenderableContent = {
      render: renderFunction
    };

    return this.export(content, config, onProgress);
  }

  /**
   * Export canvas directly with exact resolution matching
   */
  async exportCanvas(
    sourceCanvas: HTMLCanvasElement,
    config: Partial<ExportConfig> = {}
  ): Promise<Blob> {
    const fullConfig: ExportConfig = {
      format: 'png',
      quality: 1,
      width: sourceCanvas.width,
      height: sourceCanvas.height,
      scale: 1,
      transparent: true,
      ...config
    };

    // Set up export canvas with exact dimensions
    const exportWidth = fullConfig.width * fullConfig.scale;
    const exportHeight = fullConfig.height * fullConfig.scale;

    console.log('🎯 ImageExporter: Setting up export canvas:', {
      source: { width: sourceCanvas.width, height: sourceCanvas.height },
      config: fullConfig,
      export: { width: exportWidth, height: exportHeight }
    });

    this.canvas.width = exportWidth;
    this.canvas.height = exportHeight;

    // Clear and set background if needed
    this.ctx.clearRect(0, 0, exportWidth, exportHeight);

    if (!fullConfig.transparent && fullConfig.backgroundColor) {
      this.ctx.fillStyle = fullConfig.backgroundColor;
      this.ctx.fillRect(0, 0, exportWidth, exportHeight);
    }

    // Use high-quality image rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Draw source canvas with exact pixel mapping
    this.ctx.drawImage(
      sourceCanvas,
      0, 0, sourceCanvas.width, sourceCanvas.height,
      0, 0, exportWidth, exportHeight
    );

    console.log('✅ ImageExporter: Canvas rendered, converting to blob...');
    return this.canvasToBlob(fullConfig);
  }

  /**
   * Export with tiled rendering for very large images
   */
  async exportTiled(
    content: RenderableContent,
    config: ExportConfig,
    tileSize: number = 2048,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    const exportWidth = config.width * config.scale;
    const exportHeight = config.height * config.scale;

    // Create final canvas
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = exportWidth;
    finalCanvas.height = exportHeight;
    const finalCtx = finalCanvas.getContext('2d')!;

    // Set background
    if (!config.transparent && config.backgroundColor) {
      finalCtx.fillStyle = config.backgroundColor;
      finalCtx.fillRect(0, 0, exportWidth, exportHeight);
    }

    // Calculate tiles
    const tilesX = Math.ceil(exportWidth / tileSize);
    const tilesY = Math.ceil(exportHeight / tileSize);
    const totalTiles = tilesX * tilesY;

    onProgress?.(0, `Rendering ${totalTiles} tiles...`);

    // Render each tile
    for (let tileY = 0; tileY < tilesY; tileY++) {
      for (let tileX = 0; tileX < tilesX; tileX++) {
        const tileIndex = tileY * tilesX + tileX;
        const progress = tileIndex / totalTiles;
        
        onProgress?.(progress * 0.9, `Rendering tile ${tileIndex + 1}/${totalTiles}`);

        // Calculate tile bounds
        const startX = tileX * tileSize;
        const startY = tileY * tileSize;
        const endX = Math.min(startX + tileSize, exportWidth);
        const endY = Math.min(startY + tileSize, exportHeight);
        const currentTileWidth = endX - startX;
        const currentTileHeight = endY - startY;

        // Set up tile canvas
        this.canvas.width = currentTileWidth;
        this.canvas.height = currentTileHeight;

        // Set up context for this tile
        this.ctx.save();
        this.ctx.scale(config.scale, config.scale);
        this.ctx.translate(-startX / config.scale, -startY / config.scale);

        // Render content for this tile
        content.render(this.ctx, config.width, config.height);

        this.ctx.restore();

        // Copy tile to final canvas
        finalCtx.drawImage(this.canvas, startX, startY);
      }
    }

    onProgress?.(0.95, 'Generating final image...');

    // Convert final canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        },
        this.getCanvasMimeType(config.format),
        config.quality
      );
    });

    onProgress?.(1, 'Export complete');
    return blob;
  }

  /**
   * Create print-ready export with specific DPI
   */
  async exportPrintReady(
    content: RenderableContent,
    config: ExportConfig & {
      dpi: number;
      units: 'inches' | 'cm' | 'mm';
      physicalWidth: number;
      physicalHeight: number;
    },
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    // Convert physical dimensions to pixels
    const dpiScale = config.dpi / 72; // 72 DPI is web standard
    let pixelWidth: number, pixelHeight: number;

    switch (config.units) {
      case 'inches':
        pixelWidth = config.physicalWidth * config.dpi;
        pixelHeight = config.physicalHeight * config.dpi;
        break;
      case 'cm':
        pixelWidth = (config.physicalWidth / 2.54) * config.dpi;
        pixelHeight = (config.physicalHeight / 2.54) * config.dpi;
        break;
      case 'mm':
        pixelWidth = (config.physicalWidth / 25.4) * config.dpi;
        pixelHeight = (config.physicalHeight / 25.4) * config.dpi;
        break;
    }

    const printConfig: ExportConfig = {
      ...config,
      width: Math.round(pixelWidth),
      height: Math.round(pixelHeight),
      scale: 1 // Already calculated in pixel dimensions
    };

    return this.export(content, printConfig, onProgress);
  }

  /**
   * Batch export multiple configurations
   */
  async exportBatch(
    content: RenderableContent,
    configs: ExportConfig[],
    onProgress?: ExportProgressCallback
  ): Promise<Map<string, Blob>> {
    const results = new Map<string, Blob>();

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const batchProgress = i / configs.length;
      
      onProgress?.(batchProgress, `Exporting ${config.filename || `export_${i + 1}`}...`);

      const blob = await this.export(content, config);
      const key = config.filename || `export_${i + 1}_${config.width}x${config.height}.${config.format}`;
      results.set(key, blob);
    }

    onProgress?.(1, 'Batch export complete');
    return results;
  }

  /**
   * Convert canvas to blob
   */
  private canvasToBlob(config: ExportConfig): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        },
        this.getCanvasMimeType(config.format),
        config.quality
      );
    });
  }

  /**
   * Get MIME type for canvas export
   */
  private getCanvasMimeType(format: ExportFormat): string {
    switch (format) {
      case 'png':
        return 'image/png';
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/png';
    }
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
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
   * Get optimal export settings for different use cases
   */
  static getPresetConfig(preset: string, baseWidth: number, baseHeight: number): ExportConfig {
    const presets: Record<string, Partial<ExportConfig>> = {
      'web-small': {
        format: 'jpeg',
        quality: 0.8,
        scale: 1,
        backgroundColor: '#ffffff'
      },
      'web-large': {
        format: 'png',
        quality: 1,
        scale: 2,
        transparent: true
      },
      'print-300dpi': {
        format: 'png',
        quality: 1,
        scale: 4.17, // 300 DPI / 72 DPI
        backgroundColor: '#ffffff'
      },
      'social-media': {
        format: 'jpeg',
        quality: 0.9,
        scale: 1,
        backgroundColor: '#ffffff'
      },
      'thumbnail': {
        format: 'jpeg',
        quality: 0.7,
        scale: 0.25,
        backgroundColor: '#ffffff'
      }
    };

    const presetConfig = presets[preset] || presets['web-large'];

    return {
      format: 'png',
      quality: 1,
      width: baseWidth,
      height: baseHeight,
      scale: 1,
      transparent: false,
      ...presetConfig
    };
  }

  /**
   * Estimate export file size
   */
  estimateFileSize(config: ExportConfig): number {
    const pixels = config.width * config.height * Math.pow(config.scale, 2);
    
    switch (config.format) {
      case 'png':
        // PNG: roughly 4 bytes per pixel (RGBA) with compression
        return pixels * 2; // Compressed estimate
      case 'jpeg':
        // JPEG: varies by quality, roughly 0.5-3 bytes per pixel
        return pixels * (0.5 + config.quality * 2.5);
      case 'webp':
        // WebP: similar to JPEG but more efficient
        return pixels * (0.3 + config.quality * 2);
      default:
        return pixels * 2;
    }
  }

  /**
   * Check if export is feasible (memory/size limits)
   */
  checkExportFeasibility(config: ExportConfig): {
    feasible: boolean;
    estimatedSize: number;
    estimatedMemory: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const pixels = config.width * config.height * Math.pow(config.scale, 2);
    const estimatedSize = this.estimateFileSize(config);
    const estimatedMemory = pixels * 4; // 4 bytes per pixel in memory

    let feasible = true;

    // Check memory limits (rough estimates)
    if (estimatedMemory > 500 * 1024 * 1024) { // 500MB
      warnings.push('Export may consume significant memory');
      if (estimatedMemory > 1024 * 1024 * 1024) { // 1GB
        feasible = false;
        warnings.push('Export may fail due to memory constraints');
      }
    }

    // Check file size limits
    if (estimatedSize > 100 * 1024 * 1024) { // 100MB
      warnings.push('Export file will be very large');
    }

    // Check dimensions
    if (config.width * config.scale > 32767 || config.height * config.scale > 32767) {
      feasible = false;
      warnings.push('Export dimensions exceed canvas limits');
    }

    return {
      feasible,
      estimatedSize,
      estimatedMemory,
      warnings
    };
  }

  /**
   * Get canvas for direct manipulation
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get context for direct manipulation
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}