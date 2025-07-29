// src/hooks/useParticles.ts - React hook for particle system management

import { useRef, useEffect, useCallback, useState } from 'react';
import { ParticleSystem, ParticleSystemConfig } from '../animation/ParticleSystem';
import { EmitterManager, BaseEmitter } from '../animation/Emitters';
import { Vector2D } from '../types';

/**
 * Particle system hook configuration
 */
export interface UseParticlesConfig extends ParticleSystemConfig {
  canvas?: HTMLCanvasElement | null;
  autoStart?: boolean;
  renderParticles?: boolean;
}

/**
 * Particle system hook return type
 */
export interface UseParticlesReturn {
  particleSystem: ParticleSystem | null;
  emitterManager: EmitterManager;
  isRunning: boolean;
  stats: {
    activeParticles: number;
    totalParticles: number;
    frameTime: number;
  };
  controls: {
    start: () => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    clear: () => void;
    addEmitter: (id: string, emitter: BaseEmitter) => void;
    removeEmitter: (id: string) => void;
    setGlobalForce: (force: Vector2D) => void;
    applyExplosion: (center: Vector2D, radius: number, strength: number) => void;
    applyAttraction: (center: Vector2D, radius: number, strength: number) => void;
  };
}

/**
 * React hook for managing particle systems
 */
