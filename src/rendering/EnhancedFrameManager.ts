// src/rendering/EnhancedFrameManager.ts - Advanced Frame Rate Management
// Provides smooth, consistent frame rates with adaptive quality

export interface FrameConfig {
  targetFPS: number;
  adaptiveQuality: boolean;
  enableVSync: boolean;
  maxFrameSkip: number;
  qualityThresholds: {
    high: number;    // FPS threshold for high quality
    medium: number;  // FPS threshold for medium quality
    low: number;     // FPS threshold for low quality
  };
}

export interface FrameMetrics {
  currentFPS: number;
  averageFPS: number;
  frameTime: number;
  droppedFrames: number;
  qualityLevel: 'high' | 'medium' | 'low';
  isStable: boolean;
}

export interface RenderQuality {
  level: 'high' | 'medium' | 'low';
  colorPrecision: number;
  animationSmoothing: boolean;
  fractalDepthLimit: number;
  particleLimit: number;
}

/**
 * Enhanced Frame Manager with adaptive quality and smooth timing
 * Based on techniques from:
 * - "Real-Time Rendering" by Akenine-Möller et al.
 * - "Game Engine Architecture" by Jason Gregory
 * - Modern browser performance optimization patterns
 */
export class EnhancedFrameManager {
  private config: FrameConfig;
  private metrics: FrameMetrics;
  private renderQuality: RenderQuality;
  
  // Timing state
  private lastFrameTime: number = 0;
  private frameTimeHistory: number[] = [];
  private targetFrameTime: number;
  private frameTimeAccumulator: number = 0;
  
  // Frame rate smoothing
  private smoothingFactor: number = 0.9;
  private stabilityThreshold: number = 5; // FPS variance for stability
  
  // Adaptive quality
  private qualityAdjustmentCooldown: number = 0;
  private qualityAdjustmentDelay: number = 2000; // 2 seconds
  
  // Performance monitoring
  private performanceHistory: number[] = [];
  private droppedFrameCount: number = 0;
  
  constructor(config: Partial<FrameConfig> = {}) {
    this.config = {
      targetFPS: 60,
      adaptiveQuality: true,
      enableVSync: true,
      maxFrameSkip: 3,
      qualityThresholds: {
        high: 55,   // Above 55 FPS = high quality
        medium: 35, // 35-55 FPS = medium quality
        low: 20     // Below 35 FPS = low quality
      },
      ...config
    };
    
    this.targetFrameTime = 1000 / this.config.targetFPS;
    
    this.metrics = {
      currentFPS: this.config.targetFPS,
      averageFPS: this.config.targetFPS,
      frameTime: this.targetFrameTime,
      droppedFrames: 0,
      qualityLevel: 'high',
      isStable: true
    };
    
    this.renderQuality = this.getQualitySettings('high');
    
    console.log('🎬 Enhanced Frame Manager initialized:', this.config);
  }
  
  /**
   * Update frame timing and determine if frame should be rendered
   */
  shouldRenderFrame(currentTime: number): boolean {
    const deltaTime = currentTime - this.lastFrameTime;
    
    // VSync handling
    if (this.config.enableVSync && deltaTime < this.targetFrameTime * 0.95) {
      return false; // Skip frame to maintain target FPS
    }
    
    this.lastFrameTime = currentTime;
    this.updateMetrics(deltaTime);
    
    // Adaptive quality adjustment
    if (this.config.adaptiveQuality) {
      this.updateRenderQuality(currentTime);
    }
    
    return true;
  }
  
  /**
   * Update frame metrics and performance tracking
   */
  private updateMetrics(deltaTime: number): void {
    // Update frame time history
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }
    
    // Calculate current FPS
    this.metrics.currentFPS = deltaTime > 0 ? 1000 / deltaTime : 0;
    this.metrics.frameTime = deltaTime;
    
    // Calculate average FPS with smoothing
    if (this.frameTimeHistory.length > 0) {
      const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b) / this.frameTimeHistory.length;
      const rawAvgFPS = 1000 / avgFrameTime;
      
