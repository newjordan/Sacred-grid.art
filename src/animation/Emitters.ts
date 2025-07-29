// src/animation/Emitters.ts - Particle emission patterns

import { ParticleSystem } from './ParticleSystem';
import { ParticleConfig } from './Particle';
import { Vector2D } from '../types';

/**
 * Base emitter configuration
 */
export interface EmitterConfig {
  position: Vector2D;
  emissionRate: number;
  particleLifetime: number;
  particleSize: number;
  particleColor: string;
  particleOpacity: number;
  enabled: boolean;
  duration?: number; // Emitter lifetime (undefined = infinite)
}

/**
 * Base particle emitter class
 */
export abstract class BaseEmitter {
  protected config: EmitterConfig;
  protected particleSystem: ParticleSystem;
  protected emissionTimer: number = 0;
  protected age: number = 0;
  protected active: boolean = true;

  constructor(particleSystem: ParticleSystem, config: EmitterConfig) {
    this.particleSystem = particleSystem;
    this.config = { ...config };
  }

  /**
   * Update emitter and emit particles
   */
  update(deltaTime: number): void {
    if (!this.config.enabled || !this.active) return;

    this.age += deltaTime;

    // Check if emitter has expired
    if (this.config.duration && this.age >= this.config.duration) {
      this.active = false;
      return;
    }

    // Handle emission timing
    this.emissionTimer += deltaTime;
    const emissionInterval = 1 / this.config.emissionRate;

    while (this.emissionTimer >= emissionInterval) {
      this.emissionTimer -= emissionInterval;
      this.emitParticle();
    }
  }

  /**
   * Abstract method to emit a particle (implemented by subclasses)
   */
  protected abstract emitParticle(): void;

  /**
   * Create base particle configuration
   */
  protected createBaseParticleConfig(): ParticleConfig {
    return {
      position: { ...this.config.position },
      velocity: { x: 0, y: 0 },
      size: this.config.particleSize,
      color: this.config.particleColor,
      opacity: this.config.particleOpacity,
      lifetime: this.config.particleLifetime
    };
  }

  /**
   * Enable/disable emitter
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Set emitter position
   */
  setPosition(position: Vector2D): void {
    this.config.position = { ...position };
  }

  /**
   * Check if emitter is active
   */
  isActive(): boolean {
    return this.active && this.config.enabled;
  }

  /**
   * Reset emitter
   */
  reset(): void {
    this.age = 0;
    this.emissionTimer = 0;
    this.active = true;
  }
}

/**
 * Point emitter - emits particles from a single point
 */
export class PointEmitter extends BaseEmitter {
  private velocityRange: {
    min: Vector2D;
    max: Vector2D;
  };

  constructor(
    particleSystem: ParticleSystem,
    config: EmitterConfig & {
      velocityRange?: {
        min: Vector2D;
        max: Vector2D;
      };
    }
  ) {
    super(particleSystem, config);
    this.velocityRange = config.velocityRange || {
      min: { x: -50, y: -50 },
      max: { x: 50, y: 50 }
    };
  }

  protected emitParticle(): void {
    const particleConfig = this.createBaseParticleConfig();
    
    // Random velocity within range
    particleConfig.velocity = {
      x: this.velocityRange.min.x + 
         Math.random() * (this.velocityRange.max.x - this.velocityRange.min.x),
      y: this.velocityRange.min.y + 
         Math.random() * (this.velocityRange.max.y - this.velocityRange.min.y)
    };

    this.particleSystem.addParticle(particleConfig);
  }
}

/**
 * Directional emitter - emits particles in a specific direction with spread
 */
export class DirectionalEmitter extends BaseEmitter {
  private direction: number; // Angle in radians
  private spread: number;    // Spread angle in radians
  private speed: { min: number; max: number };

  constructor(
    particleSystem: ParticleSystem,
    config: EmitterConfig & {
      direction: number;
      spread: number;
      speed: { min: number; max: number };
    }
  ) {
    super(particleSystem, config);
    this.direction = config.direction;
    this.spread = config.spread;
    this.speed = config.speed;
  }

  protected emitParticle(): void {
    const particleConfig = this.createBaseParticleConfig();
    
    // Random angle within spread
    const angle = this.direction + (Math.random() - 0.5) * this.spread;
    
    // Random speed within range
    const speed = this.speed.min + Math.random() * (this.speed.max - this.speed.min);
    
    particleConfig.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };

