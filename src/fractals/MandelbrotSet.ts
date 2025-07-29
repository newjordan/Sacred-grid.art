// src/fractals/MandelbrotSet.ts - Mandelbrot fractal generation

import { Vector2D } from '../types';

/**
 * Complex number representation
 */
export interface Complex {
  real: number;
  imaginary: number;
}

/**
 * Mandelbrot set configuration
 */
export interface MandelbrotConfig {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  zoom: number;
  maxIterations: number;
  escapeRadius: number;
  colorScheme: 'classic' | 'rainbow' | 'fire' | 'ice' | 'grayscale';
}

/**
 * Mandelbrot calculation result
 */
export interface MandelbrotResult {
  iterations: number;
  escaped: boolean;
  finalZ: Complex;
}

/**
 * Mandelbrot set generator with zoom capability
 */
export class MandelbrotSet {
  private config: MandelbrotConfig;
  private imageData: ImageData | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(config: MandelbrotConfig) {
    this.config = { ...config };
    
    // Create canvas for rendering
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Generate Mandelbrot set
   */
  generate(): ImageData {
    const { width, height, centerX, centerY, zoom, maxIterations } = this.config;
    
    this.imageData = this.ctx.createImageData(width, height);
    const data = this.imageData.data;

    // Calculate the bounds of the complex plane
    const scale = 4 / zoom; // Base scale of 4 units
    const minX = centerX - scale / 2;
    const maxX = centerX + scale / 2;
    const minY = centerY - scale / 2;
    const maxY = centerY + scale / 2;

    // Generate fractal
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        // Map pixel to complex plane
        const x = minX + (px / width) * (maxX - minX);
        const y = minY + (py / height) * (maxY - minY);
        
        // Calculate Mandelbrot iteration
        const result = this.calculateMandelbrot({ real: x, imaginary: y });
        
        // Get color for this point
        const color = this.getColor(result, maxIterations);
        
        // Set pixel color
        const index = (py * width + px) * 4;
        data[index] = color.r;     // Red
        data[index + 1] = color.g; // Green
        data[index + 2] = color.b; // Blue
        data[index + 3] = 255;     // Alpha
      }
    }

