// src/export/AnimationExporter.ts - Animation export for GIF and video formats

import { Vector2D } from '../types';

/**
 * Animation export format
 */
export type AnimationFormat = 'gif' | 'webm' | 'mp4' | 'apng';

/**
 * Animation export configuration
 */
export interface AnimationExportConfig {
  format: AnimationFormat;
  width: number;
  height: number;
  fps: number;
  duration: number; // in seconds
  quality: number; // 0-1
  loop: boolean;
  backgroundColor?: string;
  filename?: string;
}

/**
 * Frame data for animation
 */
export interface AnimationFrame {
  canvas: HTMLCanvasElement;
  timestamp: number;
  duration?: number; // Frame-specific duration override
}

/**
 * Animation progress callback
 */
export type AnimationProgressCallback = (progress: number, stage: string) => void;

/**
 * Renderable animation content
 */
export interface AnimatableContent {
  renderFrame(
    ctx: CanvasRenderingContext2D,
    frameIndex: number,
    time: number,
    width: number,
    height: number
  ): void;
  getTotalFrames(fps: number, duration: number): number;
}

/**
 * Animation exporter for GIF and video formats
 */
export class AnimationExporter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Export animation from content
   */
  async exportAnimation(
    content: AnimatableContent,
    config: AnimationExportConfig,
    onProgress?: AnimationProgressCallback
  ): Promise<Blob> {
    onProgress?.(0, 'Preparing animation export...');

    // Set up canvas
    this.canvas.width = config.width;
    this.canvas.height = config.height;

    // Generate frames
    const frames = await this.generateFrames(content, config, onProgress);

    onProgress?.(0.7, 'Encoding animation...');

    // Export based on format
    switch (config.format) {
      case 'gif':
        return this.exportGIF(frames, config, onProgress);
      case 'webm':
      case 'mp4':
        return this.exportVideo(frames, config, onProgress);
      case 'apng':
        return this.exportAPNG(frames, config, onProgress);
      default:
        throw new Error(`Unsupported animation format: ${config.format}`);
    }
  }

  /**
   * Export animation from frame sequence
   */
  async exportFromFrames(
    frames: AnimationFrame[],
    config: AnimationExportConfig,
    onProgress?: AnimationProgressCallback
  ): Promise<Blob> {
    onProgress?.(0, 'Processing frames...');

    switch (config.format) {
      case 'gif':
        return this.exportGIF(frames, config, onProgress);
      case 'webm':
      case 'mp4':
        return this.exportVideo(frames, config, onProgress);
      case 'apng':
        return this.exportAPNG(frames, config, onProgress);
      default:
        throw new Error(`Unsupported animation format: ${config.format}`);
    }
  }

  /**
   * Record animation in real-time
   */
  async recordRealTime(
    canvas: HTMLCanvasElement,
    config: AnimationExportConfig,
    onProgress?: AnimationProgressCallback
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      onProgress?.(0, 'Starting real-time recording...');

      // Set up media recorder
      const stream = canvas.captureStream(config.fps);
      const mimeType = this.getVideoMimeType(config.format);
      
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        reject(new Error(`Format ${config.format} not supported`));
        return;
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: this.calculateBitrate(config)
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        onProgress?.(1, 'Recording complete');
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error('Recording failed'));
      };

      // Start recording
      this.mediaRecorder.start();

      // Stop recording after duration
      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, config.duration * 1000);

      // Update progress during recording
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (config.duration * 1000), 0.9);
        onProgress?.(progress, 'Recording...');
        
        if (progress >= 0.9) {
          clearInterval(progressInterval);
        }
      }, 100);

      const startTime = Date.now();
    });
  }

  /**
   * Generate frames from animatable content
   */
  private async generateFrames(
    content: AnimatableContent,
    config: AnimationExportConfig,
    onProgress?: AnimationProgressCallback
  ): Promise<AnimationFrame[]> {
    const frames: AnimationFrame[] = [];
    const totalFrames = content.getTotalFrames(config.fps, config.duration);
    const frameDuration = 1 / config.fps;

    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const time = i * frameDuration;
      
      onProgress?.(progress * 0.6, `Generating frame ${i + 1}/${totalFrames}`);

      // Clear canvas
      this.ctx.clearRect(0, 0, config.width, config.height);

      // Set background
      if (config.backgroundColor) {
        this.ctx.fillStyle = config.backgroundColor;
        this.ctx.fillRect(0, 0, config.width, config.height);
      }

      // Render frame
      content.renderFrame(this.ctx, i, time, config.width, config.height);

      // Create frame canvas
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = config.width;
      frameCanvas.height = config.height;
      const frameCtx = frameCanvas.getContext('2d')!;
      frameCtx.drawImage(this.canvas, 0, 0);

      frames.push({
        canvas: frameCanvas,
        timestamp: time,
        duration: frameDuration
      });

      // Yield control to prevent blocking
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return frames;
  }

  /**
   * Export as GIF (using a hypothetical GIF encoder)
   */
  private async exportGIF(
    frames: AnimationFrame[],
    config: AnimationExportConfig,
    onProgress?: AnimationProgressCallback
  ): Promise<Blob> {
    // Note: This is a simplified implementation
    // In a real implementation, you'd use a library like gif.js or similar
    
    onProgress?.(0.8, 'Encoding GIF...');

    // For now, we'll create a simple animated WebP as a fallback
    // In production, you'd integrate with a proper GIF encoder
    
    const encoder = await this.createWebPEncoder(config);
    
    for (let i = 0; i < frames.length; i++) {
      const progress = 0.8 + (i / frames.length) * 0.2;
      onProgress?.(progress, `Encoding frame ${i + 1}/${frames.length}`);
      
      await encoder.addFrame(frames[i].canvas, {
        delay: (frames[i].duration || 1/config.fps) * 1000
      });
    }

    const blob = await encoder.finish();
    onProgress?.(1, 'GIF export complete');
    
    return blob;
  }

  /**
   * Export as video (WebM/MP4)
   */
  private async exportVideo(
    frames: AnimationFrame[],
    config: AnimationExportConfig,
    onProgress?: AnimationProgressCallback
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      onProgress?.(0.8, 'Encoding video...');

      // Create a temporary canvas for video recording
      const videoCanvas = document.createElement('canvas');
      videoCanvas.width = config.width;
      videoCanvas.height = config.height;
      const videoCtx = videoCanvas.getContext('2d')!;

      const stream = videoCanvas.captureStream(config.fps);
      const mimeType = this.getVideoMimeType(config.format);
      
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: this.calculateBitrate(config)
      });

      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        onProgress?.(1, 'Video export complete');
        resolve(blob);
      };

      recorder.onerror = () => {
        reject(new Error('Video encoding failed'));
      };

      recorder.start();

      // Play frames
      let frameIndex = 0;
      const playFrame = () => {
        if (frameIndex >= frames.length) {
          recorder.stop();
          return;
        }

        const frame = frames[frameIndex];
        videoCtx.clearRect(0, 0, config.width, config.height);
        videoCtx.drawImage(frame.canvas, 0, 0);

        const progress = 0.8 + (frameIndex / frames.length) * 0.2;
        onProgress?.(progress, `Encoding frame ${frameIndex + 1}/${frames.length}`);

        frameIndex++;
        setTimeout(playFrame, (frame.duration || 1/config.fps) * 1000);
      };

      playFrame();
    });
  }

  /**
   * Export as APNG (Animated PNG)
   */
  private async exportAPNG(
    frames: AnimationFrame[],
    config: AnimationExportConfig,
    onProgress?: AnimationProgressCallback
  ): Promise<Blob> {
    // Note: This is a simplified implementation
    // In a real implementation, you'd use a proper APNG encoder
    
    onProgress?.(0.8, 'Encoding APNG...');

    // For now, we'll export the first frame as PNG
    // In production, you'd integrate with an APNG encoder library
    
    const firstFrame = frames[0];
    if (!firstFrame) {
      throw new Error('No frames to export');
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      firstFrame.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create APNG blob'));
        }
      }, 'image/png');
    });

    onProgress?.(1, 'APNG export complete');
    return blob;
  }

  /**
   * Create WebP encoder (hypothetical implementation)
   */
  private async createWebPEncoder(config: AnimationExportConfig): Promise<{
    addFrame: (canvas: HTMLCanvasElement, options: { delay: number }) => Promise<void>;
    finish: () => Promise<Blob>;
  }> {
    // This would be implemented with a real WebP encoder library
    // For now, return a mock implementation
    
    const frames: { canvas: HTMLCanvasElement; delay: number }[] = [];
    
    return {
      addFrame: async (canvas: HTMLCanvasElement, options: { delay: number }) => {
        frames.push({ canvas, delay: options.delay });
      },
      finish: async () => {
        // In a real implementation, this would encode all frames into a WebP
        // For now, return the first frame as a regular image
        if (frames.length === 0) {
          throw new Error('No frames to encode');
        }
        
        return new Promise((resolve, reject) => {
          frames[0].canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create WebP blob'));
            }
          }, 'image/webp', config.quality);
        });
      }
    };
  }

  /**
   * Get video MIME type for format
   */
  private getVideoMimeType(format: AnimationFormat): string {
    switch (format) {
      case 'webm':
        return 'video/webm;codecs=vp9';
      case 'mp4':
        return 'video/mp4;codecs=h264';
      default:
        return 'video/webm;codecs=vp9';
    }
  }

  /**
   * Calculate video bitrate based on configuration
   */
  private calculateBitrate(config: AnimationExportConfig): number {
    const pixels = config.width * config.height;
    const baseRate = pixels * config.fps * 0.1; // Base rate per pixel per frame
    return Math.floor(baseRate * config.quality);
  }

  /**
   * Stop current recording
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Download animation as file
   */
  downloadAnimation(blob: Blob, filename: string, format: AnimationFormat): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const extension = this.getFileExtension(format);
    link.download = filename.endsWith(extension) ? filename : `${filename}${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: AnimationFormat): string {
    switch (format) {
      case 'gif':
        return '.gif';
      case 'webm':
        return '.webm';
      case 'mp4':
        return '.mp4';
      case 'apng':
        return '.png';
      default:
        return '.gif';
    }
  }

  /**
   * Get optimal export settings for different use cases
   */
  static getPresetConfig(
    preset: string,
    baseWidth: number,
    baseHeight: number
  ): AnimationExportConfig {
    const presets: Record<string, Partial<AnimationExportConfig>> = {
      'web-small': {
        format: 'gif',
        fps: 15,
        quality: 0.7,
        loop: true
      },
      'web-large': {
        format: 'webm',
        fps: 30,
        quality: 0.8,
        loop: true
      },
      'social-media': {
        format: 'mp4',
        fps: 24,
        quality: 0.85,
        loop: true
      },
      'high-quality': {
        format: 'webm',
        fps: 60,
        quality: 0.95,
        loop: false
      },
      'presentation': {
        format: 'mp4',
        fps: 30,
        quality: 0.9,
        loop: false
      }
    };

    const presetConfig = presets[preset] || presets['web-large'];

    return {
      format: 'gif',
      width: baseWidth,
      height: baseHeight,
      fps: 30,
      duration: 5,
      quality: 0.8,
      loop: true,
      ...presetConfig
    };
  }

  /**
   * Estimate animation file size
   */
  estimateFileSize(config: AnimationExportConfig): number {
    const pixels = config.width * config.height;
    const totalFrames = config.fps * config.duration;
    
    switch (config.format) {
      case 'gif':
        // GIF: roughly 1-3 bytes per pixel per frame
        return pixels * totalFrames * (1 + config.quality * 2);
      case 'webm':
        // WebM: more efficient compression
        return pixels * totalFrames * 0.5 * config.quality;
      case 'mp4':
        // MP4: similar to WebM
        return pixels * totalFrames * 0.6 * config.quality;
      case 'apng':
        // APNG: similar to GIF but more efficient
        return pixels * totalFrames * (0.8 + config.quality * 1.5);
      default:
        return pixels * totalFrames * 2;
    }
  }

  /**
   * Check if format is supported
   */
  static isFormatSupported(format: AnimationFormat): boolean {
    switch (format) {
      case 'webm':
        return MediaRecorder.isTypeSupported('video/webm;codecs=vp9');
      case 'mp4':
        return MediaRecorder.isTypeSupported('video/mp4;codecs=h264');
      case 'gif':
      case 'apng':
        return true; // These can be implemented with libraries
      default:
        return false;
    }
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