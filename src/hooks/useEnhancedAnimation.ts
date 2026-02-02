// src/hooks/useEnhancedAnimation.ts - React Hook for Enhanced Animation System
// Integrates the enhanced animation system with React components

import { useRef, useEffect, useCallback, useState } from 'react';
import { EnhancedAnimationSystem, AnimationConfig, TimingState } from '../animation/EnhancedAnimationSystem';
import { EnhancedFrameManager, FrameConfig, FrameMetrics } from '../rendering/EnhancedFrameManager';

export interface EnhancedAnimationHookConfig {
  animationConfig?: Partial<AnimationConfig>;
  frameConfig?: Partial<FrameConfig>;
  enablePerformanceMonitoring?: boolean;
  onPerformanceUpdate?: (metrics: FrameMetrics) => void;
}

export interface EnhancedAnimationState {
  isPlaying: boolean;
  timingState: TimingState;
  frameMetrics: FrameMetrics;
  animationTime: number;
  qualityLevel: 'high' | 'medium' | 'low';
}

/**
 * Enhanced Animation Hook
 * Provides smooth, high-performance animation with adaptive quality
 */
export function useEnhancedAnimation(config: EnhancedAnimationHookConfig = {}) {
  const animationSystemRef = useRef<EnhancedAnimationSystem | null>(null);
  const frameManagerRef = useRef<EnhancedFrameManager | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const [animationState, setAnimationState] = useState<EnhancedAnimationState>({
    isPlaying: false,
    timingState: {
      currentTime: 0,
      deltaTime: 16.67,
      smoothedDeltaTime: 16.67,
      frameCount: 0,
      actualFPS: 60
    },
    frameMetrics: {
      currentFPS: 60,
      averageFPS: 60,
      frameTime: 16.67,
      droppedFrames: 0,
      qualityLevel: 'high',
      isStable: true
    },
    animationTime: 0,
    qualityLevel: 'high'
  });
  
  // Initialize systems
  useEffect(() => {
    animationSystemRef.current = new EnhancedAnimationSystem(config.animationConfig);
    frameManagerRef.current = new EnhancedFrameManager(config.frameConfig);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Animation loop
  const animate = useCallback((currentTime: number) => {
    if (!animationSystemRef.current || !frameManagerRef.current) return;
    
    const animationSystem = animationSystemRef.current;
    const frameManager = frameManagerRef.current;
    
    // Check if frame should be rendered
    if (!frameManager.shouldRenderFrame(currentTime)) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // Update animation timing
    if (animationSystem.updateTiming(currentTime)) {
      const timingState = animationSystem.getTimingState();
      const frameMetrics = frameManager.getMetrics();
      const animationTime = animationSystem.getAnimationTime();
      const qualityLevel = frameManager.getRenderQuality().level;
      
      // Update state
      setAnimationState({
        isPlaying: true,
        timingState,
        frameMetrics,
        animationTime,
        qualityLevel
      });
      
      // Performance monitoring callback
      if (config.enablePerformanceMonitoring && config.onPerformanceUpdate) {
        config.onPerformanceUpdate(frameMetrics);
      }
      
      lastUpdateTimeRef.current = currentTime;
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [config.enablePerformanceMonitoring, config.onPerformanceUpdate]);
  
  // Start animation
  const startAnimation = useCallback(() => {
    if (animationFrameRef.current) return; // Already running

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate]);
  
  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
  }, []);
  
  // Reset animation
  const resetAnimation = useCallback(() => {
    if (animationSystemRef.current) {
      animationSystemRef.current.reset();
    }
    if (frameManagerRef.current) {
      frameManagerRef.current.reset();
    }
  }, []);
  
  // Get enhanced color with smooth interpolation
  const getEnhancedColor = useCallback((
    colors: string[],
    alpha: number,
    cycleDuration: number,
    easingType: string = 'easeInOutCubic'
  ): string => {
    if (!animationSystemRef.current) return `rgba(0, 119, 255, ${alpha})`;
    
    const animationTime = animationSystemRef.current.getAnimationTime();
    return animationSystemRef.current.getEnhancedMultiEasedColor(
      animationTime,
      colors,
      alpha,
      cycleDuration,
      easingType
    );
  }, []);
  
  // Get enhanced animation parameters with symmetric timing
  const getEnhancedAnimationParams = useCallback((
    shapeSettings: any,
    fractalDepth: number = 0,
    childIndex: number = 0,
    totalChildren: number = 1
  ): any => {
    if (!animationSystemRef.current) {
      return { size: shapeSettings.size, opacity: shapeSettings.opacity, rotation: 0 };
    }
    
    const animationTime = animationSystemRef.current.getAnimationTime();
    return animationSystemRef.current.calculateEnhancedAnimationParams(
      animationTime,
      shapeSettings,
      fractalDepth,
      childIndex,
      totalChildren
    );
  }, []);
  
  // Set quality level manually
  const setQualityLevel = useCallback((level: 'high' | 'medium' | 'low') => {
    if (frameManagerRef.current) {
      frameManagerRef.current.setQualityLevel(level);
    }
  }, []);
  
  // Enable/disable adaptive quality
  const setAdaptiveQuality = useCallback((enabled: boolean) => {
    if (frameManagerRef.current) {
      frameManagerRef.current.setAdaptiveQuality(enabled);
    }
  }, []);
  
  // Get performance report
  const getPerformanceReport = useCallback((): string => {
    if (!frameManagerRef.current) return 'Performance monitoring not available';
    return frameManagerRef.current.getPerformanceReport();
  }, []);
  
  // Update configuration
  const updateConfig = useCallback((newConfig: EnhancedAnimationHookConfig) => {
    if (newConfig.animationConfig && animationSystemRef.current) {
      animationSystemRef.current.updateConfig(newConfig.animationConfig);
    }
  }, []);
  
  return {
    // State
    animationState,
    isPlaying: animationState.isPlaying,
    animationTime: animationState.animationTime,
    qualityLevel: animationState.qualityLevel,
    frameMetrics: animationState.frameMetrics,
    
    // Controls
    startAnimation,
    stopAnimation,
    resetAnimation,
    
    // Enhanced functions
    getEnhancedColor,
    getEnhancedAnimationParams,
    
    // Quality controls
    setQualityLevel,
    setAdaptiveQuality,
    
    // Monitoring
    getPerformanceReport,
    
    // Configuration
    updateConfig,
    
    // Direct access to systems (for advanced usage)
    animationSystem: animationSystemRef.current,
    frameManager: frameManagerRef.current
  };
}
