// src/animation/ParticleSystem.ts - Particle management system

import { Particle, ParticleConfig } from './Particle';
import { Vector2D } from '../types';

/**
 * Particle system configuration
 */
export interface ParticleSystemConfig {
  maxParticles: number;
  emissionRate: number; // particles per second
  autoEmit: boolean;
  bounds?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  globalForces?: Vector2D[];
  collisionDetection: boolean;
  boundaryCollision: boolean;
}

/**
 * Particle system statistics
 */
export interface ParticleSystemStats {
  activeParticles: number;
  totalParticles: number;
  emissionRate: number;
  averageLifetime: number;
  totalKineticEnergy: number;
  frameTime: number;
}

/**
 * Particle system for managing multiple particles
 */
export class ParticleSystem {
  private particles: Particle[] = [];
  private deadParticles: Particle[] = []; // Pool for reuse
  private config: ParticleSystemConfig;
  private emissionTimer: number = 0;
  private lastUpdateTime: number = 0;
  private stats: ParticleSystemStats;

  // Performance tracking
  private frameTimeHistory: number[] = [];
  private maxFrameHistory: number = 60;

  constructor(config: ParticleSystemConfig) {
    this.config = {
      maxParticles: 1000,
      emissionRate: 10,
      autoEmit: true,
      collisionDetection: false,
      boundaryCollision: true,
      ...config
    };

    this.stats = {
      activeParticles: 0,
      totalParticles: 0,
      emissionRate: this.config.emissionRate,
      averageLifetime: 0,
      totalKineticEnergy: 0,
      frameTime: 0
    };
  }

  /**
   * Update all particles in the system
   */
  update(deltaTime: number): void {
    const startTime = performance.now();

    // Handle emission
    if (this.config.autoEmit) {
      this.handleEmission(deltaTime);
    }

    // Update all particles
    this.updateParticles(deltaTime);

    // Handle collisions
    if (this.config.collisionDetection) {
      this.handleCollisions();
    }

    // Handle boundary collisions
    if (this.config.boundaryCollision && this.config.bounds) {
      this.handleBoundaryCollisions();
    }

    // Clean up dead particles
    this.cleanupDeadParticles();

    // Update statistics
    this.updateStats(performance.now() - startTime);
  }

  /**
   * Handle particle emission
   */
  private handleEmission(deltaTime: number): void {
    this.emissionTimer += deltaTime;
    const emissionInterval = 1 / this.config.emissionRate;

    while (this.emissionTimer >= emissionInterval && 
           this.particles.length < this.config.maxParticles) {
      this.emissionTimer -= emissionInterval;
      // Emission will be handled by emitters
    }
  }

  /**
   * Update all particles
   */
  private updateParticles(deltaTime: number): void {
    // Apply global forces
    if (this.config.globalForces) {
      this.particles.forEach(particle => {
        this.config.globalForces!.forEach(force => {
          particle.addForce(force);
        });
      });
    }

    // Update each particle
    this.particles.forEach(particle => {
      particle.update(deltaTime);
    });
  }

