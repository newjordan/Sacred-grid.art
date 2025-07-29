// src/performance/PerformanceMonitor.ts - Comprehensive performance monitoring

/**
 * Performance metrics data
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  updateTime: number;
  drawCalls: number;
  particleCount: number;
  timestamp: number;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  current: PerformanceMetrics;
  average: PerformanceMetrics;
  min: PerformanceMetrics;
  max: PerformanceMetrics;
  history: PerformanceMetrics[];
}

/**
 * Performance alert configuration
 */
export interface PerformanceAlert {
  metric: keyof PerformanceMetrics;
  threshold: number;
  condition: 'above' | 'below';
  callback: (value: number, threshold: number) => void;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  historySize: number;
  updateInterval: number; // milliseconds
  enableAlerts: boolean;
  enableLogging: boolean;
  logInterval: number; // milliseconds
}

/**
 * Comprehensive performance monitor
 */
export class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private lastUpdateTime: number = 0;
  private lastLogTime: number = 0;
  
  // Timing measurements
  private renderStartTime: number = 0;
  private updateStartTime: number = 0;
  private drawCallCount: number = 0;
  private currentParticleCount: number = 0;

  // Performance observers
  private performanceObserver: PerformanceObserver | null = null;
  private memoryObserver: any = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      historySize: 300, // 5 seconds at 60fps
      updateInterval: 16, // ~60fps
      enableAlerts: true,
      enableLogging: false,
      logInterval: 5000, // 5 seconds
      ...config
    };

    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    // Performance Observer for navigation and resource timing
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          // Process performance entries if needed
        });
        
        this.performanceObserver.observe({ 
          entryTypes: ['measure', 'navigation', 'resource'] 
        });
      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error);
      }
    }

    // Memory observer (if available)
    if ('memory' in performance) {
      this.memoryObserver = (performance as any).memory;
    }
  }

  /**
   * Start frame measurement
   */
  startFrame(): void {
    const now = performance.now();
    
    if (this.lastFrameTime > 0) {
      this.recordMetrics(now);
    }
    
    this.lastFrameTime = now;
    this.drawCallCount = 0;
  }

  /**
   * Start render measurement
   */
  startRender(): void {
    this.renderStartTime = performance.now();
  }

  /**
   * End render measurement
   */
  endRender(): void {
    if (this.renderStartTime > 0) {
      const renderTime = performance.now() - this.renderStartTime;
      // Store render time for current frame
      this.renderStartTime = 0;
    }
  }

  /**
   * Start update measurement
   */
  startUpdate(): void {
    this.updateStartTime = performance.now();
  }

  /**
   * End update measurement
   */
  endUpdate(): void {
    if (this.updateStartTime > 0) {
      const updateTime = performance.now() - this.updateStartTime;
      // Store update time for current frame
      this.updateStartTime = 0;
    }
  }

  /**
   * Record a draw call
   */
  recordDrawCall(): void {
    this.drawCallCount++;
  }

  /**
   * Set current particle count
   */
  setParticleCount(count: number): void {
    this.currentParticleCount = count;
  }

  /**
   * Record performance metrics
   */
  private recordMetrics(currentTime: number): void {
    const frameTime = currentTime - this.lastFrameTime;
    const fps = frameTime > 0 ? 1000 / frameTime : 0;
    
    const metrics: PerformanceMetrics = {
      fps,
      frameTime,
      memoryUsage: this.getMemoryUsage(),
      renderTime: this.getRenderTime(),
      updateTime: this.getUpdateTime(),
      drawCalls: this.drawCallCount,
      particleCount: this.currentParticleCount,
      timestamp: currentTime
    };

    // Add to history
    this.metrics.push(metrics);
    
    // Limit history size
    if (this.metrics.length > this.config.historySize) {
      this.metrics.shift();
    }

    // Check alerts
    if (this.config.enableAlerts) {
      this.checkAlerts(metrics);
    }

    // Log if enabled
    if (this.config.enableLogging && 
        currentTime - this.lastLogTime > this.config.logInterval) {
      this.logMetrics(metrics);
      this.lastLogTime = currentTime;
    }

    this.frameCount++;
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (this.memoryObserver) {
      return this.memoryObserver.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Get render time for current frame
   */
  private getRenderTime(): number {
    // This would be set by endRender()
    return 0; // Placeholder
  }

  /**
   * Get update time for current frame
   */
  private getUpdateTime(): number {
    // This would be set by endUpdate()
    return 0; // Placeholder
  }

  /**
   * Check performance alerts
   */
  private checkAlerts(metrics: PerformanceMetrics): void {
    this.alerts.forEach(alert => {
      const value = metrics[alert.metric];
      const shouldAlert = alert.condition === 'above' ? 
                         value > alert.threshold : 
                         value < alert.threshold;
      
      if (shouldAlert) {
        alert.callback(value, alert.threshold);
      }
    });
  }

  /**
   * Log performance metrics
   */
  private logMetrics(metrics: PerformanceMetrics): void {
    console.log('Performance Metrics:', {
      fps: metrics.fps.toFixed(1),
      frameTime: metrics.frameTime.toFixed(2) + 'ms',
      memory: metrics.memoryUsage.toFixed(1) + 'MB',
      drawCalls: metrics.drawCalls,
      particles: metrics.particleCount
    });
  }

  /**
   * Add performance alert
   */
  addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
  }

  /**
   * Remove performance alert
   */
  removeAlert(alertToRemove: PerformanceAlert): boolean {
    const index = this.alerts.indexOf(alertToRemove);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get current performance statistics
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      const emptyMetrics: PerformanceMetrics = {
        fps: 0,
        frameTime: 0,
        memoryUsage: 0,
        renderTime: 0,
        updateTime: 0,
        drawCalls: 0,
        particleCount: 0,
        timestamp: 0
      };

      return {
        current: emptyMetrics,
        average: emptyMetrics,
        min: emptyMetrics,
        max: emptyMetrics,
        history: []
      };
    }

    const current = this.metrics[this.metrics.length - 1];
    const history = [...this.metrics];

    // Calculate averages
    const average: PerformanceMetrics = {
      fps: this.calculateAverage('fps'),
      frameTime: this.calculateAverage('frameTime'),
      memoryUsage: this.calculateAverage('memoryUsage'),
      renderTime: this.calculateAverage('renderTime'),
      updateTime: this.calculateAverage('updateTime'),
      drawCalls: this.calculateAverage('drawCalls'),
      particleCount: this.calculateAverage('particleCount'),
      timestamp: current.timestamp
    };

    // Calculate minimums
    const min: PerformanceMetrics = {
      fps: this.calculateMin('fps'),
      frameTime: this.calculateMin('frameTime'),
      memoryUsage: this.calculateMin('memoryUsage'),
      renderTime: this.calculateMin('renderTime'),
      updateTime: this.calculateMin('updateTime'),
      drawCalls: this.calculateMin('drawCalls'),
      particleCount: this.calculateMin('particleCount'),
      timestamp: current.timestamp
    };

    // Calculate maximums
    const max: PerformanceMetrics = {
      fps: this.calculateMax('fps'),
      frameTime: this.calculateMax('frameTime'),
      memoryUsage: this.calculateMax('memoryUsage'),
      renderTime: this.calculateMax('renderTime'),
      updateTime: this.calculateMax('updateTime'),
      drawCalls: this.calculateMax('drawCalls'),
      particleCount: this.calculateMax('particleCount'),
      timestamp: current.timestamp
    };

    return {
      current,
      average,
      min,
      max,
      history
    };
  }

  /**
   * Calculate average for a metric
   */
  private calculateAverage(metric: keyof PerformanceMetrics): number {
    if (this.metrics.length === 0) return 0;
    
    const sum = this.metrics.reduce((acc, m) => acc + (m[metric] as number), 0);
    return sum / this.metrics.length;
  }

  /**
   * Calculate minimum for a metric
   */
  private calculateMin(metric: keyof PerformanceMetrics): number {
    if (this.metrics.length === 0) return 0;
    
    return Math.min(...this.metrics.map(m => m[metric] as number));
  }

  /**
   * Calculate maximum for a metric
   */
  private calculateMax(metric: keyof PerformanceMetrics): number {
    if (this.metrics.length === 0) return 0;
    
    return Math.max(...this.metrics.map(m => m[metric] as number));
  }

  /**
   * Get performance grade based on current metrics
   */
  getPerformanceGrade(): {
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    score: number;
    issues: string[];
  } {
    const stats = this.getStats();
    const current = stats.current;
    const issues: string[] = [];
    let score = 100;

    // FPS scoring
    if (current.fps < 30) {
      score -= 30;
      issues.push('Low FPS (< 30)');
    } else if (current.fps < 45) {
      score -= 15;
      issues.push('Moderate FPS (< 45)');
    } else if (current.fps < 55) {
      score -= 5;
      issues.push('Good FPS (< 55)');
    }

    // Frame time scoring
    if (current.frameTime > 33) {
      score -= 20;
      issues.push('High frame time (> 33ms)');
    } else if (current.frameTime > 20) {
      score -= 10;
      issues.push('Moderate frame time (> 20ms)');
    }

    // Memory usage scoring
    if (current.memoryUsage > 100) {
      score -= 15;
      issues.push('High memory usage (> 100MB)');
    } else if (current.memoryUsage > 50) {
      score -= 5;
      issues.push('Moderate memory usage (> 50MB)');
    }

    // Draw calls scoring
    if (current.drawCalls > 1000) {
      score -= 10;
      issues.push('High draw calls (> 1000)');
    } else if (current.drawCalls > 500) {
      score -= 5;
      issues.push('Moderate draw calls (> 500)');
    }

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return { grade, score: Math.max(0, score), issues };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const stats = this.getStats();
    const current = stats.current;
    const recommendations: string[] = [];

    if (current.fps < 45) {
      recommendations.push('Consider reducing particle count or visual complexity');
      recommendations.push('Enable performance optimizations');
    }

    if (current.memoryUsage > 50) {
      recommendations.push('Monitor memory leaks');
      recommendations.push('Consider object pooling for particles');
    }

    if (current.drawCalls > 500) {
      recommendations.push('Batch similar draw operations');
      recommendations.push('Use instanced rendering where possible');
    }

    if (current.frameTime > 20) {
      recommendations.push('Profile render and update loops');
      recommendations.push('Consider using Web Workers for heavy calculations');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is good! No immediate optimizations needed.');
    }

    return recommendations;
  }

  /**
   * Export performance data
   */
  exportData(): {
    config: PerformanceConfig;
    stats: PerformanceStats;
    grade: ReturnType<PerformanceMonitor['getPerformanceGrade']>;
    recommendations: string[];
    exportTime: number;
  } {
    return {
      config: { ...this.config },
      stats: this.getStats(),
      grade: this.getPerformanceGrade(),
      recommendations: this.getRecommendations(),
      exportTime: performance.now()
    };
  }

  /**
   * Reset performance history
   */
  reset(): void {
    this.metrics = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.lastUpdateTime = 0;
    this.lastLogTime = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Destroy monitor and cleanup
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    this.alerts = [];
    this.metrics = [];
  }

  /**
   * Create performance benchmark
   */
  static async benchmark(
    testFunction: () => void,
    iterations: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
    iterations: number;
  }> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      testFunction();
      const end = performance.now();
      times.push(end - start);
      
      // Yield control occasionally
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      averageTime,
      minTime,
      maxTime,
      totalTime,
      iterations
    };
  }

  /**
   * Get system information
   */
  static getSystemInfo(): {
    userAgent: string;
    platform: string;
    hardwareConcurrency: number;
    memory?: number;
    connection?: any;
  } {
    const nav = navigator as any;
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      memory: nav.deviceMemory,
      connection: nav.connection || nav.mozConnection || nav.webkitConnection
    };
  }
}