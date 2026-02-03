// src/animation/EnhancedAnimationSystem.ts - Advanced Animation System
// Fixes asymmetrical timing, color snapping, and frame rate issues

export interface AnimationConfig {
  targetFPS: number;
  enableFrameSmoothing: boolean;
  enableColorSmoothing: boolean;
  enableTimingCorrection: boolean;
  maxFrameTime: number;
  colorPrecision: number;
}

export interface TimingState {
  currentTime: number;
  deltaTime: number;
  smoothedDeltaTime: number;
  frameCount: number;
  actualFPS: number;
}

/**
 * Enhanced Animation System with smooth timing and color interpolation
 * Based on research from:
 * - "Real-Time Rendering" by Akenine-Möller, Haines, and Hoffman
 * - "Game Programming Patterns" by Robert Nystrom
 * - "The Art of Fluid Animation" by Jos Stam
 */
export class EnhancedAnimationSystem {
  private config: AnimationConfig;
  private timingState: TimingState;
  private frameTimeHistory: number[] = [];
  private lastFrameTime: number = 0;
  private frameTimeSmoothing: number = 0.9; // Exponential smoothing factor
  private colorCache: Map<string, string> = new Map();
  
  // High-precision timing for smooth animations
  private highPrecisionTimer: number = 0;
  private timeAccumulator: number = 0;
  
  // Frame rate limiting
  private targetFrameTime: number;
  private lastRenderTime: number = 0;
  
  constructor(config: Partial<AnimationConfig> = {}) {
    this.config = {
      targetFPS: 60,
      enableFrameSmoothing: true,
      enableColorSmoothing: true,
      enableTimingCorrection: true,
      maxFrameTime: 33.33, // Cap at 30 FPS minimum
      colorPrecision: 1000, // Higher precision for smoother colors
      ...config
    };
    
    this.targetFrameTime = 1000 / this.config.targetFPS;
    
    this.timingState = {
      currentTime: 0,
      deltaTime: this.targetFrameTime,
      smoothedDeltaTime: this.targetFrameTime,
      frameCount: 0,
      actualFPS: this.config.targetFPS
    };
  }
  
  /**
   * Update timing state with frame rate limiting and smoothing
   */
  updateTiming(currentTime: number): boolean {
    // Frame rate limiting
    if (currentTime - this.lastRenderTime < this.targetFrameTime) {
      return false; // Skip this frame
    }
    
    const rawDeltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.lastRenderTime = currentTime;
    
    // Cap delta time to prevent large jumps
    const cappedDeltaTime = Math.min(rawDeltaTime, this.config.maxFrameTime);
    
    // Apply frame smoothing using exponential moving average
    if (this.config.enableFrameSmoothing) {
      this.timingState.smoothedDeltaTime = 
        this.timingState.smoothedDeltaTime * this.frameTimeSmoothing + 
        cappedDeltaTime * (1 - this.frameTimeSmoothing);
    } else {
      this.timingState.smoothedDeltaTime = cappedDeltaTime;
    }
    
    this.timingState.deltaTime = cappedDeltaTime;
    this.timingState.currentTime = currentTime;
    this.timingState.frameCount++;
    
    // Update frame time history for FPS calculation
    this.frameTimeHistory.push(cappedDeltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }
    
    // Calculate actual FPS
    if (this.frameTimeHistory.length > 0) {
      const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b) / this.frameTimeHistory.length;
      this.timingState.actualFPS = Math.round(1000 / avgFrameTime);
    }
    
