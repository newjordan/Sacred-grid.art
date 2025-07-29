// src/math/SpiralMath.ts - Advanced spiral mathematics and calculations

import { Vector2D } from '../types';
import { GOLDEN_RATIO, PI, TWO_PI } from '../utils/constants';

/**
 * Mathematical utilities for spiral calculations
 */
export class SpiralMath {
  /**
   * Calculate polar coordinates from cartesian
   */
  static cartesianToPolar(point: Vector2D, center: Vector2D): {
    radius: number;
    angle: number;
  } {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    
    return {
      radius: Math.sqrt(dx * dx + dy * dy),
      angle: Math.atan2(dy, dx)
    };
  }

  /**
   * Calculate cartesian coordinates from polar
   */
  static polarToCartesian(
    center: Vector2D,
    radius: number,
    angle: number
  ): Vector2D {
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    };
  }

  /**
   * Calculate logarithmic spiral radius at given angle
   */
  static logarithmicSpiralRadius(
    initialRadius: number,
    growthRate: number,
    angle: number
  ): number {
    return initialRadius * Math.exp(growthRate * angle);
  }

  /**
   * Calculate Archimedean spiral radius at given angle
   */
  static archimedeanSpiralRadius(
    spacing: number,
    angle: number
  ): number {
    return spacing * angle / TWO_PI;
  }

  /**
   * Calculate golden spiral radius at given angle
   */
  static goldenSpiralRadius(
    initialRadius: number,
    angle: number
  ): number {
    const quarterTurns = angle / (PI / 2);
    return initialRadius * Math.pow(GOLDEN_RATIO, quarterTurns);
  }

  /**
   * Calculate spiral arc length
   */
  static calculateArcLength(
    spiralType: 'logarithmic' | 'archimedean' | 'golden',
    initialRadius: number,
    startAngle: number,
    endAngle: number,
    growthRate: number = GOLDEN_RATIO,
    steps: number = 1000
  ): number {
    let totalLength = 0;
    const angleStep = (endAngle - startAngle) / steps;
    
    let prevPoint: Vector2D | null = null;
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + i * angleStep;
      let radius: number;
      
      switch (spiralType) {
        case 'logarithmic':
          radius = this.logarithmicSpiralRadius(initialRadius, Math.log(growthRate), angle);
          break;
        case 'archimedean':
          radius = this.archimedeanSpiralRadius(initialRadius, angle);
          break;
        case 'golden':
          radius = this.goldenSpiralRadius(initialRadius, angle);
          break;
      }
      
      const currentPoint = this.polarToCartesian({ x: 0, y: 0 }, radius, angle);
      
      if (prevPoint) {
        const dx = currentPoint.x - prevPoint.x;
        const dy = currentPoint.y - prevPoint.y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }
      
      prevPoint = currentPoint;
    }
    
    return totalLength;
  }

  /**
   * Calculate spiral curvature at given point
   */
  static calculateCurvature(
    spiralType: 'logarithmic' | 'archimedean' | 'golden',
    radius: number,
    angle: number,
    growthRate: number = GOLDEN_RATIO
  ): number {
    switch (spiralType) {
      case 'logarithmic':
        const k = Math.log(growthRate);
        return k / (radius * Math.sqrt(1 + k * k));
      
      case 'archimedean':
        const a = radius / angle;
        return 2 * a / Math.pow(radius * radius + a * a, 1.5);
      
      case 'golden':
        const goldenK = Math.log(GOLDEN_RATIO);
        return goldenK / (radius * Math.sqrt(1 + goldenK * goldenK));
      
      default:
        return 0;
    }
  }

  /**
   * Calculate tangent angle at spiral point
   */
  static calculateTangentAngle(
    spiralType: 'logarithmic' | 'archimedean' | 'golden',
    angle: number,
    growthRate: number = GOLDEN_RATIO
  ): number {
    switch (spiralType) {
      case 'logarithmic':
        return angle + Math.atan(1 / Math.log(growthRate));
      
      case 'archimedean':
        return angle + Math.atan(angle);
      
      case 'golden':
        return angle + Math.atan(1 / Math.log(GOLDEN_RATIO));
      
      default:
        return angle;
    }
  }

  /**
   * Generate spiral with variable density
   */
  static generateVariableDensitySpiral(
    center: Vector2D,
    initialRadius: number,
    spiralType: 'logarithmic' | 'archimedean' | 'golden',
    turns: number,
    densityFunction: (angle: number) => number, // Returns points per unit angle
    growthRate: number = GOLDEN_RATIO
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const maxAngle = turns * TWO_PI;
    let currentAngle = 0;
    
    while (currentAngle <= maxAngle) {
      let radius: number;
      
      switch (spiralType) {
        case 'logarithmic':
          radius = this.logarithmicSpiralRadius(initialRadius, Math.log(growthRate), currentAngle);
          break;
        case 'archimedean':
          radius = this.archimedeanSpiralRadius(initialRadius, currentAngle);
          break;
        case 'golden':
          radius = this.goldenSpiralRadius(initialRadius, currentAngle);
          break;
      }
      
      const point = this.polarToCartesian(center, radius, currentAngle);
      points.push(point);
      
      // Calculate next angle step based on density function
      const density = densityFunction(currentAngle);
      const angleStep = 1 / Math.max(density, 0.1); // Prevent division by zero
      currentAngle += angleStep;
    }
    
    return points;
  }

  /**
   * Generate spiral with adaptive resolution
   */
  static generateAdaptiveSpiral(
    center: Vector2D,
    initialRadius: number,
    spiralType: 'logarithmic' | 'archimedean' | 'golden',
    turns: number,
    maxCurvature: number = 0.1,
    growthRate: number = GOLDEN_RATIO
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const maxAngle = turns * TWO_PI;
    let currentAngle = 0;
    let angleStep = 0.1; // Initial step
    
    while (currentAngle <= maxAngle) {
      let radius: number;
      
      switch (spiralType) {
        case 'logarithmic':
          radius = this.logarithmicSpiralRadius(initialRadius, Math.log(growthRate), currentAngle);
          break;
        case 'archimedean':
          radius = this.archimedeanSpiralRadius(initialRadius, currentAngle);
          break;
        case 'golden':
          radius = this.goldenSpiralRadius(initialRadius, currentAngle);
          break;
      }
      
      const point = this.polarToCartesian(center, radius, currentAngle);
      points.push(point);
      
      // Adapt step size based on curvature
      const curvature = this.calculateCurvature(spiralType, radius, currentAngle, growthRate);
      angleStep = Math.min(0.5, maxCurvature / Math.max(curvature, 0.001));
      angleStep = Math.max(0.01, angleStep); // Minimum step size
      
      currentAngle += angleStep;
    }
    
    return points;
  }

  /**
   * Calculate spiral intersection points
   */
  static findSpiralIntersections(
    spiral1: Vector2D[],
    spiral2: Vector2D[],
    tolerance: number = 1.0
  ): Vector2D[] {
    const intersections: Vector2D[] = [];
    
    for (const point1 of spiral1) {
      for (const point2 of spiral2) {
        const distance = Math.sqrt(
          Math.pow(point1.x - point2.x, 2) + 
          Math.pow(point1.y - point2.y, 2)
        );
        
        if (distance <= tolerance) {
          // Average the intersection point
          intersections.push({
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2
          });
        }
      }
    }
    
    return intersections;
  }

  /**
   * Generate spiral envelope (outer boundary)
   */
  static generateSpiralEnvelope(
    spiral: Vector2D[],
    envelopeWidth: number
  ): {
    outerEnvelope: Vector2D[];
    innerEnvelope: Vector2D[];
  } {
    const outerEnvelope: Vector2D[] = [];
    const innerEnvelope: Vector2D[] = [];
    
    for (let i = 1; i < spiral.length - 1; i++) {
      const prev = spiral[i - 1];
      const current = spiral[i];
      const next = spiral[i + 1];
      
      // Calculate tangent direction
      const tangentX = next.x - prev.x;
      const tangentY = next.y - prev.y;
      const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
      
      if (tangentLength > 0) {
        // Normalize tangent
        const normalizedTangentX = tangentX / tangentLength;
        const normalizedTangentY = tangentY / tangentLength;
        
        // Calculate normal (perpendicular to tangent)
        const normalX = -normalizedTangentY;
        const normalY = normalizedTangentX;
        
        // Generate envelope points
        outerEnvelope.push({
          x: current.x + normalX * envelopeWidth,
          y: current.y + normalY * envelopeWidth
        });
        
        innerEnvelope.push({
          x: current.x - normalX * envelopeWidth,
          y: current.y - normalY * envelopeWidth
        });
      }
    }
    
    return { outerEnvelope, innerEnvelope };
  }

  /**
   * Calculate spiral center of mass
   */
  static calculateCenterOfMass(spiral: Vector2D[]): Vector2D {
    if (spiral.length === 0) return { x: 0, y: 0 };
    
    let totalX = 0;
    let totalY = 0;
    
    for (const point of spiral) {
      totalX += point.x;
      totalY += point.y;
    }
    
    return {
      x: totalX / spiral.length,
      y: totalY / spiral.length
    };
  }

  /**
   * Generate spiral with noise/perturbation
   */
  static addNoiseToSpiral(
    spiral: Vector2D[],
    noiseAmplitude: number,
    noiseFrequency: number = 1,
    seed: number = 0
  ): Vector2D[] {
    return spiral.map((point, index) => {
      // Simple pseudo-random noise based on index and seed
      const noise1 = Math.sin(index * noiseFrequency + seed) * noiseAmplitude;
      const noise2 = Math.cos(index * noiseFrequency + seed + PI) * noiseAmplitude;
      
      return {
        x: point.x + noise1,
        y: point.y + noise2
      };
    });
  }
}

