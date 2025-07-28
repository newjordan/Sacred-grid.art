// src/math/GoldenRatio.ts - Golden ratio calculations and Fibonacci sequences

import { GOLDEN_RATIO, PHI } from '../utils/constants';
import { Vector2D } from '../types';

/**
 * Golden Ratio mathematical utilities
 */
export class GoldenRatio {
  static readonly PHI = PHI;
  static readonly INVERSE_PHI = 1 / PHI;
  static readonly PHI_SQUARED = PHI * PHI;

  /**
   * Generate Fibonacci sequence up to n terms
   */
  static fibonacciSequence(n: number): number[] {
    if (n <= 0) return [];
    if (n === 1) return [0];
    if (n === 2) return [0, 1];

    const sequence = [0, 1];
    for (let i = 2; i < n; i++) {
      sequence[i] = sequence[i - 1] + sequence[i - 2];
    }
    return sequence;
  }

  /**
   * Get nth Fibonacci number using Binet's formula
   */
  static fibonacciNumber(n: number): number {
    if (n < 0) return 0;
    return Math.round((Math.pow(PHI, n) - Math.pow(-PHI, -n)) / Math.sqrt(5));
  }

  /**
   * Calculate golden ratio rectangles
   */
  static goldenRectangle(width: number): { width: number; height: number } {
    return {
      width,
      height: width / PHI
    };
  }

  /**
   * Generate golden spiral points
   */
  static goldenSpiral(
    center: Vector2D,
    initialRadius: number,
    turns: number,
    pointsPerTurn: number = 100
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const totalPoints = turns * pointsPerTurn;
    const angleStep = (2 * Math.PI) / pointsPerTurn;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = i * angleStep;
      const radius = initialRadius * Math.pow(PHI, angle / (2 * Math.PI));
      
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }

    return points;
  }

  /**
   * Generate logarithmic spiral (more general than golden spiral)
   */
  static logarithmicSpiral(
    center: Vector2D,
    initialRadius: number,
    growthFactor: number,
    turns: number,
    pointsPerTurn: number = 100
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const totalPoints = turns * pointsPerTurn;
    const angleStep = (2 * Math.PI) / pointsPerTurn;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = i * angleStep;
      const radius = initialRadius * Math.pow(growthFactor, angle / (2 * Math.PI));
      
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }

    return points;
  }

  /**
   * Generate Fibonacci spiral using quarter circles
   */
  static fibonacciQuarterCircles(
    center: Vector2D,
    initialSize: number,
    terms: number
  ): Array<{ center: Vector2D; radius: number; startAngle: number; endAngle: number }> {
    const fibonacci = this.fibonacciSequence(terms);
    const circles: Array<{ center: Vector2D; radius: number; startAngle: number; endAngle: number }> = [];
    
    let currentX = center.x;
    let currentY = center.y;
    let direction = 0; // 0: right, 1: up, 2: left, 3: down

    for (let i = 2; i < fibonacci.length; i++) {
      const radius = fibonacci[i] * initialSize;
      const startAngle = direction * Math.PI / 2;
      const endAngle = startAngle + Math.PI / 2;

      circles.push({
        center: { x: currentX, y: currentY },
        radius,
        startAngle,
        endAngle
      });

      // Update position for next circle
      switch (direction) {
        case 0: // right
          currentX += radius;
          currentY -= radius;
          break;
        case 1: // up
          currentX -= radius;
          currentY -= radius;
          break;
        case 2: // left
          currentX -= radius;
          currentY += radius;
          break;
        case 3: // down
          currentX += radius;
          currentY += radius;
          break;
      }

      direction = (direction + 1) % 4;
    }

    return circles;
  }

  /**
   * Calculate golden angle (137.5°)
   */
  static get goldenAngle(): number {
    return (3 - Math.sqrt(5)) * Math.PI; // ≈ 137.5° in radians
  }

  /**
   * Generate points arranged in golden angle pattern (like sunflower seeds)
   */
  static goldenAnglePattern(
    center: Vector2D,
    count: number,
    radiusMultiplier: number = 1
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const goldenAngle = this.goldenAngle;

    for (let i = 0; i < count; i++) {
      const angle = i * goldenAngle;
      const radius = Math.sqrt(i) * radiusMultiplier;
      
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }

    return points;
  }

  /**
   * Check if a ratio is close to the golden ratio
   */
  static isGoldenRatio(ratio: number, tolerance: number = 0.01): boolean {
    return Math.abs(ratio - PHI) < tolerance;
  }

  /**
   * Find the closest Fibonacci number to a given value
   */
  static closestFibonacci(value: number): number {
    if (value <= 0) return 0;
    if (value === 1) return 1;

    let prev = 0;
    let curr = 1;
    
    while (curr < value) {
      const next = prev + curr;
      prev = curr;
      curr = next;
    }

    // Return the closer of the two
    return (Math.abs(curr - value) < Math.abs(prev - value)) ? curr : prev;
  }

  /**
   * Generate golden ratio based proportions
   */
  static goldenProportions(baseValue: number): {
    smaller: number;
    larger: number;
    ratio: number;
  } {
    return {
      smaller: baseValue / PHI,
      larger: baseValue * PHI,
      ratio: PHI
    };
  }

  /**
   * Create a golden rectangle subdivision
   */
  static subdivideGoldenRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number = 1
  ): Array<{ x: number; y: number; width: number; height: number }> {
    const rectangles: Array<{ x: number; y: number; width: number; height: number }> = [];
    
    const addRectangle = (rx: number, ry: number, rw: number, rh: number, currentDepth: number) => {
      rectangles.push({ x: rx, y: ry, width: rw, height: rh });
      
      if (currentDepth > 0) {
        // Determine if we should subdivide horizontally or vertically
        if (rw > rh) {
          // Subdivide vertically
          const newWidth = rh / PHI;
          addRectangle(rx, ry, newWidth, rh, currentDepth - 1);
          addRectangle(rx + newWidth, ry, rw - newWidth, rh, currentDepth - 1);
        } else {
          // Subdivide horizontally
          const newHeight = rw / PHI;
          addRectangle(rx, ry, rw, newHeight, currentDepth - 1);
          addRectangle(rx, ry + newHeight, rw, rh - newHeight, currentDepth - 1);
        }
      }
    };

    addRectangle(x, y, width, height, depth);
    return rectangles;
  }
}

export default GoldenRatio;