    this.particleSystem.addParticle(particleConfig);
  }

  /**
   * Set emission direction
   */
  setDirection(direction: number): void {
    this.direction = direction;
  }

  /**
   * Set emission spread
   */
  setSpread(spread: number): void {
    this.spread = spread;
  }
}

/**
 * Circular emitter - emits particles in a circle pattern
 */
export class CircularEmitter extends BaseEmitter {
  private radius: number;
  private speed: { min: number; max: number };
  private inward: boolean;

  constructor(
    particleSystem: ParticleSystem,
    config: EmitterConfig & {
      radius: number;
      speed: { min: number; max: number };
      inward?: boolean;
    }
  ) {
    super(particleSystem, config);
    this.radius = config.radius;
    this.speed = config.speed;
    this.inward = config.inward || false;
  }

  protected emitParticle(): void {
    const particleConfig = this.createBaseParticleConfig();
    
    // Random angle around circle
    const angle = Math.random() * Math.PI * 2;
    
    // Position on circle
    particleConfig.position = {
      x: this.config.position.x + Math.cos(angle) * this.radius,
      y: this.config.position.y + Math.sin(angle) * this.radius
    };
    
    // Velocity direction (inward or outward)
    const speed = this.speed.min + Math.random() * (this.speed.max - this.speed.min);
    const velocityAngle = this.inward ? angle + Math.PI : angle;
    
    particleConfig.velocity = {
      x: Math.cos(velocityAngle) * speed,
      y: Math.sin(velocityAngle) * speed
    };

    this.particleSystem.addParticle(particleConfig);
  }
}

/**
 * Line emitter - emits particles along a line
 */
export class LineEmitter extends BaseEmitter {
  private endPosition: Vector2D;
  private velocityRange: {
    min: Vector2D;
    max: Vector2D;
  };

  constructor(
    particleSystem: ParticleSystem,
    config: EmitterConfig & {
      endPosition: Vector2D;
      velocityRange?: {
        min: Vector2D;
        max: Vector2D;
      };
    }
  ) {
    super(particleSystem, config);
    this.endPosition = config.endPosition;
    this.velocityRange = config.velocityRange || {
      min: { x: -25, y: -25 },
      max: { x: 25, y: 25 }
    };
  }

  protected emitParticle(): void {
    const particleConfig = this.createBaseParticleConfig();
    
    // Random position along line
    const t = Math.random();
    particleConfig.position = {
      x: this.config.position.x + t * (this.endPosition.x - this.config.position.x),
      y: this.config.position.y + t * (this.endPosition.y - this.config.position.y)
    };
    
    // Random velocity
    particleConfig.velocity = {
      x: this.velocityRange.min.x + 
         Math.random() * (this.velocityRange.max.x - this.velocityRange.min.x),
      y: this.velocityRange.min.y + 
         Math.random() * (this.velocityRange.max.y - this.velocityRange.min.y)
    };

    this.particleSystem.addParticle(particleConfig);
  }

  /**
   * Set line end position
   */
  setEndPosition(endPosition: Vector2D): void {
    this.endPosition = { ...endPosition };
  }
}

/**
 * Shape emitter - emits particles from vertices of a shape
 */
export class ShapeEmitter extends BaseEmitter {
  private vertices: Vector2D[];
  private velocityRange: {
    min: Vector2D;
    max: Vector2D;
  };

  constructor(
    particleSystem: ParticleSystem,
    config: EmitterConfig & {
      vertices: Vector2D[];
      velocityRange?: {
        min: Vector2D;
        max: Vector2D;
      };
    }
  ) {
    super(particleSystem, config);
    this.vertices = config.vertices.map(v => ({ ...v }));
    this.velocityRange = config.velocityRange || {
      min: { x: -30, y: -30 },
      max: { x: 30, y: 30 }
    };
  }

  protected emitParticle(): void {
    if (this.vertices.length === 0) return;

    const particleConfig = this.createBaseParticleConfig();
    
    // Random vertex
    const vertex = this.vertices[Math.floor(Math.random() * this.vertices.length)];
    particleConfig.position = {
      x: this.config.position.x + vertex.x,
      y: this.config.position.y + vertex.y
    };
    
    // Random velocity
    particleConfig.velocity = {
      x: this.velocityRange.min.x + 
         Math.random() * (this.velocityRange.max.x - this.velocityRange.min.x),
      y: this.velocityRange.min.y + 
         Math.random() * (this.velocityRange.max.y - this.velocityRange.min.y)
    };

    this.particleSystem.addParticle(particleConfig);
  }

