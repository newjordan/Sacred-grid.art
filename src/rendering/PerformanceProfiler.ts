// src/rendering/PerformanceProfiler.ts - Render performance metrics and profiling

import { PerformanceMetrics } from '../types';
import { PERFORMANCE } from '../utils/constants';

/**
 * Performance profiler for rendering operations
 */
export class PerformanceProfiler {
  private metrics: PerformanceMetrics;
  private frameStartTime: number = 0;
  private renderStartTime: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private frameTimes: number[] = [];
  private renderTimes: number[] = [];
  private isProfilerEnabled: boolean = true;
  private performanceObserver?: PerformanceObserver;

  // Thresholds for performance warnings
  private readonly FPS_WARNING_THRESHOLD = 30;
  private readonly FRAME_TIME_WARNING_THRESHOLD = 33.33; // 30 FPS
  private readonly RENDER_TIME_WARNING_THRESHOLD = 16.67; // 60 FPS budget
  private readonly MEMORY_WARNING_THRESHOLD = 100; // MB

  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      particleCount: 0,
      shapeCount: 0
    };

    this.setupPerformanceObserver();
  }

  /**
   * Setup Performance Observer for advanced metrics
   */
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.entryType === 'measure' && entry.name.startsWith('sacred-grid-')) {
              this.handlePerformanceEntry(entry);
            }
          }
        });

        this.performanceObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('Performance Observer not supported or failed to initialize:', error);
      }
    }
  }

  /**
   * Handle performance entries from Performance Observer
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    if (entry.name === 'sacred-grid-render') {
      this.renderTimes.push(entry.duration);
      if (this.renderTimes.length > 60) {
        this.renderTimes.shift();
      }
    }
  }

  /**
   * Start frame timing
   */
  startFrame(): void {
    if (!this.isProfilerEnabled) return;

    this.frameStartTime = performance.now();
    
    // Mark start of frame for Performance API
    if ('performance' in window && 'mark' in performance) {
      performance.mark('sacred-grid-frame-start');
    }
  }

  /**
   * End frame timing and update metrics
   */
  endFrame(): void {
    if (!this.isProfilerEnabled) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.frameStartTime;
    
    // Mark end of frame for Performance API
    if ('performance' in window && 'mark' in performance) {
      performance.mark('sacred-grid-frame-end');
      performance.measure('sacred-grid-frame', 'sacred-grid-frame-start', 'sacred-grid-frame-end');
    }

    // Update frame times array
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }

    this.frameCount++;

    // Update FPS every second
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.updateFPS(currentTime);
      this.lastFpsUpdate = currentTime;
    }

    // Update frame time metric
    this.metrics.frameTime = frameTime;
  }

  /**
   * Start render timing
   */
  startRender(): void {
    if (!this.isProfilerEnabled) return;

    this.renderStartTime = performance.now();
    
    // Mark start of render for Performance API
    if ('performance' in window && 'mark' in performance) {
      performance.mark('sacred-grid-render-start');
    }
  }

  /**
   * End render timing
   */
  endRender(): void {
    if (!this.isProfilerEnabled) return;

    const renderTime = performance.now() - this.renderStartTime;
    
    // Mark end of render for Performance API
    if ('performance' in window && 'mark' in performance) {
      performance.mark('sacred-grid-render-end');
      performance.measure('sacred-grid-render', 'sacred-grid-render-start', 'sacred-grid-render-end');
    }

    this.metrics.renderTime = renderTime;
  }

  /**
   * Update FPS calculation
   */
  private updateFPS(currentTime: number): void {
    if (this.frameTimes.length === 0) return;

    // Calculate average frame time
    const avgFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    
    // Calculate FPS
    this.metrics.fps = Math.round(1000 / avgFrameTime);
    
    // Clamp FPS to reasonable range
    this.metrics.fps = Math.max(0, Math.min(this.metrics.fps, 120));
  }

  /**
   * Update memory usage
   */
  updateMemoryUsage(): void {
    if (!this.isProfilerEnabled) return;

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
    }
  }

  /**
   * Update particle count
   */
  updateParticleCount(count: number): void {
    this.metrics.particleCount = count;
  }

  /**
   * Update shape count
   */
  updateShapeCount(count: number): void {
    this.metrics.shapeCount = count;
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance warnings
   */
  getPerformanceWarnings(): string[] {
    const warnings: string[] = [];

    if (this.metrics.fps < this.FPS_WARNING_THRESHOLD) {
      warnings.push(`Low FPS: ${this.metrics.fps} (target: 60)`);
    }

    if (this.metrics.frameTime > this.FRAME_TIME_WARNING_THRESHOLD) {
      warnings.push(`High frame time: ${this.metrics.frameTime.toFixed(2)}ms`);
    }

    if (this.metrics.renderTime > this.RENDER_TIME_WARNING_THRESHOLD) {
      warnings.push(`High render time: ${this.metrics.renderTime.toFixed(2)}ms`);
    }

    if (this.metrics.memoryUsage > this.MEMORY_WARNING_THRESHOLD) {
      warnings.push(`High memory usage: ${this.metrics.memoryUsage}MB`);
    }

    if (this.metrics.particleCount > PERFORMANCE.MAX_PARTICLES) {
      warnings.push(`Too many particles: ${this.metrics.particleCount}`);
    }

    if (this.metrics.shapeCount > PERFORMANCE.MAX_SHAPES) {
      warnings.push(`Too many shapes: ${this.metrics.shapeCount}`);
    }

    return warnings;
  }

  /**
   * Get performance grade (A-F)
   */
  getPerformanceGrade(): string {
    const warnings = this.getPerformanceWarnings();
    
    if (warnings.length === 0 && this.metrics.fps >= 55) return 'A';
    if (warnings.length <= 1 && this.metrics.fps >= 45) return 'B';
    if (warnings.length <= 2 && this.metrics.fps >= 30) return 'C';
    if (warnings.length <= 3 && this.metrics.fps >= 20) return 'D';
    return 'F';
  }

  /**
   * Get detailed performance report
   */
  getPerformanceReport(): {
    metrics: PerformanceMetrics;
    warnings: string[];
    grade: string;
    recommendations: string[];
    frameTimeHistory: number[];
    renderTimeHistory: number[];
  } {
    const warnings = this.getPerformanceWarnings();
    const grade = this.getPerformanceGrade();
    const recommendations = this.getPerformanceRecommendations(warnings);

    return {
      metrics: this.getMetrics(),
      warnings,
      grade,
      recommendations,
      frameTimeHistory: [...this.frameTimes],
      renderTimeHistory: [...this.renderTimes]
    };
  }

  /**
   * Get performance recommendations based on current metrics
   */
  private getPerformanceRecommendations(warnings: string[]): string[] {
    const recommendations: string[] = [];

    if (this.metrics.fps < 30) {
      recommendations.push('Reduce visual complexity or enable performance mode');
      recommendations.push('Consider reducing particle count or shape detail');
    }

    if (this.metrics.renderTime > 16) {
      recommendations.push('Optimize rendering by reducing draw calls');
      recommendations.push('Enable shape batching if available');
    }

    if (this.metrics.memoryUsage > 100) {
      recommendations.push('Clear unused resources and caches');
      recommendations.push('Reduce texture sizes or particle counts');
    }

    if (this.metrics.particleCount > 5000) {
      recommendations.push('Reduce maximum particle count');
      recommendations.push('Implement particle pooling for better memory management');
    }

    if (this.metrics.shapeCount > 500) {
      recommendations.push('Reduce shape complexity or count');
      recommendations.push('Use level-of-detail (LOD) for distant shapes');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal! Consider enabling more visual effects.');
    }

    return recommendations;
  }

  /**
   * Enable/disable profiler
   */
  setEnabled(enabled: boolean): void {
    this.isProfilerEnabled = enabled;
  }

  /**
   * Check if profiler is enabled
   */
  isEnabled(): boolean {
    return this.isProfilerEnabled;
  }

  /**
   * Reset all metrics and history
   */
  reset(): void {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      particleCount: 0,
      shapeCount: 0
    };

    this.frameCount = 0;
    this.frameTimes = [];
    this.renderTimes = [];
    this.lastFpsUpdate = performance.now();
  }

  /**
   * Get average metrics over time
   */
  getAverageMetrics(): PerformanceMetrics {
    const avgFrameTime = this.frameTimes.length > 0 
      ? this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length
      : 0;

    const avgRenderTime = this.renderTimes.length > 0
      ? this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length
      : 0;

    return {
      fps: avgFrameTime > 0 ? Math.round(1000 / avgFrameTime) : 0,
      frameTime: avgFrameTime,
      memoryUsage: this.metrics.memoryUsage,
      renderTime: avgRenderTime,
      particleCount: this.metrics.particleCount,
      shapeCount: this.metrics.shapeCount
    };
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      averageMetrics: this.getAverageMetrics(),
      frameTimeHistory: this.frameTimes,
      renderTimeHistory: this.renderTimes,
      performanceReport: this.getPerformanceReport()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

export default PerformanceProfiler;