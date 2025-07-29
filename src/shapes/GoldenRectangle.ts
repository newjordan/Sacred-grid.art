// src/shapes/GoldenRectangle.ts - Golden ratio rectangle subdivisions

import { Vector2D, Rectangle } from '../types';
import { GOLDEN_RATIO } from '../utils/constants';

/**
 * Golden rectangle implementation with recursive subdivisions
 */
export class GoldenRectangle {
  /**
   * Create a golden rectangle with proper φ proportions
   */
  static create(
    topLeft: Vector2D,
    width: number
  ): Rectangle {
    const height = width / GOLDEN_RATIO;
    
    return {
      x: topLeft.x,
      y: topLeft.y,
      width,
      height
    };
  }

  /**
   * Create golden rectangle from height
   */
  static createFromHeight(
    topLeft: Vector2D,
    height: number
  ): Rectangle {
    const width = height * GOLDEN_RATIO;
    
    return {
      x: topLeft.x,
      y: topLeft.y,
      width,
      height
    };
  }

  /**
   * Generate recursive golden rectangle subdivisions
   */
  static generateSubdivisions(
    initialRect: Rectangle,
    levels: number = 8
  ): Array<{
    rectangle: Rectangle;
    level: number;
    isSquare: boolean;
    spiralCenter: Vector2D;
    spiralRadius: number;
  }> {
    const subdivisions: Array<{
      rectangle: Rectangle;
      level: number;
      isSquare: boolean;
      spiralCenter: Vector2D;
      spiralRadius: number;
    }> = [];

    let currentRect = { ...initialRect };
    let orientation: 'horizontal' | 'vertical' = 
      currentRect.width > currentRect.height ? 'horizontal' : 'vertical';

    for (let level = 0; level < levels; level++) {
      // Add current rectangle
      const isSquare = level > 0; // First is golden rectangle, rest are squares
      const spiralRadius = Math.min(currentRect.width, currentRect.height);
      
      let spiralCenter: Vector2D;
      if (orientation === 'horizontal') {
        spiralCenter = {
          x: currentRect.x + currentRect.width - spiralRadius,
          y: currentRect.y + spiralRadius
        };
      } else {
        spiralCenter = {
          x: currentRect.x + spiralRadius,
          y: currentRect.y + currentRect.height - spiralRadius
        };
      }

      subdivisions.push({
        rectangle: { ...currentRect },
        level,
        isSquare,
        spiralCenter,
        spiralRadius
      });

      // Calculate next subdivision
      if (orientation === 'horizontal') {
        // Remove square from right side
        const squareSize = currentRect.height;
        currentRect = {
          x: currentRect.x,
          y: currentRect.y,
          width: currentRect.width - squareSize,
          height: currentRect.height
        };
        orientation = 'vertical';
      } else {
        // Remove square from bottom
        const squareSize = currentRect.width;
        currentRect = {
          x: currentRect.x,
          y: currentRect.y,
          width: currentRect.width,
          height: currentRect.height - squareSize
        };
        orientation = 'horizontal';
      }

      // Stop if rectangle becomes too small
      if (currentRect.width < 1 || currentRect.height < 1) break;
    }

    return subdivisions;
  }

  /**
   * Generate golden spiral from rectangle subdivisions
   */
  static generateSpiralFromSubdivisions(
    subdivisions: Array<{
      rectangle: Rectangle;
      level: number;
      isSquare: boolean;
      spiralCenter: Vector2D;
      spiralRadius: number;
    }>,
    pointsPerQuarter: number = 25
  ): Vector2D[] {
    const spiralPoints: Vector2D[] = [];

    for (let i = 0; i < subdivisions.length; i++) {
      const subdivision = subdivisions[i];
      if (!subdivision.isSquare && i === 0) continue; // Skip first golden rectangle

      const { spiralCenter, spiralRadius } = subdivision;
      const startAngle = i * Math.PI / 2;
      const endAngle = startAngle + Math.PI / 2;

      // Generate quarter circle points
      for (let j = 0; j <= pointsPerQuarter; j++) {
        const t = j / pointsPerQuarter;
        const angle = startAngle + t * (endAngle - startAngle);
        
        const x = spiralCenter.x + spiralRadius * Math.cos(angle);
        const y = spiralCenter.y + spiralRadius * Math.sin(angle);
        
        spiralPoints.push({ x, y });
      }
    }

    return spiralPoints;
  }

