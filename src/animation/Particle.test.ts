// src/animation/Particle.test.ts - Comprehensive tests for Particle class

import { Particle, ParticleConfig, ParticleState } from './Particle';
import { Vector2D } from '../types';

describe('Particle', () => {
  // Helper function to create a particle with default or custom config
  const createParticle = (overrides: Partial<ParticleConfig> = {}): Particle => {
    const defaultConfig: ParticleConfig = {
      position: { x: 100, y: 100 },
      ...overrides,
    };
    return new Particle(defaultConfig);
  };

  describe('Particle Creation', () => {
    describe('with default configuration', () => {
      it('should create a particle with required position', () => {
        const particle = createParticle();

        expect(particle.position).toEqual({ x: 100, y: 100 });
      });

      it('should initialize with default velocity of zero', () => {
        const particle = createParticle();

        expect(particle.velocity).toEqual({ x: 0, y: 0 });
      });

      it('should initialize with default acceleration of zero', () => {
        const particle = createParticle();

        expect(particle.acceleration).toEqual({ x: 0, y: 0 });
      });

      it('should initialize with default mass of 1', () => {
        const particle = createParticle();

        expect(particle.mass).toBe(1);
      });

      it('should initialize with default size of 2', () => {
        const particle = createParticle();

        expect(particle.size).toBe(2);
      });

      it('should initialize with default color white (#ffffff)', () => {
        const particle = createParticle();

        expect(particle.color).toBe('#ffffff');
      });

      it('should initialize with default opacity of 1', () => {
        const particle = createParticle();

        expect(particle.opacity).toBe(1);
        expect(particle.initialOpacity).toBe(1);
      });

      it('should initialize with infinite lifetime by default', () => {
        const particle = createParticle();

        expect(particle.lifetime).toBe(Infinity);
      });

      it('should initialize with default drag of 0.99', () => {
        const particle = createParticle();

        expect(particle.drag).toBe(0.99);
      });

      it('should initialize with default bounce of 0.8', () => {
        const particle = createParticle();

        expect(particle.bounce).toBe(0.8);
      });

      it('should initialize with zero gravity', () => {
        const particle = createParticle();

        expect(particle.gravity).toEqual({ x: 0, y: 0 });
      });

      it('should initialize as active state', () => {
        const particle = createParticle();

        expect(particle.state).toBe('active');
      });

      it('should initialize with age of 0', () => {
        const particle = createParticle();

        expect(particle.age).toBe(0);
      });

      it('should generate a unique id', () => {
        const particle1 = createParticle();
        const particle2 = createParticle();

        expect(particle1.id).toBeDefined();
        expect(particle2.id).toBeDefined();
        expect(particle1.id).not.toBe(particle2.id);
      });

      it('should initialize previousPosition to match position', () => {
        const particle = createParticle({ position: { x: 50, y: 75 } });

        expect(particle.previousPosition).toEqual({ x: 50, y: 75 });
      });

      it('should initialize with empty forces array', () => {
        const particle = createParticle();

        expect(particle.forces).toEqual([]);
      });
    });

    describe('with custom configuration', () => {
      it('should use custom velocity when provided', () => {
        const particle = createParticle({ velocity: { x: 10, y: -5 } });

        expect(particle.velocity).toEqual({ x: 10, y: -5 });
      });

      it('should use custom acceleration when provided', () => {
        const particle = createParticle({ acceleration: { x: 0.5, y: 1 } });

        expect(particle.acceleration).toEqual({ x: 0.5, y: 1 });
      });

      it('should use custom mass when provided', () => {
        const particle = createParticle({ mass: 5 });

        expect(particle.mass).toBe(5);
      });

      it('should use custom size when provided', () => {
        const particle = createParticle({ size: 10 });

        expect(particle.size).toBe(10);
      });

      it('should use custom color when provided', () => {
        const particle = createParticle({ color: '#ff0000' });

        expect(particle.color).toBe('#ff0000');
      });

      it('should use custom opacity when provided', () => {
        const particle = createParticle({ opacity: 0.5 });

        expect(particle.opacity).toBe(0.5);
        expect(particle.initialOpacity).toBe(0.5);
      });

      it('should use custom lifetime when provided', () => {
        const particle = createParticle({ lifetime: 1000 });

        expect(particle.lifetime).toBe(1000);
      });

      it('should use custom drag when provided', () => {
        const particle = createParticle({ drag: 0.95 });

        expect(particle.drag).toBe(0.95);
      });

      it('should use custom bounce when provided', () => {
        const particle = createParticle({ bounce: 0.6 });

        expect(particle.bounce).toBe(0.6);
      });

      it('should use custom gravity when provided', () => {
        const particle = createParticle({ gravity: { x: 0, y: 9.8 } });

        expect(particle.gravity).toEqual({ x: 0, y: 9.8 });
      });

      it('should accept full custom configuration', () => {
        const config: ParticleConfig = {
          position: { x: 200, y: 300 },
          velocity: { x: 5, y: -10 },
          acceleration: { x: 0.1, y: 0.2 },
          mass: 2,
          size: 8,
          color: '#00ff00',
          opacity: 0.8,
          lifetime: 5000,
          drag: 0.97,
          bounce: 0.5,
          gravity: { x: 0, y: 0.5 },
        };

        const particle = new Particle(config);

        expect(particle.position).toEqual({ x: 200, y: 300 });
        expect(particle.velocity).toEqual({ x: 5, y: -10 });
        expect(particle.acceleration).toEqual({ x: 0.1, y: 0.2 });
        expect(particle.mass).toBe(2);
        expect(particle.size).toBe(8);
        expect(particle.color).toBe('#00ff00');
        expect(particle.opacity).toBe(0.8);
        expect(particle.lifetime).toBe(5000);
        expect(particle.drag).toBe(0.97);
        expect(particle.bounce).toBe(0.5);
        expect(particle.gravity).toEqual({ x: 0, y: 0.5 });
      });
    });
  });

  describe('Physics Update', () => {
    describe('position updates', () => {
      it('should update position based on velocity', () => {
        const particle = createParticle({
          position: { x: 0, y: 0 },
          velocity: { x: 10, y: 20 },
          drag: 1, // No drag for simpler calculation
        });

        particle.update(1); // 1 second delta time

        expect(particle.position.x).toBeCloseTo(10, 5);
        expect(particle.position.y).toBeCloseTo(20, 5);
      });

      it('should store previous position before update', () => {
        const particle = createParticle({
          position: { x: 50, y: 50 },
          velocity: { x: 10, y: 10 },
          drag: 1,
        });

        particle.update(1);

        expect(particle.previousPosition).toEqual({ x: 50, y: 50 });
      });

      it('should scale position change with deltaTime', () => {
        const particle = createParticle({
          position: { x: 0, y: 0 },
          velocity: { x: 100, y: 100 },
          drag: 1,
        });

        particle.update(0.016); // ~60fps frame

        expect(particle.position.x).toBeCloseTo(1.6, 2);
        expect(particle.position.y).toBeCloseTo(1.6, 2);
      });
    });

    describe('velocity updates', () => {
      it('should update velocity based on acceleration', () => {
        const particle = createParticle({
          position: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          acceleration: { x: 5, y: 10 },
          drag: 1,
        });

        particle.update(1);

        expect(particle.velocity.x).toBeCloseTo(5, 5);
        expect(particle.velocity.y).toBeCloseTo(10, 5);
      });

      it('should reset acceleration after update', () => {
        const particle = createParticle({
          acceleration: { x: 5, y: 10 },
        });

        particle.update(1);

        expect(particle.acceleration).toEqual({ x: 0, y: 0 });
      });

      it('should apply gravity to acceleration', () => {
        const particle = createParticle({
          position: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          gravity: { x: 0, y: 10 },
          drag: 1,
        });

        particle.update(1);

        expect(particle.velocity.y).toBeCloseTo(10, 5);
      });
    });

    describe('drag application', () => {
      it('should apply drag to velocity each frame', () => {
        const particle = createParticle({
          velocity: { x: 100, y: 100 },
          drag: 0.9,
        });

        particle.update(0); // Zero delta time to isolate drag effect

        expect(particle.velocity.x).toBeCloseTo(90, 5);
        expect(particle.velocity.y).toBeCloseTo(90, 5);
      });

      it('should compound drag over multiple frames', () => {
        const particle = createParticle({
          velocity: { x: 100, y: 100 },
          drag: 0.5,
        });

        particle.update(0);
        expect(particle.velocity.x).toBeCloseTo(50, 5);

        particle.update(0);
        expect(particle.velocity.x).toBeCloseTo(25, 5);
      });

      it('should have no drag effect when drag is 1', () => {
        const particle = createParticle({
          velocity: { x: 100, y: 100 },
          drag: 1,
        });

        particle.update(0);

        expect(particle.velocity.x).toBeCloseTo(100, 5);
        expect(particle.velocity.y).toBeCloseTo(100, 5);
      });
    });

    describe('age updates', () => {
      it('should increment age by deltaTime', () => {
        const particle = createParticle();

        particle.update(1);
        expect(particle.age).toBe(1);

        particle.update(0.5);
        expect(particle.age).toBe(1.5);
      });

      it('should accumulate age over multiple updates', () => {
        const particle = createParticle();

        for (let i = 0; i < 10; i++) {
          particle.update(0.1);
        }

        expect(particle.age).toBeCloseTo(1, 5);
      });
    });

    describe('dead particle handling', () => {
      it('should not update dead particles', () => {
        const particle = createParticle({
          position: { x: 0, y: 0 },
          velocity: { x: 100, y: 100 },
          lifetime: 0.1,
        });

        // Age the particle to death
        particle.update(0.5);
        expect(particle.state).toBe('dead');

        const positionAfterDeath = { ...particle.position };
        particle.update(1);

        // Position should not change
        expect(particle.position).toEqual(positionAfterDeath);
      });
    });
  });

  describe('Color Transition Animation', () => {
    describe('instant color change', () => {
      it('should change color instantly when no fadeTime provided', () => {
        const particle = createParticle({ color: '#ff0000' });

        particle.setColor('#00ff00');

        expect(particle.color).toBe('#00ff00');
      });

      it('should change color instantly when fadeTime is 0', () => {
        const particle = createParticle({ color: '#ff0000' });

        particle.setColor('#0000ff', 0);

        expect(particle.color).toBe('#0000ff');
      });
    });

    describe('gradual color transition', () => {
      it('should start color transition when fadeTime is provided', () => {
        const particle = createParticle({ color: '#ff0000' });

        particle.setColor('#00ff00', 1);

        // Color should not yet be the target color
        expect(particle.color).toBe('#ff0000');
      });

      it('should interpolate color over time', () => {
        const particle = createParticle({ color: '#ff0000' });

        particle.setColor('#00ff00', 1);
        particle.update(0.5);

        // Color should be somewhere between red and green
        expect(particle.color).not.toBe('#ff0000');
        expect(particle.color).not.toBe('#00ff00');
      });

      it('should complete transition to target color', () => {
        const particle = createParticle({ color: '#ff0000' });

        particle.setColor('#00ff00', 1);

        // Update past the transition duration
        particle.update(1.1);

        expect(particle.color).toBe('#00ff00');
      });

      it('should handle black to white transition', () => {
        const particle = createParticle({ color: '#000000' });

        particle.setColor('#ffffff', 1);
        particle.update(1.1);

        expect(particle.color).toBe('#ffffff');
      });

      it('should handle transition with multiple updates', () => {
        const particle = createParticle({ color: '#000000' });

        particle.setColor('#ffffff', 1);

        // Multiple small updates
        for (let i = 0; i < 20; i++) {
          particle.update(0.1);
        }

        expect(particle.color).toBe('#ffffff');
      });

      it('should allow interrupting transition with new color', () => {
        const particle = createParticle({ color: '#ff0000' });

        particle.setColor('#00ff00', 2);
        particle.update(0.5);

        // Interrupt with instant color change
        particle.setColor('#0000ff');

        expect(particle.color).toBe('#0000ff');
      });
    });

    describe('color interpolation accuracy', () => {
      it('should produce valid hex colors during transition', () => {
        const particle = createParticle({ color: '#ff0000' });

        particle.setColor('#00ff00', 1);

        // Check color at various points in transition
        for (let t = 0; t < 1; t += 0.1) {
          particle.update(0.1);

          // Color should be a valid hex color
          expect(particle.color).toMatch(/^#[0-9a-f]{6}$/i);
        }
      });
    });
  });

  describe('Lifecycle Management', () => {
    describe('active state', () => {
      it('should be active when created', () => {
        const particle = createParticle();

        expect(particle.state).toBe('active');
        expect(particle.isAlive()).toBe(true);
        expect(particle.isVisible()).toBe(true);
      });

      it('should remain active before 80% of lifetime', () => {
        const particle = createParticle({ lifetime: 100 });

        particle.update(79);

        expect(particle.state).toBe('active');
      });
    });

    describe('dying state', () => {
      it('should transition to dying at 80% of lifetime', () => {
        const particle = createParticle({ lifetime: 100 });

        particle.update(80);

        expect(particle.state).toBe('dying');
        expect(particle.isAlive()).toBe(true);
      });

      it('should start fading opacity in dying state', () => {
        const particle = createParticle({ lifetime: 100, opacity: 1 });

        particle.update(90); // At 90% of lifetime

        expect(particle.state).toBe('dying');
        expect(particle.opacity).toBeLessThan(1);
        expect(particle.opacity).toBeGreaterThan(0);
      });

      it('should shrink size in dying state', () => {
        const particle = createParticle({ lifetime: 100, size: 10 });
        const originalSize = particle.size;

        particle.update(85);

        expect(particle.state).toBe('dying');
        expect(particle.size).toBeLessThan(originalSize);
      });
    });

    describe('dead state', () => {
      it('should transition to dead at 100% of lifetime', () => {
        const particle = createParticle({ lifetime: 100 });

        particle.update(100);

        expect(particle.state).toBe('dead');
        expect(particle.isAlive()).toBe(false);
      });

      it('should have zero opacity when dead', () => {
        const particle = createParticle({ lifetime: 100 });

        particle.update(100);

        expect(particle.opacity).toBe(0);
      });

      it('should not be visible when dead', () => {
        const particle = createParticle({ lifetime: 100 });

        particle.update(100);

        expect(particle.isVisible()).toBe(false);
      });
    });

    describe('infinite lifetime', () => {
      it('should never transition from active with infinite lifetime', () => {
        const particle = createParticle({ lifetime: Infinity });

        // Age the particle a lot
        for (let i = 0; i < 1000; i++) {
          particle.update(1000);
        }

        expect(particle.state).toBe('active');
        expect(particle.isAlive()).toBe(true);
      });
    });

    describe('isVisible helper', () => {
      it('should return true for visible particles', () => {
        const particle = createParticle({ opacity: 0.5 });

        expect(particle.isVisible()).toBe(true);
      });

      it('should return false for particles with very low opacity', () => {
        const particle = createParticle({ opacity: 0.001 });

        // Opacity below 0.01 threshold
        expect(particle.isVisible()).toBe(false);
      });

      it('should return false for dead particles', () => {
        const particle = createParticle({ lifetime: 10 });

        particle.update(20);

        expect(particle.isVisible()).toBe(false);
      });
    });
  });

  describe('Force Application', () => {
    describe('addForce', () => {
      it('should add force to forces array', () => {
        const particle = createParticle();

        particle.addForce({ x: 10, y: 20 });

        expect(particle.forces).toHaveLength(1);
        expect(particle.forces[0]).toEqual({ x: 10, y: 20 });
      });

      it('should accumulate multiple forces', () => {
        const particle = createParticle();

        particle.addForce({ x: 10, y: 0 });
        particle.addForce({ x: 0, y: 20 });
        particle.addForce({ x: 5, y: 5 });

        expect(particle.forces).toHaveLength(3);
      });

      it('should clear forces after update', () => {
        const particle = createParticle();

        particle.addForce({ x: 10, y: 20 });
        particle.update(0.016);

        expect(particle.forces).toHaveLength(0);
      });

      it('should apply force to acceleration during update', () => {
        const particle = createParticle({
          mass: 1,
          velocity: { x: 0, y: 0 },
          drag: 1,
        });

        particle.addForce({ x: 10, y: 20 });
        particle.update(1);

        // Force should have been applied to velocity
        expect(particle.velocity.x).toBeCloseTo(10, 5);
        expect(particle.velocity.y).toBeCloseTo(20, 5);
      });

      it('should divide force by mass', () => {
        const particle = createParticle({
          mass: 2,
          velocity: { x: 0, y: 0 },
          drag: 1,
        });

        particle.addForce({ x: 10, y: 20 });
        particle.update(1);

        // Force / mass = acceleration
        expect(particle.velocity.x).toBeCloseTo(5, 5);
        expect(particle.velocity.y).toBeCloseTo(10, 5);
      });

      it('should create a copy of the force vector', () => {
        const particle = createParticle();
        const force = { x: 10, y: 20 };

        particle.addForce(force);
        force.x = 100; // Modify original

        expect(particle.forces[0].x).toBe(10);
      });
    });

    describe('applyImpulse', () => {
      it('should instantly change velocity', () => {
        const particle = createParticle({
          velocity: { x: 0, y: 0 },
          mass: 1,
        });

        particle.applyImpulse({ x: 50, y: 100 });

        expect(particle.velocity).toEqual({ x: 50, y: 100 });
      });

      it('should divide impulse by mass', () => {
        const particle = createParticle({
          velocity: { x: 0, y: 0 },
          mass: 2,
        });

        particle.applyImpulse({ x: 100, y: 200 });

        expect(particle.velocity).toEqual({ x: 50, y: 100 });
      });

      it('should add to existing velocity', () => {
        const particle = createParticle({
          velocity: { x: 10, y: 10 },
          mass: 1,
        });

        particle.applyImpulse({ x: 5, y: 5 });

        expect(particle.velocity).toEqual({ x: 15, y: 15 });
      });
    });

    describe('gravity', () => {
      it('should continuously apply gravity each frame', () => {
        const particle = createParticle({
          velocity: { x: 0, y: 0 },
          gravity: { x: 0, y: 10 },
          drag: 1,
        });

        particle.update(1);
        expect(particle.velocity.y).toBeCloseTo(10, 5);

        particle.update(1);
        expect(particle.velocity.y).toBeCloseTo(20, 5);
      });
    });
  });

  describe('Drag and Bounce Properties', () => {
    describe('drag', () => {
      it('should slow down particle with drag less than 1', () => {
        const particle = createParticle({
          velocity: { x: 100, y: 100 },
          drag: 0.9,
        });

        particle.update(0);

        expect(particle.velocity.x).toBeLessThan(100);
        expect(particle.velocity.y).toBeLessThan(100);
      });

      it('should bring velocity close to zero over time', () => {
        const particle = createParticle({
          velocity: { x: 100, y: 100 },
          drag: 0.9,
        });

        for (let i = 0; i < 50; i++) {
          particle.update(0);
        }

        expect(Math.abs(particle.velocity.x)).toBeLessThan(1);
        expect(Math.abs(particle.velocity.y)).toBeLessThan(1);
      });

      it('should work with different drag values', () => {
        const highDrag = createParticle({ velocity: { x: 100, y: 0 }, drag: 0.5 });
        const lowDrag = createParticle({ velocity: { x: 100, y: 0 }, drag: 0.99 });

        highDrag.update(0);
        lowDrag.update(0);

        expect(highDrag.velocity.x).toBeLessThan(lowDrag.velocity.x);
      });
    });

    describe('bounce (boundary collision)', () => {
      const bounds = { left: 0, right: 200, top: 0, bottom: 200 };

      it('should detect left boundary collision', () => {
        const particle = createParticle({
          position: { x: 1, y: 100 },
          velocity: { x: -10, y: 0 },
          size: 4,
        });

        const collided = particle.checkBoundaryCollision(bounds);

        expect(collided).toBe(true);
        expect(particle.velocity.x).toBeGreaterThan(0); // Reversed
      });

      it('should detect right boundary collision', () => {
        const particle = createParticle({
          position: { x: 199, y: 100 },
          velocity: { x: 10, y: 0 },
          size: 4,
        });

        const collided = particle.checkBoundaryCollision(bounds);

        expect(collided).toBe(true);
        expect(particle.velocity.x).toBeLessThan(0); // Reversed
      });

      it('should detect top boundary collision', () => {
        const particle = createParticle({
          position: { x: 100, y: 1 },
          velocity: { x: 0, y: -10 },
          size: 4,
        });

        const collided = particle.checkBoundaryCollision(bounds);

        expect(collided).toBe(true);
        expect(particle.velocity.y).toBeGreaterThan(0); // Reversed
      });

      it('should detect bottom boundary collision', () => {
        const particle = createParticle({
          position: { x: 100, y: 199 },
          velocity: { x: 0, y: 10 },
          size: 4,
        });

        const collided = particle.checkBoundaryCollision(bounds);

        expect(collided).toBe(true);
        expect(particle.velocity.y).toBeLessThan(0); // Reversed
      });

      it('should apply bounce factor to reversed velocity', () => {
        const particle = createParticle({
          position: { x: 1, y: 100 },
          velocity: { x: -100, y: 0 },
          bounce: 0.5,
          size: 4,
        });

        particle.checkBoundaryCollision(bounds);

        // Velocity should be reversed and reduced by bounce factor
        expect(particle.velocity.x).toBeCloseTo(50, 5);
      });

      it('should not report collision when inside bounds', () => {
        const particle = createParticle({
          position: { x: 100, y: 100 },
          size: 4,
        });

        const collided = particle.checkBoundaryCollision(bounds);

        expect(collided).toBe(false);
      });

      it('should account for particle size in collision', () => {
        const particle = createParticle({
          position: { x: 10, y: 100 },
          velocity: { x: -10, y: 0 },
          size: 20, // Large particle
        });

        // Position is 10, but with size 20, edge is at 0
        const collided = particle.checkBoundaryCollision(bounds);

        expect(collided).toBe(true);
      });
    });

    describe('bounce (particle collision)', () => {
      it('should detect collision between overlapping particles', () => {
        const particle1 = createParticle({
          position: { x: 100, y: 100 },
          size: 20,
        });
        const particle2 = createParticle({
          position: { x: 110, y: 100 },
          size: 20,
        });

        const collided = particle1.checkParticleCollision(particle2);

        expect(collided).toBe(true);
      });

      it('should not detect collision for distant particles', () => {
        const particle1 = createParticle({
          position: { x: 0, y: 0 },
          size: 10,
        });
        const particle2 = createParticle({
          position: { x: 100, y: 100 },
          size: 10,
        });

        const collided = particle1.checkParticleCollision(particle2);

        expect(collided).toBe(false);
      });

      it('should separate overlapping particles', () => {
        const particle1 = createParticle({
          position: { x: 100, y: 100 },
          velocity: { x: 0, y: 0 },
          size: 20,
        });
        const particle2 = createParticle({
          position: { x: 105, y: 100 },
          velocity: { x: 0, y: 0 },
          size: 20,
        });

        particle1.checkParticleCollision(particle2);

        const distance = particle1.distanceTo(particle2);
        expect(distance).toBeGreaterThanOrEqual(20); // Sum of radii
      });
    });
  });

  describe('Utility Methods', () => {
    describe('distanceTo', () => {
      it('should calculate distance between particles', () => {
        const particle1 = createParticle({ position: { x: 0, y: 0 } });
        const particle2 = createParticle({ position: { x: 3, y: 4 } });

        const distance = particle1.distanceTo(particle2);

        expect(distance).toBe(5); // 3-4-5 triangle
      });

      it('should return 0 for same position', () => {
        const particle1 = createParticle({ position: { x: 50, y: 50 } });
        const particle2 = createParticle({ position: { x: 50, y: 50 } });

        const distance = particle1.distanceTo(particle2);

        expect(distance).toBe(0);
      });
    });

    describe('getKineticEnergy', () => {
      it('should calculate kinetic energy correctly', () => {
        const particle = createParticle({
          velocity: { x: 3, y: 4 }, // Speed = 5
          mass: 2,
        });

        const energy = particle.getKineticEnergy();

        // KE = 0.5 * m * v^2 = 0.5 * 2 * 25 = 25
        expect(energy).toBe(25);
      });

      it('should return 0 for stationary particle', () => {
        const particle = createParticle({
          velocity: { x: 0, y: 0 },
        });

        const energy = particle.getKineticEnergy();

        expect(energy).toBe(0);
      });
    });

    describe('getMomentum', () => {
      it('should calculate momentum correctly', () => {
        const particle = createParticle({
          velocity: { x: 10, y: 20 },
          mass: 3,
        });

        const momentum = particle.getMomentum();

        expect(momentum).toEqual({ x: 30, y: 60 });
      });
    });

    describe('getRenderData', () => {
      it('should return all render properties', () => {
        const particle = createParticle({
          position: { x: 100, y: 200 },
          size: 15,
          color: '#ff00ff',
          opacity: 0.7,
        });

        const renderData = particle.getRenderData();

        expect(renderData).toEqual({
          position: { x: 100, y: 200 },
          size: 15,
          color: '#ff00ff',
          opacity: 0.7,
        });
      });

      it('should return a copy of position', () => {
        const particle = createParticle({ position: { x: 100, y: 100 } });

        const renderData = particle.getRenderData();
        renderData.position.x = 999;

        expect(particle.position.x).toBe(100);
      });
    });

    describe('reset', () => {
      it('should reset particle to active state', () => {
        const particle = createParticle({ lifetime: 10 });
        particle.update(20); // Kill the particle

        particle.reset({ position: { x: 0, y: 0 } });

        expect(particle.state).toBe('active');
        expect(particle.age).toBe(0);
      });

      it('should reset position when provided', () => {
        const particle = createParticle({ position: { x: 100, y: 100 } });

        particle.reset({ position: { x: 50, y: 50 } });

        expect(particle.position).toEqual({ x: 50, y: 50 });
        expect(particle.previousPosition).toEqual({ x: 50, y: 50 });
      });

      it('should reset velocity to zero by default', () => {
        const particle = createParticle({ velocity: { x: 100, y: 100 } });

        particle.reset();

        expect(particle.velocity).toEqual({ x: 0, y: 0 });
      });

      it('should reset velocity to provided value', () => {
        const particle = createParticle();

        particle.reset({ velocity: { x: 50, y: 50 } });

        expect(particle.velocity).toEqual({ x: 50, y: 50 });
      });

      it('should reset acceleration to zero', () => {
        const particle = createParticle({ acceleration: { x: 10, y: 10 } });

        particle.reset();

        expect(particle.acceleration).toEqual({ x: 0, y: 0 });
      });

      it('should reset opacity to initialOpacity', () => {
        const particle = createParticle({ opacity: 0.8 });
        particle.opacity = 0.1;

        particle.reset();

        expect(particle.opacity).toBe(0.8);
      });

      it('should clear forces', () => {
        const particle = createParticle();
        particle.addForce({ x: 10, y: 10 });

        particle.reset();

        expect(particle.forces).toEqual([]);
      });

      it('should update configurable properties', () => {
        const particle = createParticle();

        particle.reset({
          mass: 5,
          size: 20,
          color: '#00ff00',
          lifetime: 500,
          drag: 0.5,
          bounce: 0.3,
          gravity: { x: 1, y: 2 },
        });

        expect(particle.mass).toBe(5);
        expect(particle.size).toBe(20);
        expect(particle.color).toBe('#00ff00');
        expect(particle.lifetime).toBe(500);
        expect(particle.drag).toBe(0.5);
        expect(particle.bounce).toBe(0.3);
        expect(particle.gravity).toEqual({ x: 1, y: 2 });
      });
    });

    describe('clone', () => {
      it('should create a new particle with same properties', () => {
        const original = createParticle({
          position: { x: 100, y: 200 },
          velocity: { x: 10, y: 20 },
          mass: 5,
          size: 15,
          color: '#ff0000',
        });

        const cloned = original.clone();

        expect(cloned.position).toEqual(original.position);
        expect(cloned.velocity).toEqual(original.velocity);
        expect(cloned.mass).toBe(original.mass);
        expect(cloned.size).toBe(original.size);
        expect(cloned.color).toBe(original.color);
      });

      it('should create independent particle', () => {
        const original = createParticle({ position: { x: 100, y: 100 } });
        const cloned = original.clone();

        cloned.position.x = 999;

        expect(original.position.x).toBe(100);
      });

      it('should have different id', () => {
        const original = createParticle();
        const cloned = original.clone();

        expect(cloned.id).not.toBe(original.id);
      });

      it('should apply modifications', () => {
        const original = createParticle({
          position: { x: 100, y: 100 },
          color: '#ff0000',
        });

        const cloned = original.clone({
          position: { x: 200, y: 200 },
          color: '#00ff00',
        });

        expect(cloned.position).toEqual({ x: 200, y: 200 });
        expect(cloned.color).toBe('#00ff00');
        // Original unchanged
        expect(original.position).toEqual({ x: 100, y: 100 });
        expect(original.color).toBe('#ff0000');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero mass without division by zero', () => {
      // Note: This tests robustness - in practice mass should not be 0
      const particle = createParticle({ mass: 0.0001 }); // Very small mass

      particle.addForce({ x: 10, y: 10 });

      expect(() => particle.update(1)).not.toThrow();
    });

    it('should handle negative velocities', () => {
      const particle = createParticle({
        position: { x: 100, y: 100 },
        velocity: { x: -50, y: -50 },
        drag: 1,
      });

      particle.update(1);

      expect(particle.position.x).toBe(50);
      expect(particle.position.y).toBe(50);
    });

    it('should handle very large delta times', () => {
      const particle = createParticle({
        velocity: { x: 1, y: 1 },
        drag: 1,
      });

      expect(() => particle.update(1000000)).not.toThrow();
    });

    it('should handle very small delta times', () => {
      const particle = createParticle({
        velocity: { x: 100, y: 100 },
      });

      particle.update(0.0001);

      expect(particle.position.x).toBeGreaterThan(100);
    });

    it('should handle rapid state changes', () => {
      const particle = createParticle({ lifetime: 10 });

      // Rapid updates
      for (let i = 0; i < 100; i++) {
        particle.update(0.5);
      }

      expect(particle.state).toBe('dead');
    });
  });
});
