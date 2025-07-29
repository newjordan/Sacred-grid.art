// src/physics/Forces.ts - Physics forces for particle systems

import { Vector2D } from '../types';
import { Particle } from '../animation/Particle';

/**
 * Force field configuration
 */
export interface ForceFieldConfig {
  position: Vector2D;
  strength: number;
  radius: number;
  falloff: 'linear' | 'quadratic' | 'none';
  enabled: boolean;
}

/**
 * Spring configuration
 */
export interface SpringConfig {
  restLength: number;
  stiffness: number;
  damping: number;
}

/**
 * Base force class
 */
export abstract class BaseForce {
  protected enabled: boolean = true;

  /**
   * Apply force to a particle
   */
  abstract apply(particle: Particle, deltaTime: number): void;

  /**
   * Enable/disable force
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if force is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * Gravity force - constant downward acceleration
 */
export class GravityForce extends BaseForce {
  private gravity: Vector2D;

  constructor(gravity: Vector2D = { x: 0, y: 9.81 }) {
    super();
    this.gravity = { ...gravity };
  }

  apply(particle: Particle): void {
    if (!this.enabled) return;

    particle.addForce({
      x: this.gravity.x * particle.mass,
      y: this.gravity.y * particle.mass
    });
  }

  /**
   * Set gravity vector
   */
  setGravity(gravity: Vector2D): void {
    this.gravity = { ...gravity };
  }

  /**
   * Get gravity vector
   */
  getGravity(): Vector2D {
    return { ...this.gravity };
  }
}

/**
 * Drag force - opposes motion
 */
export class DragForce extends BaseForce {
  private dragCoefficient: number;

  constructor(dragCoefficient: number = 0.1) {
    super();
    this.dragCoefficient = dragCoefficient;
  }

  apply(particle: Particle): void {
    if (!this.enabled) return;

    const velocity = particle.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (speed > 0) {
      const dragMagnitude = this.dragCoefficient * speed * speed;
      const dragForce = {
        x: -(velocity.x / speed) * dragMagnitude,
        y: -(velocity.y / speed) * dragMagnitude
      };

      particle.addForce(dragForce);
    }
  }

  /**
   * Set drag coefficient
   */
  setDragCoefficient(coefficient: number): void {
    this.dragCoefficient = coefficient;
  }
}

/**
 * Attraction force - pulls particles toward a point
 */
export class AttractionForce extends BaseForce {
  private config: ForceFieldConfig;

  constructor(config: ForceFieldConfig) {
    super();
    this.config = { ...config };
  }

  apply(particle: Particle): void {
    if (!this.enabled || !this.config.enabled) return;

    const dx = this.config.position.x - particle.position.x;
    const dy = this.config.position.y - particle.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.config.radius || distance === 0) return;

    // Calculate force magnitude with falloff
    let forceMagnitude = this.config.strength;
    
    switch (this.config.falloff) {
      case 'linear':
        forceMagnitude *= (this.config.radius - distance) / this.config.radius;
        break;
      case 'quadratic':
        const falloffRatio = (this.config.radius - distance) / this.config.radius;
        forceMagnitude *= falloffRatio * falloffRatio;
        break;
      case 'none':
        // No falloff
        break;
    }

    // Apply force toward the attraction point
    const normalizedX = dx / distance;
    const normalizedY = dy / distance;

    particle.addForce({
      x: normalizedX * forceMagnitude,
      y: normalizedY * forceMagnitude
    });
  }

  /**
   * Update force field configuration
   */
  updateConfig(config: Partial<ForceFieldConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get force field configuration
   */
  getConfig(): ForceFieldConfig {
    return { ...this.config };
  }
}

/**
 * Repulsion force - pushes particles away from a point
 */
export class RepulsionForce extends BaseForce {
  private config: ForceFieldConfig;

  constructor(config: ForceFieldConfig) {
    super();
    this.config = { ...config };
  }

