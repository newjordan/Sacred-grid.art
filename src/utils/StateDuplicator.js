// src/utils/StateDuplicator.js - Complete Application State Duplication System (JavaScript version)
// Captures the exact current state of the Sacred Grid application

export class StateDuplicator {
  /**
   * Create a complete snapshot of the current application state
   */
  static async createSnapshot(canvas, settings, additionalState = {}) {
    console.log('📸 Creating application state snapshot...');
    
    // Capture canvas state
    const canvasState = await this.captureCanvasState(canvas);
    
    // Deep clone settings to avoid reference issues
    const clonedSettings = this.deepClone(settings);
    
    // Capture animation state
    const animationState = this.captureAnimationState(additionalState.animation);
    
    // Capture mouse state
    const mouseState = this.captureMouseState(additionalState.mouse);
    
    // Create complete snapshot
    const snapshot = {
      settings: clonedSettings,
      canvas: canvasState,
      animation: animationState,
      mouse: mouseState,
      performance: additionalState.performance || this.getDefaultPerformanceMetrics(),
      layers: additionalState.layers || this.getDefaultLayers(),
      ui: {
        showControls: additionalState.ui?.showControls ?? true,
        activePanel: additionalState.ui?.activePanel || null,
        isLoading: additionalState.ui?.isLoading ?? false
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
    
    console.log('✅ Snapshot created successfully');
    console.log(`📊 Settings keys captured: ${Object.keys(clonedSettings).length}`);
    console.log(`🎨 Canvas size: ${canvasState.width}x${canvasState.height}`);
    
    return snapshot;
  }
  
  /**
   * Capture the current canvas state including visual content
   */
  static async captureCanvasState(canvas) {
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
      console.warn('Failed to capture canvas state:', error);
      return {
        width: canvas.width,
        height: canvas.height
      };
    }
  }
  
  /**
   * Capture current animation state
   */
  static captureAnimationState(animationState) {
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
  static captureMouseState(mouseState) {
    return {
      position: mouseState?.position || { x: -1000, y: -1000 },
      isActive: mouseState?.isActive ?? false
    };
  }
  
  /**
   * Deep clone an object to avoid reference issues
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    
    if (typeof obj === 'object') {
      const cloned = {};
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
  static getDefaultPerformanceMetrics() {
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
  static getDefaultLayers() {
    return [
      {
        id: 'main',
        name: 'Main Layer',
        visible: true,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 0,
        locked: false
      }
    ];
  }
  
  /**
   * Validate a snapshot to ensure it contains all required data
   */
  static validateSnapshot(snapshot) {
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
      
      console.log('✅ Snapshot validation passed');
      return true;
    } catch (error) {
      console.error('❌ Snapshot validation failed:', error);
      return false;
    }
  }
  
  /**
   * Get a summary of the snapshot for debugging
   */
  static getSnapshotSummary(snapshot) {
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
  static async restoreFromSnapshot(snapshot, canvas, updateSettings, updateUI) {
    try {
      console.log('🔄 Restoring application state from snapshot...');
      
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
      
      console.log('✅ Application state restored successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to restore application state:', error);
      return false;
    }
  }
  
  /**
   * Restore canvas visual content from snapshot
   */
  static async restoreCanvasState(canvas, canvasState) {
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
  static exportSnapshot(snapshot) {
    return JSON.stringify(snapshot, null, 2);
  }
  
  /**
   * Import snapshot from JSON string
   */
  static importSnapshot(jsonString) {
    try {
      const snapshot = JSON.parse(jsonString);
      
      if (this.validateSnapshot(snapshot)) {
        return snapshot;
      } else {
        throw new Error('Invalid snapshot format');
      }
    } catch (error) {
      console.error('Failed to import snapshot:', error);
      return null;
    }
  }
}