  /**
   * Update shape vertices
   */
  setVertices(vertices: Vector2D[]): void {
    this.vertices = vertices.map(v => ({ ...v }));
  }
}

/**
 * Burst emitter - emits all particles at once
 */
export class BurstEmitter extends BaseEmitter {
  private particleCount: number;
  private velocityRange: {
    min: Vector2D;
    max: Vector2D;
  };
  private hasEmitted: boolean = false;

  constructor(
    particleSystem: ParticleSystem,
    config: EmitterConfig & {
      particleCount: number;
      velocityRange?: {
        min: Vector2D;
        max: Vector2D;
      };
    }
  ) {
    super(particleSystem, config);
    this.particleCount = config.particleCount;
    this.velocityRange = config.velocityRange || {
      min: { x: -100, y: -100 },
      max: { x: 100, y: 100 }
    };
  }

  update(deltaTime: number): void {
    if (!this.config.enabled || !this.active || this.hasEmitted) return;

    // Emit all particles at once
    for (let i = 0; i < this.particleCount; i++) {
      this.emitParticle();
    }

    this.hasEmitted = true;
    this.active = false;
  }

  protected emitParticle(): void {
    const particleConfig = this.createBaseParticleConfig();
    
    // Random velocity
    particleConfig.velocity = {
      x: this.velocityRange.min.x + 
         Math.random() * (this.velocityRange.max.x - this.velocityRange.min.x),
      y: this.velocityRange.min.y + 
         Math.random() * (this.velocityRange.max.y - this.velocityRange.min.y)
    };

    this.particleSystem.addParticle(particleConfig);
  }

  /**
   * Reset burst emitter
   */
  reset(): void {
    super.reset();
    this.hasEmitted = false;
  }
}

/**
 * Fountain emitter - emits particles upward with gravity
 */
export class FountainEmitter extends BaseEmitter {
  private speed: { min: number; max: number };
  private angle: { min: number; max: number }; // Angle range from vertical

  constructor(
    particleSystem: ParticleSystem,
    config: EmitterConfig & {
      speed: { min: number; max: number };
      angle?: { min: number; max: number };
    }
  ) {
    super(particleSystem, config);
    this.speed = config.speed;
    this.angle = config.angle || { min: -Math.PI / 6, max: Math.PI / 6 };
  }

  protected emitParticle(): void {
    const particleConfig = this.createBaseParticleConfig();
    
    // Random angle from vertical
    const angle = -Math.PI / 2 + // Start from vertical (up)
                  this.angle.min + Math.random() * (this.angle.max - this.angle.min);
    
    // Random speed
    const speed = this.speed.min + Math.random() * (this.speed.max - this.speed.min);
    
    particleConfig.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };

    // Add gravity
    particleConfig.gravity = { x: 0, y: 200 }; // Downward gravity

    this.particleSystem.addParticle(particleConfig);
  }
}

/**
 * Emitter manager for handling multiple emitters
 */
export class EmitterManager {
  private emitters: Map<string, BaseEmitter> = new Map();

  /**
   * Add an emitter
   */
  addEmitter(id: string, emitter: BaseEmitter): void {
    this.emitters.set(id, emitter);
  }

  /**
   * Remove an emitter
   */
  removeEmitter(id: string): boolean {
    return this.emitters.delete(id);
  }

  /**
   * Get an emitter by ID
   */
  getEmitter(id: string): BaseEmitter | undefined {
    return this.emitters.get(id);
  }

  /**
   * Update all emitters
   */
  update(deltaTime: number): void {
    this.emitters.forEach(emitter => {
      emitter.update(deltaTime);
    });
  }

  /**
   * Enable/disable all emitters
   */
  setAllEnabled(enabled: boolean): void {
    this.emitters.forEach(emitter => {
      emitter.setEnabled(enabled);
    });
  }

  /**
   * Reset all emitters
   */
  resetAll(): void {
    this.emitters.forEach(emitter => {
      emitter.reset();
    });
  }

  /**
   * Get active emitter count
   */
  getActiveEmitterCount(): number {
    let count = 0;
    this.emitters.forEach(emitter => {
      if (emitter.isActive()) count++;
    });
    return count;
  }

  /**
   * Clear all emitters
   */
  clear(): void {
    this.emitters.clear();
  }

  /**
   * Get all emitter IDs
   */
  getEmitterIds(): string[] {
    return Array.from(this.emitters.keys());
  }
}