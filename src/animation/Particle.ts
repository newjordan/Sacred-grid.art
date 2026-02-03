// src/animation/Particle.ts - Individual particle class with physics

import { Vector2D } from '../types';

/**
 * Particle lifecycle states
 */
export type ParticleState = 'active' | 'dying' | 'dead';

/**
 * Particle configuration
 */
export interface ParticleConfig {
  position: Vector2D;
  velocity?: Vector2D;
  acceleration?: Vector2D;
  mass?: number;
  size?: number;
  color?: string;
  opacity?: number;
  lifetime?: number;
  drag?: number;
  bounce?: number;
  gravity?: Vector2D;
}

/**
 * Individual particle with physics simulation
 */
export class Particle {
  // Position and motion
  public position: Vector2D;
  public velocity: Vector2D;
  public acceleration: Vector2D;
  public previousPosition: Vector2D;

  // Physical properties
  public mass: number;
  public size: number;
  public drag: number;
  public bounce: number;

  // Visual properties
  public color: string;
  public opacity: number;
  public initialOpacity: number;

  // Lifecycle
  public age: number;
  public lifetime: number;
  public state: ParticleState;

  // Forces
  public forces: Vector2D[];
  public gravity: Vector2D;

  // Unique identifier
  public id: string;

  // Color transition properties
  private targetColor: string | null = null;
  private sourceColor: string | null = null;
  private colorTransitionDuration: number = 0;
  private colorTransitionProgress: number = 0;

  constructor(config: ParticleConfig) {
    // Position and motion
    this.position = { ...config.position };
    this.velocity = config.velocity || { x: 0, y: 0 };
    this.acceleration = config.acceleration || { x: 0, y: 0 };
    this.previousPosition = { ...this.position };

    // Physical properties
    this.mass = config.mass || 1;
    this.size = config.size || 2;
    this.drag = config.drag || 0.99;
    this.bounce = config.bounce || 0.8;

    // Visual properties
    this.color = config.color || '#ffffff';
    this.opacity = config.opacity || 1;
    this.initialOpacity = this.opacity;

    // Lifecycle
    this.age = 0;
    this.lifetime = config.lifetime || Infinity;
    this.state = 'active';

    // Forces
    this.forces = [];
    this.gravity = config.gravity || { x: 0, y: 0 };

    // Generate unique ID
    this.id = Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update particle physics and lifecycle
   */
  update(deltaTime: number): void {
    if (this.state === 'dead') return;

    // Store previous position for collision detection
    this.previousPosition = { ...this.position };

    // Apply forces
    this.applyForces();

    // Update velocity with acceleration
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;

    // Apply drag
    this.velocity.x *= this.drag;
    this.velocity.y *= this.drag;

    // Update position with velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Reset acceleration (forces need to be applied each frame)
    this.acceleration.x = 0;
    this.acceleration.y = 0;

    // Update age and lifecycle
    this.age += deltaTime;
    this.updateLifecycle();

    // Update color transition if active
    this.updateColorTransition(deltaTime);

    // Clear forces for next frame
    this.forces = [];
  }

  /**
   * Apply accumulated forces
   */
  private applyForces(): void {
    // Apply gravity
    this.acceleration.x += this.gravity.x;
    this.acceleration.y += this.gravity.y;

    // Apply accumulated forces
    this.forces.forEach(force => {
      this.acceleration.x += force.x / this.mass;
      this.acceleration.y += force.y / this.mass;
    });
  }

  /**
   * Update particle lifecycle and visual properties
   */
  private updateLifecycle(): void {
    if (this.lifetime === Infinity) return;

    const lifeRatio = this.age / this.lifetime;

    if (lifeRatio >= 1) {
      this.state = 'dead';
      this.opacity = 0;
    } else if (lifeRatio >= 0.8) {
      this.state = 'dying';
      // Fade out in the last 20% of lifetime
      const fadeRatio = (lifeRatio - 0.8) / 0.2;
      this.opacity = this.initialOpacity * (1 - fadeRatio);
    }

    // Optional size changes over lifetime
    if (this.state === 'dying') {
      this.size *= 0.98; // Shrink slightly
    }
  }

  /**
   * Add force to particle
   */
  addForce(force: Vector2D): void {
    this.forces.push({ ...force });
  }

  /**
   * Apply impulse (instant velocity change)
   */
  applyImpulse(impulse: Vector2D): void {
    this.velocity.x += impulse.x / this.mass;
    this.velocity.y += impulse.y / this.mass;
  }

  /**
   * Check collision with boundaries
   */
  checkBoundaryCollision(bounds: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }): boolean {
    let collided = false;

    // Left boundary
    if (this.position.x - this.size / 2 <= bounds.left) {
      this.position.x = bounds.left + this.size / 2;
      this.velocity.x *= -this.bounce;
      collided = true;
    }

    // Right boundary
    if (this.position.x + this.size / 2 >= bounds.right) {
      this.position.x = bounds.right - this.size / 2;
      this.velocity.x *= -this.bounce;
      collided = true;
    }

    // Top boundary
    if (this.position.y - this.size / 2 <= bounds.top) {
      this.position.y = bounds.top + this.size / 2;
      this.velocity.y *= -this.bounce;
      collided = true;
    }

    // Bottom boundary
    if (this.position.y + this.size / 2 >= bounds.bottom) {
      this.position.y = bounds.bottom - this.size / 2;
      this.velocity.y *= -this.bounce;
      collided = true;
    }

    return collided;
  }