      // Apply exponential smoothing
      this.metrics.averageFPS = this.metrics.averageFPS * this.smoothingFactor + 
                                rawAvgFPS * (1 - this.smoothingFactor);
    }
    
    // Check frame stability
    this.updateStabilityMetrics();
    
    // Track dropped frames
    if (deltaTime > this.targetFrameTime * 1.5) {
      this.droppedFrameCount++;
      this.metrics.droppedFrames = this.droppedFrameCount;
    }
  }
  
  /**
   * Update frame stability metrics
   */
  private updateStabilityMetrics(): void {
    if (this.frameTimeHistory.length < 30) {
      this.metrics.isStable = true;
      return;
    }
    
    // Calculate FPS variance over recent frames
    const recentFrames = this.frameTimeHistory.slice(-30);
    const recentFPS = recentFrames.map(ft => 1000 / ft);
    const avgFPS = recentFPS.reduce((a, b) => a + b) / recentFPS.length;
    const variance = recentFPS.reduce((sum, fps) => sum + Math.pow(fps - avgFPS, 2), 0) / recentFPS.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Consider stable if standard deviation is below threshold
    this.metrics.isStable = standardDeviation < this.stabilityThreshold;
  }
  
  /**
   * Update render quality based on performance
   */
  private updateRenderQuality(currentTime: number): void {
    // Cooldown to prevent rapid quality changes
    if (currentTime - this.qualityAdjustmentCooldown < this.qualityAdjustmentDelay) {
      return;
    }
    
    const avgFPS = this.metrics.averageFPS;
    let newQualityLevel: 'high' | 'medium' | 'low';
    
    // Determine quality level based on performance
    if (avgFPS >= this.config.qualityThresholds.high) {
      newQualityLevel = 'high';
    } else if (avgFPS >= this.config.qualityThresholds.medium) {
      newQualityLevel = 'medium';
    } else {
      newQualityLevel = 'low';
    }
    
    // Only adjust if quality level changed and performance is stable
    if (newQualityLevel !== this.metrics.qualityLevel && this.metrics.isStable) {
      this.metrics.qualityLevel = newQualityLevel;
      this.renderQuality = this.getQualitySettings(newQualityLevel);
      this.qualityAdjustmentCooldown = currentTime;
      
      console.log(`🎨 Quality adjusted to ${newQualityLevel} (${avgFPS.toFixed(1)} FPS)`);
    }
  }
  
  /**
   * Get quality settings for a given level
   */
  private getQualitySettings(level: 'high' | 'medium' | 'low'): RenderQuality {
    switch (level) {
      case 'high':
        return {
          level: 'high',
          colorPrecision: 1000,
          animationSmoothing: true,
          fractalDepthLimit: 6,
          particleLimit: 10000
        };
      
      case 'medium':
        return {
          level: 'medium',
          colorPrecision: 100,
          animationSmoothing: true,
          fractalDepthLimit: 4,
          particleLimit: 5000
        };
      
      case 'low':
        return {
          level: 'low',
          colorPrecision: 10,
          animationSmoothing: false,
          fractalDepthLimit: 3,
          particleLimit: 2000
        };
    }
  }
  
  /**
   * Get current frame metrics
   */
  getMetrics(): FrameMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get current render quality settings
   */
  getRenderQuality(): RenderQuality {
    return { ...this.renderQuality };
  }
  
  /**
   * Force quality level (disables adaptive quality temporarily)
   */
  setQualityLevel(level: 'high' | 'medium' | 'low'): void {
    this.metrics.qualityLevel = level;
    this.renderQuality = this.getQualitySettings(level);
    this.qualityAdjustmentCooldown = performance.now() + this.qualityAdjustmentDelay;
    
    console.log(`🎨 Quality manually set to ${level}`);
  }
  
  /**
   * Enable/disable adaptive quality
   */
  setAdaptiveQuality(enabled: boolean): void {
    this.config.adaptiveQuality = enabled;
    
    if (!enabled) {
      // Reset to high quality when disabled
      this.setQualityLevel('high');
    }
    
    console.log(`🔧 Adaptive quality ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport(): string {
    const report = [
      '📊 Enhanced Frame Manager Report',
      '================================',
      `🎯 Target FPS: ${this.config.targetFPS}`,
      `📈 Current FPS: ${this.metrics.currentFPS.toFixed(1)}`,
      `📊 Average FPS: ${this.metrics.averageFPS.toFixed(1)}`,
      `⏱️ Frame Time: ${this.metrics.frameTime.toFixed(2)}ms`,
      `🎨 Quality Level: ${this.metrics.qualityLevel}`,
      `📉 Dropped Frames: ${this.metrics.droppedFrames}`,
      `🎯 Stable: ${this.metrics.isStable ? 'Yes' : 'No'}`,
      `🔧 Adaptive Quality: ${this.config.adaptiveQuality ? 'Enabled' : 'Disabled'}`,
      `📺 VSync: ${this.config.enableVSync ? 'Enabled' : 'Disabled'}`
    ].join('\n');
    
    return report;
  }
  
  /**
   * Reset metrics and performance history
   */
  reset(): void {
    this.frameTimeHistory = [];
    this.performanceHistory = [];
    this.droppedFrameCount = 0;
    this.qualityAdjustmentCooldown = 0;
    
    this.metrics = {
      currentFPS: this.config.targetFPS,
      averageFPS: this.config.targetFPS,
      frameTime: this.targetFrameTime,
      droppedFrames: 0,
      qualityLevel: 'high',
      isStable: true
    };
    
    this.renderQuality = this.getQualitySettings('high');
    
    console.log('🔄 Enhanced Frame Manager reset');
  }
}
