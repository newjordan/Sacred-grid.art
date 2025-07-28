// src/hooks/usePerformance.ts - Performance monitoring foundation

import { useState, useEffect, useRef, useCallback } from 'react';
import { PerformanceMetrics } from '../types';

interface PerformanceHookOptions {
  sampleSize?: number;
  updateInterval?: number;
  enableMemoryTracking?: boolean;
}

export const usePerformance = (options: PerformanceHookOptions = {}) => {
  const {
    sampleSize = 60,
    updateInterval = 1000,
    enableMemoryTracking = true
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    particleCount: 0,
    shapeCount: 0
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const renderStartTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(performance.now());

  // Start render timing
  const startRenderTiming = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // End render timing
  const endRenderTiming = useCallback(() => {
    const renderTime = performance.now() - renderStartTimeRef.current;
    
    // Update frame timing
    const currentTime = performance.now();
    const frameTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    // Store frame times for FPS calculation
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > sampleSize) {
      frameTimesRef.current.shift();
    }

    frameCountRef.current++;

    // Update metrics at specified interval
    if (currentTime - lastUpdateRef.current >= updateInterval) {
      updateMetrics(renderTime);
      lastUpdateRef.current = currentTime;
    }
  }, [sampleSize, updateInterval]);

  const updateMetrics = useCallback((renderTime: number) => {
    const frameTimes = frameTimesRef.current;
    if (frameTimes.length === 0) return;

    // Calculate FPS
    const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
    const fps = Math.round(1000 / avgFrameTime);

    // Get memory usage (if available)
    let memoryUsage = 0;
    if (enableMemoryTracking && 'memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }

    setMetrics(prev => ({
      ...prev,
      fps: Math.max(0, Math.min(fps, 120)), // Clamp between 0-120
      frameTime: Math.round(avgFrameTime * 100) / 100,
      memoryUsage,
      renderTime: Math.round(renderTime * 100) / 100
    }));
  }, [enableMemoryTracking]);

  // Update particle and shape counts
  const updateCounts = useCallback((particleCount: number, shapeCount: number) => {
    setMetrics(prev => ({
      ...prev,
      particleCount,
      shapeCount
    }));
  }, []);

  // Performance warning system
  const getPerformanceWarning = useCallback(() => {
    if (metrics.fps < 30) return 'Low FPS detected. Consider reducing complexity.';
    if (metrics.memoryUsage > 100) return 'High memory usage detected.';
    if (metrics.renderTime > 16) return 'Render time exceeding 60fps budget.';
    return null;
  }, [metrics]);

  // Performance grade
  const getPerformanceGrade = useCallback(() => {
    if (metrics.fps >= 55) return 'A';
    if (metrics.fps >= 45) return 'B';
    if (metrics.fps >= 30) return 'C';
    if (metrics.fps >= 20) return 'D';
    return 'F';
  }, [metrics.fps]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    frameTimesRef.current = [];
    frameCountRef.current = 0;
    lastFrameTimeRef.current = performance.now();
    lastUpdateRef.current = performance.now();
    setMetrics({
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      particleCount: 0,
      shapeCount: 0
    });
  }, []);

  return {
    metrics,
    startRenderTiming,
    endRenderTiming,
    updateCounts,
    getPerformanceWarning,
    getPerformanceGrade,
    resetMetrics
  };
};

// Performance monitoring component for debugging
export const PerformanceMonitor: React.FC<{ metrics: PerformanceMetrics }> = ({ metrics }) => {
  const warning = metrics.fps < 30 ? 'Low FPS!' : null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 1000,
      minWidth: '150px'
    }}>
      <div>FPS: {metrics.fps}</div>
      <div>Frame: {metrics.frameTime}ms</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
      <div>Particles: {metrics.particleCount}</div>
      <div>Shapes: {metrics.shapeCount}</div>
      {warning && <div style={{ color: 'red', fontWeight: 'bold' }}>{warning}</div>}
    </div>
  );
};

export default usePerformance;