    return true; // Render this frame
  }
  
  /**
   * Get high-precision animation time with timing correction
   */
  getAnimationTime(): number {
    if (this.config.enableTimingCorrection) {
      // Use smoothed delta time for consistent animation speed
      this.highPrecisionTimer += this.timingState.smoothedDeltaTime;
      return this.highPrecisionTimer * 0.001; // Convert to seconds
    } else {
      return this.timingState.currentTime * 0.001;
    }
  }
  
  /**
   * Enhanced color interpolation with sub-pixel precision
   * Eliminates color snapping by using floating-point precision
   */
  getEnhancedMultiEasedColor(
    time: number,
    colors: string[],
    alpha: number,
    cycleDuration: number,
    easingType: string = 'easeInOutCubic'
  ): string {
    // Create cache key for performance
    const cacheKey = `${time.toFixed(3)}_${colors.join('_')}_${alpha}_${cycleDuration}_${easingType}`;
    
    if (this.config.enableColorSmoothing && this.colorCache.has(cacheKey)) {
      return this.colorCache.get(cacheKey)!;
    }
    
    const n = colors.length;
    let progress = (time % cycleDuration) / cycleDuration;
    
    // High-precision progress calculation
    const scaledProgress = progress * n;
    const index = Math.floor(scaledProgress);
    const nextIndex = (index + 1) % n;
    
    // Sub-pixel interpolation factor
    let t = scaledProgress - index;
    
    // Apply enhanced easing
    t = this.applyEnhancedEasing(easingType, t);
    
    // Parse colors with caching
    const color1 = this.parseHexColorCached(colors[index]);
    const color2 = this.parseHexColorCached(colors[nextIndex]);
    
    // High-precision color interpolation (no rounding until final step)
    const r = color1[0] + (color2[0] - color1[0]) * t;
    const g = color1[1] + (color2[1] - color1[1]) * t;
    const b = color1[2] + (color2[2] - color1[2]) * t;
    
    // Apply sub-pixel precision rounding
    const finalR = Math.round(r * this.config.colorPrecision) / this.config.colorPrecision;
    const finalG = Math.round(g * this.config.colorPrecision) / this.config.colorPrecision;
    const finalB = Math.round(b * this.config.colorPrecision) / this.config.colorPrecision;
    
    const result = `rgba(${Math.round(finalR)}, ${Math.round(finalG)}, ${Math.round(finalB)}, ${alpha})`;
    
    // Cache result
    if (this.config.enableColorSmoothing) {
      this.colorCache.set(cacheKey, result);
      
      // Limit cache size
      if (this.colorCache.size > 1000) {
        const firstKey = this.colorCache.keys().next().value;
        this.colorCache.delete(firstKey);
      }
    }
    
    return result;
  }
  
  /**
   * Enhanced easing functions with higher precision
   */
  private applyEnhancedEasing(easingType: string, t: number): number {
    // Clamp input to prevent numerical issues
    t = Math.max(0, Math.min(1, t));
    
    switch (easingType) {
      case 'easeInOutCubic':
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      case 'easeInOutQuad':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      case 'easeInOutSine':
        return -(Math.cos(Math.PI * t) - 1) / 2;
      
      case 'easeInOutExpo':
        if (t === 0) return 0;
        if (t === 1) return 1;
        return t < 0.5 
          ? Math.pow(2, 20 * t - 10) / 2
          : (2 - Math.pow(2, -20 * t + 10)) / 2;
      
      case 'easeInOutElastic':
        const c5 = (2 * Math.PI) / 4.5;
        if (t === 0) return 0;
        if (t === 1) return 1;
        return t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
      
      case 'linear':
      default:
        return t;
    }
  }
  
  /**
   * Cached hex color parsing for performance
   */
  private colorParseCache: Map<string, [number, number, number]> = new Map();
  
  private parseHexColorCached(hex: string): [number, number, number] {
    if (this.colorParseCache.has(hex)) {
      return this.colorParseCache.get(hex)!;
    }
    
    const c = hex.replace('#', '');
    const result: [number, number, number] = [
      parseInt(c.substring(0, 2), 16),
      parseInt(c.substring(2, 4), 16),
      parseInt(c.substring(4, 6), 16)
    ];
    
    this.colorParseCache.set(hex, result);
    return result;
  }
  
  /**
   * Calculate symmetric fractal timing to eliminate asymmetrical issues
   */
  calculateSymmetricFractalTiming(
    baseTime: number,
    fractalDepth: number,
    childIndex: number,
    totalChildren: number
  ): number {
    // Use mathematical constants for perfect symmetry
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const tau = Math.PI * 2;
    
    // Calculate symmetric phase offset based on golden ratio
    const phaseOffset = (childIndex / totalChildren) * tau;
    
    // Apply depth-based scaling with golden ratio for natural progression
    const depthScale = Math.pow(goldenRatio, -fractalDepth);
    
    // Return perfectly symmetric timing
    return baseTime + (phaseOffset * depthScale);
  }
  
  /**
   * Enhanced animation parameter calculation with symmetric timing
   */
  calculateEnhancedAnimationParams(
    time: number,
    shapeSettings: any,
    fractalDepth: number = 0,
    childIndex: number = 0,
    totalChildren: number = 1
  ): any {
    const { animation } = shapeSettings;
    
    // Use symmetric timing for fractals
    const adjustedTime = fractalDepth > 0 
      ? this.calculateSymmetricFractalTiming(time, fractalDepth, childIndex, totalChildren)
      : time;
    
    // Base animation calculations
    let size = shapeSettings.size;
    let opacity = shapeSettings.opacity;
    let rotation = 0;
    
    if (!animation) {
      return { size, opacity, rotation, adjustedTime };
    }
    
    // Enhanced animation modes with smooth timing
    const speed = animation.speed || 0.001;
    const intensity = animation.intensity || 0.5;
    const phase = adjustedTime * speed * 1000; // Convert to milliseconds for compatibility
    
    switch (animation.mode) {
      case 'pulse':
        const pulseValue = (Math.sin(phase) + 1) / 2; // Normalized 0-1
        size *= (1 + pulseValue * intensity);
        opacity *= (0.7 + pulseValue * 0.3);
        break;
        
      case 'grow':
        const growValue = (Math.sin(phase) + 1) / 2;
        size *= (0.5 + growValue * intensity);
        break;
        
      case 'breathe':
        const breatheValue = (Math.sin(phase * 0.5) + 1) / 2;
        size *= (0.9 + breatheValue * intensity * 0.2);
        opacity *= (0.8 + breatheValue * 0.2);
        break;
    }
    
    // Smooth rotation
    if (animation.rotation) {
      rotation = adjustedTime * (animation.rotationSpeed || 0.1);
    }
    
    return { size, opacity, rotation, adjustedTime };
  }
  
  /**
   * Get current timing state
   */
  getTimingState(): TimingState {
    return { ...this.timingState };
  }
  
  /**
   * Reset animation system
   */
  reset(): void {
    this.timingState.currentTime = 0;
    this.timingState.frameCount = 0;
    this.highPrecisionTimer = 0;
    this.frameTimeHistory = [];
    this.colorCache.clear();
    this.colorParseCache.clear();
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.targetFrameTime = 1000 / this.config.targetFPS;
  }
}
