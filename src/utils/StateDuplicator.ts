// src/utils/StateDuplicator.ts - Complete Application State Duplication System
// Captures the exact current state of the Sacred Grid application

import { SacredGridSettings, PerformanceMetrics, LayerConfig } from '../types';

export interface ApplicationSnapshot {
  // Core settings
  settings: SacredGridSettings;
  
  // Canvas state
  canvas: {
    width: number;
    height: number;
    imageData?: ImageData;
    dataURL?: string;
  };
  
  // Animation state
  animation: {
    currentTime: number;
    isPlaying: boolean;
    speed: number;
    startTime: number;
  };
  
  // Mouse state
  mouse: {
    position: { x: number; y: number };
    isActive: boolean;
  };
  
  // Performance metrics
  performance: PerformanceMetrics;
  
  // Layer configuration
  layers: LayerConfig[];
  
  // UI state
  ui: {
    showControls: boolean;
    activePanel: string | null;
    isLoading: boolean;
  };
  
  // Metadata
  metadata: {
    timestamp: number;
    version: string;
    userAgent: string;
    screenResolution: { width: number; height: number };
  };
}

export class StateDuplicator {
  /**
   * Create a complete snapshot of the current application state
   */
  static async createSnapshot(
    canvas: HTMLCanvasElement | null,
    settings: SacredGridSettings,
    additionalState?: {
      performance?: PerformanceMetrics;
      layers?: LayerConfig[];
      ui?: any;
      animation?: any;
      mouse?: any;
    }
  ): Promise<ApplicationSnapshot> {
    // Capture canvas state
    const canvasState = await this.captureCanvasState(canvas);
    
    // Deep clone settings to avoid reference issues
    const clonedSettings = this.deepClone(settings);
    
    // Capture animation state
    const animationState = this.captureAnimationState(additionalState?.animation);
    
    // Capture mouse state
    const mouseState = this.captureMouseState(additionalState?.mouse);
    
    // Create complete snapshot
    const snapshot: ApplicationSnapshot = {
      settings: clonedSettings,
      canvas: canvasState,
      animation: animationState,
      mouse: mouseState,
      performance: additionalState?.performance || this.getDefaultPerformanceMetrics(),
      layers: additionalState?.layers || this.getDefaultLayers(),
      ui: {
        showControls: additionalState?.ui?.showControls ?? true,
        activePanel: additionalState?.ui?.activePanel || null,
        isLoading: additionalState?.ui?.isLoading ?? false
      },
      metadata: {
        timestamp: Date.now(),
        version: '1.0.0',
        userAgent: navigator.userAgent,
        screenResolution: {
          width: window.screen.width,
          height: window.screen.height
        }
      }
    };

    return snapshot;
  }
  
  /**
   * Capture the current canvas state including visual content
   */
  private static async captureCanvasState(canvas: HTMLCanvasElement | null): Promise<ApplicationSnapshot['canvas']> {
    if (!canvas) {
      return {
        width: 1920,
        height: 1080
      };
    }
    
    try {
      // Get canvas dimensions
      const width = canvas.width;
      const height = canvas.height;
      
      // Capture image data for pixel-perfect reproduction
      const ctx = canvas.getContext('2d');
      const imageData = ctx?.getImageData(0, 0, width, height);
      
      // Also capture as data URL for easier handling
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      return {
        width,
        height,
        imageData,
        dataURL
      };
    } catch (error) {
      return {
        width: canvas.width,
        height: canvas.height
      };
    }
  }
  
  /**
   * Capture current animation state
   */
  private static captureAnimationState(animationState?: any): ApplicationSnapshot['animation'] {
    return {
      currentTime: animationState?.currentTime || performance.now(),
      isPlaying: animationState?.isPlaying ?? true,
      speed: animationState?.speed || 1,
      startTime: animationState?.startTime || performance.now()
    };
  }
  
  /**
   * Capture current mouse state
   */
  private static captureMouseState(mouseState?: any): ApplicationSnapshot['mouse'] {
    return {
      position: mouseState?.position || { x: -1000, y: -1000 },
      isActive: mouseState?.isActive ?? false
    };
  }
  