export function useParticles(config: UseParticlesConfig): UseParticlesReturn {
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const emitterManagerRef = useRef<EmitterManager>(new EmitterManager());
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    activeParticles: 0,
    totalParticles: 0,
    frameTime: 0
  });

  // Initialize particle system
  useEffect(() => {
    const particleSystem = new ParticleSystem(config);
    particleSystemRef.current = particleSystem;

    // Set up canvas if provided
    if (config.canvas) {
      canvasRef.current = config.canvas;
      ctxRef.current = config.canvas.getContext('2d');
    }

    // Auto start if configured
    if (config.autoStart !== false) {
      start();
    }

    return () => {
      stop();
    };
  }, []);

  // Update configuration when it changes
  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.updateConfig(config);
    }
  }, [config]);

  /**
   * Animation loop
   */
  const animate = useCallback((currentTime: number) => {
    if (!particleSystemRef.current) return;

    const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = currentTime;

    // Update particle system
    particleSystemRef.current.update(deltaTime);

    // Update emitters
    emitterManagerRef.current.update(deltaTime);

    // Render particles if canvas is available and rendering is enabled
    if (config.renderParticles !== false && ctxRef.current && canvasRef.current) {
      renderParticles();
    }

    // Update stats
    const systemStats = particleSystemRef.current.getStats();
    setStats({
      activeParticles: systemStats.activeParticles,
      totalParticles: systemStats.totalParticles,
      frameTime: systemStats.frameTime
    });

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [config.renderParticles]);

  /**
   * Render particles to canvas
   */
  const renderParticles = useCallback(() => {
    if (!ctxRef.current || !canvasRef.current || !particleSystemRef.current) return;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get visible particles
    const particles = particleSystemRef.current.getVisibleParticles();

    // Render each particle
    particles.forEach(particle => {
      const renderData = particle.getRenderData();
      
      ctx.save();
      ctx.globalAlpha = renderData.opacity;
      ctx.fillStyle = renderData.color;
      
      ctx.beginPath();
      ctx.arc(
        renderData.position.x,
        renderData.position.y,
        renderData.size / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.restore();
    });
  }, []);

  /**
   * Start the particle system
   */
  const start = useCallback(() => {
    if (!isRunning && particleSystemRef.current) {
      setIsRunning(true);
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, animate]);

  /**
   * Stop the particle system
   */
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRunning(false);
    lastTimeRef.current = 0;
  }, []);

  /**
   * Pause the particle system
   */
  const pause = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRunning(false);
  }, []);

  /**
   * Resume the particle system
   */
  const resume = useCallback(() => {
    if (!isRunning && particleSystemRef.current) {
      setIsRunning(true);
      lastTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, animate]);

  /**
   * Clear all particles
   */
  const clear = useCallback(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.clear();
    }
  }, []);

  /**
   * Add an emitter
   */
  const addEmitter = useCallback((id: string, emitter: BaseEmitter) => {
    emitterManagerRef.current.addEmitter(id, emitter);
  }, []);

  /**
   * Remove an emitter
   */
  const removeEmitter = useCallback((id: string) => {
    emitterManagerRef.current.removeEmitter(id);
  }, []);

  /**
   * Set global force
   */
  const setGlobalForce = useCallback((force: Vector2D) => {
    if (particleSystemRef.current) {
      particleSystemRef.current.applyGlobalForce(force);
    }
  }, []);

  /**
   * Apply explosion force
   */
  const applyExplosion = useCallback((center: Vector2D, radius: number, strength: number) => {
    if (particleSystemRef.current) {
      particleSystemRef.current.applyExplosion(center, radius, strength);
    }
  }, []);

  /**
   * Apply attraction force
   */
  const applyAttraction = useCallback((center: Vector2D, radius: number, strength: number) => {
    if (particleSystemRef.current) {
      particleSystemRef.current.applyAttraction(center, radius, strength);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    particleSystem: particleSystemRef.current,
    emitterManager: emitterManagerRef.current,
    isRunning,
    stats,
    controls: {
      start,
      stop,
      pause,
      resume,
      clear,
      addEmitter,
      removeEmitter,
      setGlobalForce,
      applyExplosion,
      applyAttraction
    }
  };
}

/**
 * Hook for simple particle effects
 */
export function useSimpleParticles(
  canvas: HTMLCanvasElement | null,
  particleCount: number = 100
) {
  const particleSystem = useParticles({
    canvas,
    maxParticles: particleCount,
    emissionRate: 10,
    autoEmit: true,
    collisionDetection: false,
    boundaryCollision: true,
    bounds: canvas ? {
      left: 0,
      right: canvas.width,
      top: 0,
      bottom: canvas.height
    } : undefined
  });

  return particleSystem;
}

/**
 * Hook for physics-based particles
 */
export function usePhysicsParticles(
  canvas: HTMLCanvasElement | null,
  config?: Partial<UseParticlesConfig>
) {
  const particleSystem = useParticles({
    canvas,
    maxParticles: 200,
    emissionRate: 5,
    autoEmit: true,
    collisionDetection: true,
    boundaryCollision: true,
    bounds: canvas ? {
      left: 0,
      right: canvas.width,
      top: 0,
      bottom: canvas.height
    } : undefined,
    globalForces: [{ x: 0, y: 50 }], // Gravity
    ...config
  });

  return particleSystem;
}

/**
 * Hook for explosion effects
 */
export function useExplosionEffect(canvas: HTMLCanvasElement | null) {
  const particleSystem = useParticles({
    canvas,
    maxParticles: 500,
    emissionRate: 0,
    autoEmit: false,
    collisionDetection: false,
    boundaryCollision: true,
    bounds: canvas ? {
      left: 0,
      right: canvas.width,
      top: 0,
      bottom: canvas.height
    } : undefined
  });

  const explode = useCallback((center: Vector2D, intensity: number = 1) => {
    if (!particleSystem.particleSystem) return;

    // Create burst emitter for explosion
    const { BurstEmitter } = require('../animation/Emitters');
    
    const emitter = new BurstEmitter(particleSystem.particleSystem, {
      position: center,
      emissionRate: 0,
      particleLifetime: 2000 * intensity,
      particleSize: 3,
      particleColor: '#ff6b35',
      particleOpacity: 1,
      enabled: true,
      particleCount: Math.floor(50 * intensity),
      velocityRange: {
        min: { x: -150 * intensity, y: -150 * intensity },
        max: { x: 150 * intensity, y: 150 * intensity }
      }
    });

    particleSystem.controls.addEmitter('explosion', emitter);
    
    // Remove emitter after explosion
    setTimeout(() => {
      particleSystem.controls.removeEmitter('explosion');
    }, 100);
  }, [particleSystem]);

  return {
    ...particleSystem,
    explode
  };
}