  /**
   * Generate grid of golden rectangles
   */
  static generateGrid(
    topLeft: Vector2D,
    cellWidth: number,
    rows: number,
    cols: number
  ): Rectangle[] {
    const rectangles: Rectangle[] = [];
    const cellHeight = cellWidth / GOLDEN_RATIO;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        rectangles.push({
          x: topLeft.x + col * cellWidth,
          y: topLeft.y + row * cellHeight,
          width: cellWidth,
          height: cellHeight
        });
      }
    }

    return rectangles;
  }

  /**
   * Create nested golden rectangles
   */
  static generateNestedRectangles(
    outerRect: Rectangle,
    levels: number = 5,
    margin: number = 10
  ): Rectangle[] {
    const rectangles: Rectangle[] = [];
    let currentRect = { ...outerRect };

    for (let level = 0; level < levels; level++) {
      rectangles.push({ ...currentRect });

      // Calculate inner rectangle with margin
      const newWidth = currentRect.width - 2 * margin;
      const newHeight = newWidth / GOLDEN_RATIO;

      if (newHeight > currentRect.height - 2 * margin) {
        // Adjust based on height constraint
        const adjustedHeight = currentRect.height - 2 * margin;
        const adjustedWidth = adjustedHeight * GOLDEN_RATIO;
        
        currentRect = {
          x: currentRect.x + (currentRect.width - adjustedWidth) / 2,
          y: currentRect.y + margin,
          width: adjustedWidth,
          height: adjustedHeight
        };
      } else {
        currentRect = {
          x: currentRect.x + margin,
          y: currentRect.y + (currentRect.height - newHeight) / 2,
          width: newWidth,
          height: newHeight
        };
      }

      // Stop if rectangle becomes too small
      if (currentRect.width < margin * 2 || currentRect.height < margin * 2) break;
    }

    return rectangles;
  }

  /**
   * Calculate golden section points
   */
  static getGoldenSectionPoints(
    start: Vector2D,
    end: Vector2D
  ): {
    majorSection: Vector2D;
    minorSection: Vector2D;
  } {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    const majorRatio = 1 / GOLDEN_RATIO;
    const minorRatio = 1 - majorRatio;

    return {
      majorSection: {
        x: start.x + dx * majorRatio,
        y: start.y + dy * majorRatio
      },
      minorSection: {
        x: start.x + dx * minorRatio,
        y: start.y + dy * minorRatio
      }
    };
  }

  /**
   * Validate if rectangle has golden ratio proportions
   */
  static isGoldenRectangle(
    rectangle: Rectangle,
    tolerance: number = 0.01
  ): boolean {
    const ratio = rectangle.width / rectangle.height;
    const goldenRatio = GOLDEN_RATIO;
    
    return Math.abs(ratio - goldenRatio) <= tolerance ||
           Math.abs(ratio - 1/goldenRatio) <= tolerance;
  }

  /**
   * Convert rectangle to golden proportions
   */
  static toGoldenProportions(
    rectangle: Rectangle,
    preserveWidth: boolean = true
  ): Rectangle {
    if (preserveWidth) {
      return {
        ...rectangle,
        height: rectangle.width / GOLDEN_RATIO
      };
    } else {
      return {
        ...rectangle,
        width: rectangle.height * GOLDEN_RATIO
      };
    }
  }
}

/**
 * Golden rectangle animation utilities
 */
export class GoldenRectangleAnimator {
  /**
   * Animate rectangle subdivision
   */
  static animateSubdivision(
    subdivisions: Array<{
      rectangle: Rectangle;
      level: number;
      isSquare: boolean;
      spiralCenter: Vector2D;
      spiralRadius: number;
    }>,
    progress: number // 0 to 1
  ): Array<{
    rectangle: Rectangle;
    level: number;
    isSquare: boolean;
    spiralCenter: Vector2D;
    spiralRadius: number;
  }> {
    const visibleCount = Math.floor(subdivisions.length * progress);
    return subdivisions.slice(0, visibleCount);
  }

  /**
   * Animate rectangle growth
   */
  static animateGrowth(
    targetRect: Rectangle,
    progress: number // 0 to 1
  ): Rectangle {
    return {
      x: targetRect.x + targetRect.width * (1 - progress) / 2,
      y: targetRect.y + targetRect.height * (1 - progress) / 2,
      width: targetRect.width * progress,
      height: targetRect.height * progress
    };
  }

  /**
   * Animate nested rectangles
   */
  static animateNesting(
    rectangles: Rectangle[],
    progress: number // 0 to 1
  ): Rectangle[] {
    const visibleCount = Math.ceil(rectangles.length * progress);
    return rectangles.slice(0, visibleCount).map((rect, index) => {
      const levelProgress = Math.max(0, progress * rectangles.length - index);
      return this.animateGrowth(rect, Math.min(1, levelProgress));
    });
  }
}