    return this.imageData;
  }

  /**
   * Generate Mandelbrot set with progressive rendering
   */
  generateProgressive(
    onProgress?: (progress: number) => void,
    onComplete?: (imageData: ImageData) => void
  ): void {
    const { width, height, centerX, centerY, zoom, maxIterations } = this.config;
    
    this.imageData = this.ctx.createImageData(width, height);
    const data = this.imageData.data;

    // Calculate the bounds of the complex plane
    const scale = 4 / zoom;
    const minX = centerX - scale / 2;
    const maxX = centerX + scale / 2;
    const minY = centerY - scale / 2;
    const maxY = centerY + scale / 2;

    let currentRow = 0;
    const totalRows = height;

    const processRow = () => {
      if (currentRow >= totalRows) {
        onComplete?.(this.imageData!);
        return;
      }

      const py = currentRow;
      
      for (let px = 0; px < width; px++) {
        // Map pixel to complex plane
        const x = minX + (px / width) * (maxX - minX);
        const y = minY + (py / height) * (maxY - minY);
        
        // Calculate Mandelbrot iteration
        const result = this.calculateMandelbrot({ real: x, imaginary: y });
        
        // Get color for this point
        const color = this.getColor(result, maxIterations);
        
        // Set pixel color
        const index = (py * width + px) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }

      currentRow++;
      const progress = currentRow / totalRows;
      onProgress?.(progress);

      // Continue processing next row
      requestAnimationFrame(processRow);
    };

    processRow();
  }

  /**
   * Calculate Mandelbrot iteration for a complex number
   */
  private calculateMandelbrot(c: Complex): MandelbrotResult {
    const { maxIterations, escapeRadius } = this.config;
    
    let z: Complex = { real: 0, imaginary: 0 };
    let iterations = 0;
    const escapeRadiusSquared = escapeRadius * escapeRadius;

    while (iterations < maxIterations) {
      // Calculate z^2 + c
      const zSquared = this.complexSquare(z);
      z = this.complexAdd(zSquared, c);
      
      // Check if escaped
      const magnitudeSquared = z.real * z.real + z.imaginary * z.imaginary;
      if (magnitudeSquared > escapeRadiusSquared) {
        return {
          iterations,
          escaped: true,
          finalZ: z
        };
      }
      
      iterations++;
    }

    return {
      iterations,
      escaped: false,
      finalZ: z
    };
  }

  /**
   * Complex number operations
   */
  private complexAdd(a: Complex, b: Complex): Complex {
    return {
      real: a.real + b.real,
      imaginary: a.imaginary + b.imaginary
    };
  }

  private complexSquare(z: Complex): Complex {
    return {
      real: z.real * z.real - z.imaginary * z.imaginary,
      imaginary: 2 * z.real * z.imaginary
    };
  }

  /**
   * Get color for a Mandelbrot result
   */
  private getColor(
    result: MandelbrotResult,
    maxIterations: number
  ): { r: number; g: number; b: number } {
    if (!result.escaped) {
      return { r: 0, g: 0, b: 0 }; // Black for points in the set
    }

    const t = result.iterations / maxIterations;
    
    switch (this.config.colorScheme) {
      case 'classic':
        return this.getClassicColor(t);
      case 'rainbow':
        return this.getRainbowColor(t);
      case 'fire':
        return this.getFireColor(t);
      case 'ice':
        return this.getIceColor(t);
      case 'grayscale':
        return this.getGrayscaleColor(t);
      default:
        return this.getClassicColor(t);
    }
  }

  /**
   * Color scheme implementations
   */
  private getClassicColor(t: number): { r: number; g: number; b: number } {
    const intensity = Math.floor(t * 255);
    return {
      r: intensity,
      g: intensity / 2,
      b: intensity / 4
    };
  }

  private getRainbowColor(t: number): { r: number; g: number; b: number } {
    const hue = t * 360;
    return this.hslToRgb(hue, 1, 0.5);
  }

  private getFireColor(t: number): { r: number; g: number; b: number } {
    const r = Math.min(255, Math.floor(t * 512));
    const g = Math.max(0, Math.min(255, Math.floor((t - 0.5) * 512)));
    const b = Math.max(0, Math.min(255, Math.floor((t - 0.75) * 1024)));
    return { r, g, b };
  }

  private getIceColor(t: number): { r: number; g: number; b: number } {
    const b = Math.min(255, Math.floor(t * 512));
    const g = Math.max(0, Math.min(255, Math.floor((t - 0.25) * 512)));
    const r = Math.max(0, Math.min(255, Math.floor((t - 0.5) * 512)));
    return { r, g, b };
  }

  private getGrayscaleColor(t: number): { r: number; g: number; b: number } {
    const intensity = Math.floor(t * 255);
    return { r: intensity, g: intensity, b: intensity };
  }

  /**
   * HSL to RGB conversion
   */
  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h = h / 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  /**
   * Zoom into a specific point
   */
  zoomIn(point: Vector2D, zoomFactor: number = 2): void {
    const { width, height, centerX, centerY, zoom } = this.config;
    
    // Convert pixel coordinates to complex plane
    const scale = 4 / zoom;
    const minX = centerX - scale / 2;
    const maxX = centerX + scale / 2;
    const minY = centerY - scale / 2;
    const maxY = centerY + scale / 2;
    
    const newCenterX = minX + (point.x / width) * (maxX - minX);
    const newCenterY = minY + (point.y / height) * (maxY - minY);
    
    this.config.centerX = newCenterX;
    this.config.centerY = newCenterY;
    this.config.zoom *= zoomFactor;
  }

  /**
   * Zoom out
   */
  zoomOut(zoomFactor: number = 2): void {
    this.config.zoom /= zoomFactor;
  }

  /**
   * Pan the view
   */
  pan(deltaX: number, deltaY: number): void {
    const scale = 4 / this.config.zoom;
    const pixelToComplexX = scale / this.config.width;
    const pixelToComplexY = scale / this.config.height;
    
    this.config.centerX -= deltaX * pixelToComplexX;
    this.config.centerY -= deltaY * pixelToComplexY;
  }

  /**
   * Reset to default view
   */
  reset(): void {
    this.config.centerX = -0.5;
    this.config.centerY = 0;
    this.config.zoom = 1;
  }

  /**
   * Set color scheme
   */
  setColorScheme(scheme: MandelbrotConfig['colorScheme']): void {
    this.config.colorScheme = scheme;
  }

  /**
   * Set maximum iterations
   */
  setMaxIterations(maxIterations: number): void {
    this.config.maxIterations = maxIterations;
  }

  /**
   * Get interesting points in the Mandelbrot set
   */
  getInterestingPoints(): Array<{
    name: string;
    centerX: number;
    centerY: number;
    zoom: number;
  }> {
    return [
      { name: 'Overview', centerX: -0.5, centerY: 0, zoom: 1 },
      { name: 'Seahorse Valley', centerX: -0.75, centerY: 0.1, zoom: 100 },
      { name: 'Lightning', centerX: -1.775, centerY: 0, zoom: 1000 },
      { name: 'Spiral', centerX: -0.16, centerY: 1.04, zoom: 500 },
      { name: 'Feather', centerX: -0.7269, centerY: 0.1889, zoom: 10000 },
      { name: 'Elephant Valley', centerX: 0.25, centerY: 0, zoom: 100 },
      { name: 'Mini Mandelbrot', centerX: -1.25066, centerY: 0.02012, zoom: 50000 }
    ];
  }

  /**
   * Navigate to an interesting point
   */
  navigateToPoint(pointName: string): boolean {
    const points = this.getInterestingPoints();
    const point = points.find(p => p.name === pointName);
    
    if (!point) return false;
    
    this.config.centerX = point.centerX;
    this.config.centerY = point.centerY;
    this.config.zoom = point.zoom;
    
    return true;
  }

  /**
   * Export current view as data URL
   */
  exportImage(type: string = 'image/png', quality?: number): string {
    if (!this.imageData) {
      this.generate();
    }
    
    this.ctx.putImageData(this.imageData!, 0, 0);
    return this.canvas.toDataURL(type, quality);
  }

  /**
   * Get current configuration
   */
  getConfig(): MandelbrotConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MandelbrotConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Resize canvas if dimensions changed
    if (newConfig.width || newConfig.height) {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
    }
  }

  /**
   * Get canvas for rendering
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Check if a point is likely in the Mandelbrot set (quick test)
   */
  isInSet(c: Complex, quickTest: boolean = true): boolean {
    const maxIter = quickTest ? 50 : this.config.maxIterations;
    const result = this.calculateMandelbrot(c);
    return !result.escaped && result.iterations >= maxIter;
  }

  /**
   * Get statistics about the current view
   */
  getStats(): {
    totalPixels: number;
    pixelsInSet: number;
    averageIterations: number;
    zoomLevel: number;
    viewArea: number;
  } {
    if (!this.imageData) {
      this.generate();
    }

    const { width, height, zoom } = this.config;
    const totalPixels = width * height;
    let pixelsInSet = 0;
    let totalIterations = 0;

    // Sample analysis (for performance, analyze every 10th pixel)
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const scale = 4 / zoom;
        const minX = this.config.centerX - scale / 2;
        const maxX = this.config.centerX + scale / 2;
        const minY = this.config.centerY - scale / 2;
        const maxY = this.config.centerY + scale / 2;
        
        const complexX = minX + (x / width) * (maxX - minX);
        const complexY = minY + (y / height) * (maxY - minY);
        
        const result = this.calculateMandelbrot({ real: complexX, imaginary: complexY });
        
        if (!result.escaped) {
          pixelsInSet++;
        }
        
        totalIterations += result.iterations;
      }
    }

    const sampleCount = Math.ceil(height / 10) * Math.ceil(width / 10);
    const viewArea = Math.pow(4 / zoom, 2);

    return {
      totalPixels,
      pixelsInSet: Math.round((pixelsInSet / sampleCount) * totalPixels),
      averageIterations: totalIterations / sampleCount,
      zoomLevel: zoom,
      viewArea
    };
  }
}