  /**
   * Deep clone an object to avoid reference issues
   */
  private static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }
    
    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    
    return obj;
  }
  
  /**
   * Get default performance metrics
   */
  private static getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      renderTime: 0,
      particleCount: 0,
      shapeCount: 0
    };
  }
  
  /**
   * Get default layer configuration
   */
  private static getDefaultLayers(): LayerConfig[] {
    return [
      {
        id: 'main',
        name: 'Main Layer',
        visible: true,
        opacity: 1,
        blendMode: 'source-over' as any,
        zIndex: 0,
        locked: false
      }
    ];
  }
  
  /**
   * Validate a snapshot to ensure it contains all required data
   */
  static validateSnapshot(snapshot: ApplicationSnapshot): boolean {
    try {
      // Check required properties
      if (!snapshot.settings || !snapshot.canvas || !snapshot.metadata) {
        return false;
      }
      
      // Check settings structure
      if (!snapshot.settings.grid || !snapshot.settings.colors || !snapshot.settings.animation) {
        return false;
      }
      
      // Check canvas dimensions
      if (!snapshot.canvas.width || !snapshot.canvas.height) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get a summary of the snapshot for debugging
   */
  static getSnapshotSummary(snapshot: ApplicationSnapshot): string {
    const summary = [
      `📸 Sacred Grid Snapshot Summary`,
      `⏰ Created: ${new Date(snapshot.metadata.timestamp).toLocaleString()}`,
      `🎨 Canvas: ${snapshot.canvas.width}x${snapshot.canvas.height}`,
      `⚙️ Settings: ${Object.keys(snapshot.settings).length} categories`,
      `🎮 Animation: ${snapshot.animation.isPlaying ? 'Playing' : 'Paused'} at ${snapshot.animation.speed}x speed`,
      `🖱️ Mouse: ${snapshot.mouse.isActive ? 'Active' : 'Inactive'} at (${snapshot.mouse.position.x}, ${snapshot.mouse.position.y})`,
      `📊 Performance: ${snapshot.performance.fps} FPS`,
      `🎭 Layers: ${snapshot.layers.length} layer(s)`,
      `💾 Data URL: ${snapshot.canvas.dataURL ? 'Available' : 'Not captured'}`
    ].join('\n');

    return summary;
  }

  /**
   * Restore application state from a snapshot
   */
  static async restoreFromSnapshot(
    snapshot: ApplicationSnapshot,
    canvas: HTMLCanvasElement | null,
    updateSettings?: (settings: SacredGridSettings) => void,
    updateUI?: (ui: any) => void
  ): Promise<boolean> {
    try {
      // Validate snapshot first
      if (!this.validateSnapshot(snapshot)) {
        throw new Error('Invalid snapshot data');
      }

      // Restore canvas state
      if (canvas && snapshot.canvas.dataURL) {
        await this.restoreCanvasState(canvas, snapshot.canvas);
      }

      // Restore settings
      if (updateSettings) {
        updateSettings(snapshot.settings);
      }

      // Restore UI state
      if (updateUI) {
        updateUI(snapshot.ui);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Restore canvas visual content from snapshot
   */
  private static async restoreCanvasState(
    canvas: HTMLCanvasElement,
    canvasState: ApplicationSnapshot['canvas']
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!canvasState.dataURL) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          // Set canvas dimensions
          canvas.width = canvasState.width;
          canvas.height = canvasState.height;

          // Draw the restored image
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load canvas image data'));
      };

      img.src = canvasState.dataURL;
    });
  }

  /**
   * Export snapshot to JSON string
   */
  static exportSnapshot(snapshot: ApplicationSnapshot): string {
    return JSON.stringify(snapshot, null, 2);
  }

  /**
   * Import snapshot from JSON string
   */
  static importSnapshot(jsonString: string): ApplicationSnapshot | null {
    try {
      const snapshot = JSON.parse(jsonString) as ApplicationSnapshot;

      if (this.validateSnapshot(snapshot)) {
        return snapshot;
      } else {
        throw new Error('Invalid snapshot format');
      }
    } catch (error) {
      return null;
    }
  }
}