/**
 * Specialized spiral generators
 */
export class SpecializedSpirals {
  /**
   * Generate Ulam spiral (prime number spiral)
   */
  static generateUlamSpiral(
    center: Vector2D,
    gridSize: number,
    cellSize: number
  ): {
    points: Vector2D[];
    primePoints: Vector2D[];
    numbers: number[];
  } {
    const points: Vector2D[] = [];
    const primePoints: Vector2D[] = [];
    const numbers: number[] = [];
    
    let x = 0, y = 0;
    let dx = 0, dy = -1;
    let number = 1;
    
    const isPrime = (n: number): boolean => {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    };
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      const worldX = center.x + x * cellSize;
      const worldY = center.y + y * cellSize;
      
      points.push({ x: worldX, y: worldY });
      numbers.push(number);
      
      if (isPrime(number)) {
        primePoints.push({ x: worldX, y: worldY });
      }
      
      // Spiral movement logic
      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
        [dx, dy] = [-dy, dx]; // Turn left
      }
      
      x += dx;
      y += dy;
      number++;
    }
    
    return { points, primePoints, numbers };
  }

  /**
   * Generate Fermat's spiral (parabolic spiral)
   */
  static generateFermatSpiral(
    center: Vector2D,
    turns: number,
    pointsPerTurn: number = 100
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const totalPoints = turns * pointsPerTurn;
    
    for (let i = 0; i <= totalPoints; i++) {
      const angle = i * Math.sqrt(TWO_PI / pointsPerTurn);
      const radius = Math.sqrt(i) * 2;
      
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      
      points.push({ x, y });
    }
    
    return points;
  }

  /**
   * Generate hyperbolic spiral
   */
  static generateHyperbolicSpiral(
    center: Vector2D,
    parameter: number,
    turns: number,
    pointsPerTurn: number = 100
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const totalPoints = turns * pointsPerTurn;
    
    for (let i = 1; i <= totalPoints; i++) {
      const angle = (i / pointsPerTurn) * TWO_PI;
      const radius = parameter / angle;
      
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      
      points.push({ x, y });
    }
    
    return points;
  }
}