  apply(particle: Particle): void {
    if (!this.enabled || !this.config.enabled) return;

    const dx = particle.position.x - this.config.position.x;
    const dy = particle.position.y - this.config.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.config.radius || distance === 0) return;

    // Calculate force magnitude with falloff
    let forceMagnitude = this.config.strength;
    
    switch (this.config.falloff) {
      case 'linear':
        forceMagnitude *= (this.config.radius - distance) / this.config.radius;
        break;
      case 'quadratic':
        const falloffRatio = (this.config.radius - distance) / this.config.radius;
        forceMagnitude *= falloffRatio * falloffRatio;
        break;
      case 'none':
        // No falloff
        break;
    }

    // Apply force away from the repulsion point
    const normalizedX = dx / distance;
    const normalizedY = dy / distance;

    particle.addForce({
      x: normalizedX * forceMagnitude,
      y: normalizedY * forceMagnitude
    });
  }

  /**
   * Update force field configuration
   */
  updateConfig(config: Partial<ForceFieldConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Spring force - connects two particles with a spring
 */
export class SpringForce extends BaseForce {
  private particle1: Particle;
  private particle2: Particle;
  private config: SpringConfig;

  constructor(particle1: Particle, particle2: Particle, config: SpringConfig) {
    super();
    this.particle1 = particle1;
    this.particle2 = particle2;
    this.config = { ...config };
  }

  apply(): void {
    if (!this.enabled) return;

    const dx = this.particle2.position.x - this.particle1.position.x;
    const dy = this.particle2.position.y - this.particle1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Spring force (Hooke's law)
    const displacement = distance - this.config.restLength;
    const springForce = this.config.stiffness * displacement;

    // Damping force
    const relativeVelocityX = this.particle2.velocity.x - this.particle1.velocity.x;
    const relativeVelocityY = this.particle2.velocity.y - this.particle1.velocity.y;
    
    const normalizedX = dx / distance;
    const normalizedY = dy / distance;
    
    const relativeVelocityAlongSpring = 
      relativeVelocityX * normalizedX + relativeVelocityY * normalizedY;
    
    const dampingForce = this.config.damping * relativeVelocityAlongSpring;

    // Total force magnitude
    const totalForce = springForce + dampingForce;

    // Apply forces to both particles
    const forceX = normalizedX * totalForce;
    const forceY = normalizedY * totalForce;

    this.particle1.addForce({ x: forceX, y: forceY });
    this.particle2.addForce({ x: -forceX, y: -forceY });
  }

  /**
   * Update spring configuration
   */
  updateConfig(config: Partial<SpringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get spring length
   */
  getCurrentLength(): number {
    const dx = this.particle2.position.x - this.particle1.position.x;
    const dy = this.particle2.position.y - this.particle1.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Vortex force - creates swirling motion around a point
 */
export class VortexForce extends BaseForce {
  private config: ForceFieldConfig & {
    rotationSpeed: number;
    inward: boolean;
  };

  constructor(config: ForceFieldConfig & {
    rotationSpeed: number;
    inward?: boolean;
  }) {
    super();
    this.config = {
      inward: false,
      ...config
    };
  }

  apply(particle: Particle): void {
    if (!this.enabled || !this.config.enabled) return;

    const dx = particle.position.x - this.config.position.x;
    const dy = particle.position.y - this.config.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.config.radius || distance === 0) return;

    // Calculate force magnitude with falloff
    let forceMagnitude = this.config.strength;
    
    switch (this.config.falloff) {
      case 'linear':
        forceMagnitude *= (this.config.radius - distance) / this.config.radius;
        break;
      case 'quadratic':
        const falloffRatio = (this.config.radius - distance) / this.config.radius;
        forceMagnitude *= falloffRatio * falloffRatio;
        break;
    }

    // Tangential force (perpendicular to radius)
    const tangentialX = -dy / distance;
    const tangentialY = dx / distance;

    // Radial force (toward or away from center)
    const radialX = this.config.inward ? -dx / distance : dx / distance;
    const radialY = this.config.inward ? -dy / distance : dy / distance;

    // Combine tangential and radial forces
    const rotationForce = forceMagnitude * this.config.rotationSpeed;
    const radialForce = forceMagnitude * 0.1; // Small radial component

    particle.addForce({
      x: tangentialX * rotationForce + radialX * radialForce,
      y: tangentialY * rotationForce + radialY * radialForce
    });
  }
}

/**
 * Wind force - applies directional force with turbulence
 */
export class WindForce extends BaseForce {
  private direction: Vector2D;
  private strength: number;
  private turbulence: number;
  private time: number = 0;

  constructor(
    direction: Vector2D,
    strength: number = 50,
    turbulence: number = 0.1
  ) {
    super();
    this.direction = { ...direction };
    this.strength = strength;
    this.turbulence = turbulence;
  }

  apply(particle: Particle, deltaTime: number): void {
    if (!this.enabled) return;

    this.time += deltaTime;

    // Base wind force
    let windX = this.direction.x * this.strength;
    let windY = this.direction.y * this.strength;

    // Add turbulence using noise-like function
    if (this.turbulence > 0) {
      const noiseX = Math.sin(this.time * 2 + particle.position.x * 0.01) * this.turbulence;
      const noiseY = Math.cos(this.time * 1.5 + particle.position.y * 0.01) * this.turbulence;
      
      windX += noiseX * this.strength;
      windY += noiseY * this.strength;
    }

    particle.addForce({ x: windX, y: windY });
  }

  /**
   * Set wind direction
   */
  setDirection(direction: Vector2D): void {
    this.direction = { ...direction };
  }

  /**
   * Set wind strength
   */
  setStrength(strength: number): void {
    this.strength = strength;
  }

  /**
   * Set turbulence amount
   */
  setTurbulence(turbulence: number): void {
    this.turbulence = turbulence;
  }
}

/**
 * Force manager for handling multiple forces
 */
export class ForceManager {
  private forces: Map<string, BaseForce> = new Map();
  private springs: Map<string, SpringForce> = new Map();

  /**
   * Add a force
   */
  addForce(id: string, force: BaseForce): void {
    this.forces.set(id, force);
  }

  /**
   * Remove a force
   */
  removeForce(id: string): boolean {
    return this.forces.delete(id);
  }

  /**
   * Add a spring force
   */
  addSpring(id: string, spring: SpringForce): void {
    this.springs.set(id, spring);
  }

  /**
   * Remove a spring force
   */
  removeSpring(id: string): boolean {
    return this.springs.delete(id);
  }

  /**
   * Apply all forces to a particle
   */
  applyForces(particle: Particle, deltaTime: number): void {
    // Apply regular forces
    this.forces.forEach(force => {
      if (force.isEnabled()) {
        force.apply(particle, deltaTime);
      }
    });
  }

  /**
   * Update all spring forces
   */
  updateSprings(): void {
    this.springs.forEach(spring => {
      if (spring.isEnabled()) {
        spring.apply();
      }
    });
  }

  /**
   * Enable/disable all forces
   */
  setAllEnabled(enabled: boolean): void {
    this.forces.forEach(force => force.setEnabled(enabled));
    this.springs.forEach(spring => spring.setEnabled(enabled));
  }

  /**
   * Get force by ID
   */
  getForce(id: string): BaseForce | undefined {
    return this.forces.get(id);
  }

  /**
   * Get spring by ID
   */
  getSpring(id: string): SpringForce | undefined {
    return this.springs.get(id);
  }

  /**
   * Clear all forces
   */
  clear(): void {
    this.forces.clear();
    this.springs.clear();
  }

  /**
   * Get active force count
   */
  getActiveForceCount(): number {
    let count = 0;
    this.forces.forEach(force => {
      if (force.isEnabled()) count++;
    });
    this.springs.forEach(spring => {
      if (spring.isEnabled()) count++;
    });
    return count;
  }
}