  /**
   * Check collision with another particle
   */
  checkParticleCollision(other: Particle): boolean {
    const dx = other.position.x - this.position.x;
    const dy = other.position.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (this.size + other.size) / 2;

    if (distance < minDistance && distance > 0) {
      // Collision detected - resolve collision
      this.resolveParticleCollision(other, dx, dy, distance);
      return true;
    }

    return false;
  }

  /**
   * Resolve collision with another particle
   */
  private resolveParticleCollision(
    other: Particle,
    dx: number,
    dy: number,
    distance: number
  ): void {
    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Separate particles
    const overlap = (this.size + other.size) / 2 - distance;
    const separationX = (overlap / 2) * nx;
    const separationY = (overlap / 2) * ny;

    this.position.x -= separationX;
    this.position.y -= separationY;
    other.position.x += separationX;
    other.position.y += separationY;

    // Calculate relative velocity
    const relativeVelocityX = other.velocity.x - this.velocity.x;
    const relativeVelocityY = other.velocity.y - this.velocity.y;

    // Calculate relative velocity along collision normal
    const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Calculate restitution (bounce)
    const restitution = Math.min(this.bounce, other.bounce);

    // Calculate impulse scalar
    const impulseScalar = -(1 + restitution) * velocityAlongNormal;
    const totalMass = this.mass + other.mass;
    const impulse = impulseScalar / totalMass;

    // Apply impulse
    const impulseX = impulse * nx;
    const impulseY = impulse * ny;

    this.velocity.x -= impulseX * other.mass;
    this.velocity.y -= impulseY * other.mass;
    other.velocity.x += impulseX * this.mass;
    other.velocity.y += impulseY * this.mass;
  }

  /**
   * Calculate distance to another particle
   */
  distanceTo(other: Particle): number {
    const dx = other.position.x - this.position.x;
    const dy = other.position.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate kinetic energy
   */
  getKineticEnergy(): number {
    const velocitySquared = this.velocity.x * this.velocity.x + 
                           this.velocity.y * this.velocity.y;
    return 0.5 * this.mass * velocitySquared;
  }

  /**
   * Get particle momentum
   */
  getMomentum(): Vector2D {
    return {
      x: this.mass * this.velocity.x,
      y: this.mass * this.velocity.y
    };
  }

  /**
   * Set particle color with optional fade transition
   */
  setColor(color: string, fadeTime?: number): void {
    if (fadeTime && fadeTime > 0) {
      // Start a color transition
      this.sourceColor = this.color;
      this.targetColor = color;
      this.colorTransitionDuration = fadeTime;
      this.colorTransitionProgress = 0;
    } else {
      // Instant color change
      this.color = color;
      this.targetColor = null;
      this.sourceColor = null;
    }
  }

  /**
   * Update color transition progress
   */
  private updateColorTransition(deltaTime: number): void {
    if (!this.targetColor || !this.sourceColor) return;

    this.colorTransitionProgress += deltaTime / this.colorTransitionDuration;

    if (this.colorTransitionProgress >= 1) {
      // Transition complete
      this.color = this.targetColor;
      this.targetColor = null;
      this.sourceColor = null;
      this.colorTransitionProgress = 0;
    } else {
      // Interpolate between colors
      this.color = this.interpolateColor(
        this.sourceColor,
        this.targetColor,
        this.easeInOutCubic(this.colorTransitionProgress)
      );
    }
  }

  /**
   * Interpolate between two hex colors
   */
  private interpolateColor(color1: string, color2: string, t: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Easing function for smooth transitions
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Reset particle to initial state
   */
  reset(config?: Partial<ParticleConfig>): void {
    if (config?.position) {
      this.position = { ...config.position };
      this.previousPosition = { ...this.position };
    }

    if (config?.velocity) {
      this.velocity = { ...config.velocity };
    } else {
      this.velocity = { x: 0, y: 0 };
    }

    this.acceleration = { x: 0, y: 0 };
    this.age = 0;
    this.state = 'active';
    this.opacity = this.initialOpacity;
    this.forces = [];

    // Apply any other config changes
    if (config?.mass !== undefined) this.mass = config.mass;
    if (config?.size !== undefined) this.size = config.size;
    if (config?.color) this.color = config.color;
    if (config?.lifetime !== undefined) this.lifetime = config.lifetime;
    if (config?.drag !== undefined) this.drag = config.drag;
    if (config?.bounce !== undefined) this.bounce = config.bounce;
    if (config?.gravity) this.gravity = { ...config.gravity };
  }

  /**
   * Clone particle with optional modifications
   */
  clone(modifications?: Partial<ParticleConfig>): Particle {
    const config: ParticleConfig = {
      position: { ...this.position },
      velocity: { ...this.velocity },
      acceleration: { ...this.acceleration },
      mass: this.mass,
      size: this.size,
      color: this.color,
      opacity: this.initialOpacity,
      lifetime: this.lifetime,
      drag: this.drag,
      bounce: this.bounce,
      gravity: { ...this.gravity },
      ...modifications
    };

    return new Particle(config);
  }

  /**
   * Check if particle is alive
   */
  isAlive(): boolean {
    return this.state !== 'dead';
  }

  /**
   * Check if particle is visible
   */
  isVisible(): boolean {
    return this.isAlive() && this.opacity > 0.01;
  }

  /**
   * Get particle data for rendering
   */
  getRenderData(): {
    position: Vector2D;
    size: number;
    color: string;
    opacity: number;
  } {
    return {
      position: { ...this.position },
      size: this.size,
      color: this.color,
      opacity: this.opacity
    };
  }
}