  /**
   * Handle particle-to-particle collisions
   */
  private handleCollisions(): void {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const particle1 = this.particles[i];
        const particle2 = this.particles[j];

        if (particle1.isAlive() && particle2.isAlive()) {
          particle1.checkParticleCollision(particle2);
        }
      }
    }
  }

  /**
   * Handle boundary collisions
   */
  private handleBoundaryCollisions(): void {
    if (!this.config.bounds) return;

    this.particles.forEach(particle => {
      if (particle.isAlive()) {
        particle.checkBoundaryCollision(this.config.bounds!);
      }
    });
  }

  /**
   * Clean up dead particles and move them to the pool
   */
  private cleanupDeadParticles(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      if (!particle.isAlive()) {
        // Move to dead particle pool for reuse
        this.deadParticles.push(particle);
        this.particles.splice(i, 1);
      }
    }

    // Limit dead particle pool size
    if (this.deadParticles.length > this.config.maxParticles / 2) {
      this.deadParticles.splice(0, this.deadParticles.length - this.config.maxParticles / 2);
    }
  }

  /**
   * Update system statistics
   */
  private updateStats(frameTime: number): void {
    this.stats.activeParticles = this.particles.filter(p => p.isAlive()).length;
    this.stats.totalParticles = this.particles.length;
    
    // Calculate average lifetime
    if (this.particles.length > 0) {
      const totalAge = this.particles.reduce((sum, p) => sum + p.age, 0);
      this.stats.averageLifetime = totalAge / this.particles.length;
    }

    // Calculate total kinetic energy
    this.stats.totalKineticEnergy = this.particles.reduce(
      (sum, p) => sum + p.getKineticEnergy(), 0
    );

    // Track frame time
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.maxFrameHistory) {
      this.frameTimeHistory.shift();
    }
    
    this.stats.frameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / 
                          this.frameTimeHistory.length;
  }

  /**
   * Add a particle to the system
   */
  addParticle(config: ParticleConfig): Particle | null {
    if (this.particles.length >= this.config.maxParticles) {
      return null;
    }

    // Try to reuse a dead particle
    let particle: Particle;
    if (this.deadParticles.length > 0) {
      particle = this.deadParticles.pop()!;
      particle.reset(config);
    } else {
      particle = new Particle(config);
    }

    this.particles.push(particle);
    return particle;
  }

  /**
   * Remove a specific particle
   */
  removeParticle(particleId: string): boolean {
    const index = this.particles.findIndex(p => p.id === particleId);
    if (index !== -1) {
      const particle = this.particles.splice(index, 1)[0];
      this.deadParticles.push(particle);
      return true;
    }
    return false;
  }

  /**
   * Add multiple particles at once
   */
  addParticles(configs: ParticleConfig[]): Particle[] {
    const addedParticles: Particle[] = [];
    
    for (const config of configs) {
      const particle = this.addParticle(config);
      if (particle) {
        addedParticles.push(particle);
      } else {
        break; // Max particles reached
      }
    }

    return addedParticles;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.deadParticles.push(...this.particles);
    this.particles = [];
  }

  /**
   * Get all active particles
   */
  getActiveParticles(): Particle[] {
    return this.particles.filter(p => p.isAlive());
  }

  /**
   * Get all visible particles
   */
  getVisibleParticles(): Particle[] {
    return this.particles.filter(p => p.isVisible());
  }

  /**
   * Get particles within a radius of a point
   */
  getParticlesInRadius(center: Vector2D, radius: number): Particle[] {
    return this.particles.filter(particle => {
      const dx = particle.position.x - center.x;
      const dy = particle.position.y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius && particle.isAlive();
    });
  }

  /**
   * Apply force to all particles
   */
  applyGlobalForce(force: Vector2D): void {
    this.particles.forEach(particle => {
      if (particle.isAlive()) {
        particle.addForce(force);
      }
    });
  }

  /**
   * Apply force to particles in a radius
   */
  applyRadialForce(
    center: Vector2D, 
    radius: number, 
    force: Vector2D,
    falloff: boolean = true
  ): void {
    this.particles.forEach(particle => {
      if (!particle.isAlive()) return;

      const dx = particle.position.x - center.x;
      const dy = particle.position.y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        let appliedForce = { ...force };
        
        if (falloff && distance > 0) {
          const falloffFactor = 1 - (distance / radius);
          appliedForce.x *= falloffFactor;
          appliedForce.y *= falloffFactor;
        }

        particle.addForce(appliedForce);
      }
    });
  }

  /**
   * Apply explosion force (radial outward force)
   */
  applyExplosion(
    center: Vector2D,
    radius: number,
    strength: number
  ): void {
    this.particles.forEach(particle => {
      if (!particle.isAlive()) return;

      const dx = particle.position.x - center.x;
      const dy = particle.position.y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius && distance > 0) {
        const falloffFactor = 1 - (distance / radius);
        const forceStrength = strength * falloffFactor;
        
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;

        particle.addForce({
          x: normalizedX * forceStrength,
          y: normalizedY * forceStrength
        });
      }
    });
  }

  /**
   * Apply attraction force towards a point
   */
  applyAttraction(
    center: Vector2D,
    radius: number,
    strength: number
  ): void {
    this.particles.forEach(particle => {
      if (!particle.isAlive()) return;

      const dx = center.x - particle.position.x;
      const dy = center.y - particle.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius && distance > 0) {
        const falloffFactor = 1 - (distance / radius);
        const forceStrength = strength * falloffFactor;
        
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;

        particle.addForce({
          x: normalizedX * forceStrength,
          y: normalizedY * forceStrength
        });
      }
    });
  }

  /**
   * Update system configuration
   */
  updateConfig(newConfig: Partial<ParticleSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get system statistics
   */
  getStats(): ParticleSystemStats {
    return { ...this.stats };
  }

  /**
   * Get system configuration
   */
  getConfig(): ParticleSystemConfig {
    return { ...this.config };
  }

  /**
   * Pause/resume auto emission
   */
  setAutoEmit(enabled: boolean): void {
    this.config.autoEmit = enabled;
  }

  /**
   * Set emission rate
   */
  setEmissionRate(rate: number): void {
    this.config.emissionRate = rate;
    this.stats.emissionRate = rate;
  }

  /**
   * Get particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Get active particle count
   */
  getActiveParticleCount(): number {
    return this.particles.filter(p => p.isAlive()).length;
  }

  /**
   * Check if system is at capacity
   */
  isAtCapacity(): boolean {
    return this.particles.length >= this.config.maxParticles;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    frameTime: number;
    particlesPerMs: number;
    memoryUsage: number;
  } {
    const particlesPerMs = this.stats.activeParticles / Math.max(this.stats.frameTime, 0.001);
    const memoryUsage = (this.particles.length + this.deadParticles.length) * 
                       (32 * 8); // Rough estimate of particle memory usage

    return {
      frameTime: this.stats.frameTime,
      particlesPerMs,
      memoryUsage
    };
  }
}