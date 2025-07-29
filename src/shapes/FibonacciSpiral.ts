// src/shapes/FibonacciSpiral.ts - Fibonacci spiral generation with golden ratio

import { Vector2D } from '../types';
import { GOLDEN_RATIO, PI, TWO_PI } from '../utils/constants';

/**
 * Fibonacci spiral implementation with mathematical precision
 */
export class FibonacciSpiral {
  /**
   * Generate Fibonacci sequence up to n terms
   */
  static generateFibonacciSequence(n: number): number[] {
    if (n <= 0) return [];
    if (n === 1) return [1];
    if (n === 2) return [1, 1];

    const sequence = [1, 1];
    for (let i = 2; i < n; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence;
  }

  /**
   * Generate Fibonacci spiral using quarter circles method
   */
  static generateQuarterCircles(
    center: Vector2D,
    initialSize: number,
    terms: number = 10
  ): Array<{
    center: Vector2D;
    radius: number;
    startAngle: number;
    endAngle: number;
    fibNumber: number;
    quarterIndex: number;
  }> {
    const fibonacci = this.generateFibonacciSequence(terms);
    const quarters: Array<{
      center: Vector2D;
      radius: number;
      startAngle: number;
      endAngle: number;
      fibNumber: number;
      quarterIndex: number;
    }> = [];

    let currentX = center.x;
    let currentY = center.y;
    let direction = 0; // 0: right, 1: up, 2: left, 3: down

    for (let i = 1; i < fibonacci.length; i++) {
      const radius = fibonacci[i] * initialSize;
      const startAngle = direction * PI / 2;
      const endAngle = startAngle + PI / 2;

      // Calculate quarter circle center based on direction
      let quarterCenterX = currentX;
      let quarterCenterY = currentY;

      switch (direction) {
        case 0: // right
          quarterCenterX = currentX;
          quarterCenterY = currentY - radius;
          currentX += radius;
          break;
        case 1: // up
          quarterCenterX = currentX + radius;
          quarterCenterY = currentY;
          currentY += radius;
          break;
        case 2: // left
          quarterCenterX = currentX;
          quarterCenterY = currentY + radius;
          currentX -= radius;
          break;
        case 3: // down
          quarterCenterX = currentX - radius;
          quarterCenterY = currentY;
          currentY -= radius;
          break;
      }

      quarters.push({
        center: { x: quarterCenterX, y: quarterCenterY },
        radius,
        startAngle,
        endAngle,
        fibNumber: fibonacci[i],
        quarterIndex: i
      });

      direction = (direction + 1) % 4;
    }

    return quarters;
  }

  /**
   * Generate golden spiral using continuous curve
   */
  static generateGoldenSpiral(
    center: Vector2D,
    initialRadius: number,
    turns: number = 3,
    pointsPerTurn: number = 100
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const totalPoints = turns * pointsPerTurn;
    const growthFactor = Math.pow(GOLDEN_RATIO, 1 / (pointsPerTurn / 4));

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / pointsPerTurn) * TWO_PI;
      const radius = initialRadius * Math.pow(growthFactor, i);
      
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      
      points.push({ x, y });
    }

    return points;
  }

  /**
   * Generate Archimedean spiral (constant spacing)
   */
  static generateArchimedeanSpiral(
    center: Vector2D,
    spacing: number,
    turns: number = 3,
    pointsPerTurn: number = 100
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const totalPoints = turns * pointsPerTurn;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / pointsPerTurn) * TWO_PI;
      const radius = spacing * angle / TWO_PI;
      
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      
      points.push({ x, y });
    }

    return points;
  }

  /**
   * Generate logarithmic spiral with custom growth rate
   */
  static generateLogarithmicSpiral(
    center: Vector2D,
    initialRadius: number,
    growthRate: number,
    turns: number = 3,
    pointsPerTurn: number = 100
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const totalPoints = turns * pointsPerTurn;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / pointsPerTurn) * TWO_PI;
      const radius = initialRadius * Math.exp(growthRate * angle);
      
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      
      points.push({ x, y });
    }

    return points;
  }

  /**
   * Generate multiple spiral arms
   */
  static generateMultiArmSpiral(
    center: Vector2D,
    initialRadius: number,
    arms: number = 2,
    turns: number = 3,
    pointsPerTurn: number = 100
  ): Vector2D[][] {
    const spirals: Vector2D[][] = [];
    const armOffset = TWO_PI / arms;

    for (let arm = 0; arm < arms; arm++) {
      const points: Vector2D[] = [];
      const totalPoints = turns * pointsPerTurn;
      const growthFactor = Math.pow(GOLDEN_RATIO, 1 / (pointsPerTurn / 4));

      for (let i = 0; i <= totalPoints; i++) {
        const angle = (i / pointsPerTurn) * TWO_PI + (arm * armOffset);
        const radius = initialRadius * Math.pow(growthFactor, i);
        
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        
        points.push({ x, y });
      }

      spirals.push(points);
    }

    return spirals;
  }

  /**
   * Calculate spiral properties at given angle
   */
  static getSpiralProperties(
    angle: number,
    initialRadius: number,
    spiralType: 'golden' | 'archimedean' | 'logarithmic' = 'golden',
    growthRate: number = GOLDEN_RATIO
  ): {
    radius: number;
    tangentAngle: number;
    curvature: number;
  } {
    let radius: number;
    let tangentAngle: number;
    let curvature: number;

    switch (spiralType) {
      case 'golden':
        radius = initialRadius * Math.pow(GOLDEN_RATIO, angle / (PI / 2));
        tangentAngle = angle + Math.atan(1 / Math.log(GOLDEN_RATIO));
        curvature = 1 / (radius * Math.sqrt(1 + Math.pow(Math.log(GOLDEN_RATIO), 2)));
        break;
      
      case 'archimedean':
        radius = initialRadius * angle / TWO_PI;
        tangentAngle = angle + Math.atan(radius / initialRadius);
        curvature = 2 * initialRadius / Math.pow(radius * radius + initialRadius * initialRadius, 1.5);
        break;
      
      case 'logarithmic':
        radius = initialRadius * Math.exp(growthRate * angle);
        tangentAngle = angle + Math.atan(1 / growthRate);
        curvature = growthRate / (radius * Math.sqrt(1 + growthRate * growthRate));
        break;
      
      default:
        radius = initialRadius;
        tangentAngle = angle;
        curvature = 0;
    }

    return { radius, tangentAngle, curvature };
  }
}

/**
 * Spiral animation utilities
 */
export class SpiralAnimator {
  /**
   * Animate spiral growth
   */
  static animateGrowth(
    spiral: Vector2D[],
    progress: number // 0 to 1
  ): Vector2D[] {
    const visiblePoints = Math.floor(spiral.length * progress);
    return spiral.slice(0, visiblePoints);
  }

  /**
   * Animate spiral rotation
   */
  static animateRotation(
    spiral: Vector2D[],
    center: Vector2D,
    rotationAngle: number
  ): Vector2D[] {
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);

    return spiral.map(point => {
      const dx = point.x - center.x;
      const dy = point.y - center.y;
      
      return {
        x: center.x + dx * cos - dy * sin,
        y: center.y + dx * sin + dy * cos
      };
    });
  }

  /**
   * Animate spiral scaling
   */
  static animateScale(
    spiral: Vector2D[],
    center: Vector2D,
    scale: number
  ): Vector2D[] {
    return spiral.map(point => ({
      x: center.x + (point.x - center.x) * scale,
      y: center.y + (point.y - center.y) * scale
    }));
  }
}