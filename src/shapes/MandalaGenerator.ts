// src/shapes/MandalaGenerator.ts - Radial pattern generation for mandalas

import { Vector2D } from '../types';
import { PI, TWO_PI } from '../utils/constants';

/**
 * Mandala pattern configuration
 */
export interface MandalaConfig {
  center: Vector2D;
  radius: number;
  symmetry: number; // Number of radial symmetries
  layers: number;   // Number of concentric layers
  complexity: number; // Pattern complexity (1-10)
  style: 'geometric' | 'floral' | 'celtic' | 'tribal' | 'sacred';
}

/**
 * Mandala element types
 */
export interface MandalaElement {
  type: 'circle' | 'petal' | 'line' | 'arc' | 'polygon' | 'spiral';
  center: Vector2D;
  radius: number;
  angle: number;
  points?: Vector2D[];
  strokeWidth?: number;
  filled?: boolean;
}

/**
 * Mandala generator with various pattern styles
 */
export class MandalaGenerator {
  /**
   * Generate basic geometric mandala
   */
  static generateGeometric(config: MandalaConfig): MandalaElement[] {
    const elements: MandalaElement[] = [];
    const { center, radius, symmetry, layers, complexity } = config;
    
    const angleStep = TWO_PI / symmetry;
    const radiusStep = radius / layers;

    for (let layer = 1; layer <= layers; layer++) {
      const layerRadius = radiusStep * layer;
      
      // Add concentric circles
      elements.push({
        type: 'circle',
        center,
        radius: layerRadius,
        angle: 0,
        strokeWidth: 1,
        filled: false
      });

      // Add radial elements
      for (let i = 0; i < symmetry; i++) {
        const angle = i * angleStep;
        
        // Radial lines
        const lineEnd = {
          x: center.x + layerRadius * Math.cos(angle),
          y: center.y + layerRadius * Math.sin(angle)
        };
        
        elements.push({
          type: 'line',
          center,
          radius: layerRadius,
          angle,
          points: [center, lineEnd],
          strokeWidth: 1
        });

        // Add geometric shapes at intersections
        if (layer % 2 === 0) {
          const shapeCenter = {
            x: center.x + (layerRadius * 0.8) * Math.cos(angle),
            y: center.y + (layerRadius * 0.8) * Math.sin(angle)
          };

          const shapeRadius = radiusStep * 0.3 * complexity / 5;
          const sides = 3 + (complexity % 4);
          
          elements.push({
            type: 'polygon',
            center: shapeCenter,
            radius: shapeRadius,
            angle,
            points: this.generatePolygon(shapeCenter, shapeRadius, sides, angle),
            filled: layer % 3 === 0
          });
        }
      }
    }

    return elements;
  }

  /**
   * Generate floral mandala with petal patterns
   */
  static generateFloral(config: MandalaConfig): MandalaElement[] {
    const elements: MandalaElement[] = [];
    const { center, radius, symmetry, layers, complexity } = config;
    
    const angleStep = TWO_PI / symmetry;
    const radiusStep = radius / layers;

    for (let layer = 1; layer <= layers; layer++) {
      const layerRadius = radiusStep * layer;
      
      // Add flower petals
      for (let i = 0; i < symmetry; i++) {
        const angle = i * angleStep;
        const petalCount = Math.max(3, complexity);
        
        for (let p = 0; p < petalCount; p++) {
          const petalAngle = angle + (p / petalCount) * (angleStep * 0.8);
          const petalRadius = layerRadius * (0.6 + 0.4 * Math.sin(layer * PI / layers));
          
          const petalCenter = {
            x: center.x + petalRadius * 0.7 * Math.cos(petalAngle),
            y: center.y + petalRadius * 0.7 * Math.sin(petalAngle)
          };

          elements.push({
            type: 'petal',
            center: petalCenter,
            radius: petalRadius * 0.3,
            angle: petalAngle,
            points: this.generatePetal(petalCenter, petalRadius * 0.3, petalAngle),
            filled: true
          });
        }
      }

      // Add decorative circles
      if (layer % 2 === 1) {
        for (let i = 0; i < symmetry * 2; i++) {
          const angle = i * (angleStep / 2);
          const decorRadius = layerRadius * 0.9;
          
          const decorCenter = {
            x: center.x + decorRadius * Math.cos(angle),
            y: center.y + decorRadius * Math.sin(angle)
          };

          elements.push({
            type: 'circle',
            center: decorCenter,
            radius: radiusStep * 0.1,
            angle,
            strokeWidth: 1,
            filled: i % 3 === 0
          });
        }
      }
    }

    return elements;
  }

  /**
   * Generate Celtic knot mandala
   */
  static generateCeltic(config: MandalaConfig): MandalaElement[] {
    const elements: MandalaElement[] = [];
    const { center, radius, symmetry, layers } = config;
    
    const angleStep = TWO_PI / symmetry;
    const radiusStep = radius / layers;

    for (let layer = 1; layer <= layers; layer++) {
      const layerRadius = radiusStep * layer;
      
      // Celtic knot patterns
      for (let i = 0; i < symmetry; i++) {
        const angle = i * angleStep;
        
        // Generate interwoven arcs
        const knotPoints = this.generateCelticKnot(
          center,
          layerRadius,
          angle,
          angleStep
        );

        elements.push({
          type: 'arc',
          center,
          radius: layerRadius,
          angle,
          points: knotPoints,
          strokeWidth: 3
        });
      }

      // Add connecting circles
      elements.push({
        type: 'circle',
        center,
        radius: layerRadius,
        angle: 0,
        strokeWidth: 2,
        filled: false
      });
    }

    return elements;
  }

  /**
   * Generate tribal mandala with bold patterns
   */
  static generateTribal(config: MandalaConfig): MandalaElement[] {
    const elements: MandalaElement[] = [];
    const { center, radius, symmetry, layers, complexity } = config;
    
    const angleStep = TWO_PI / symmetry;
    const radiusStep = radius / layers;

    for (let layer = 1; layer <= layers; layer++) {
      const layerRadius = radiusStep * layer;
      
      // Tribal patterns with thick lines and bold shapes
      for (let i = 0; i < symmetry; i++) {
        const angle = i * angleStep;
        
        // Generate tribal motifs
        const motifPoints = this.generateTribalMotif(
          center,
          layerRadius,
          angle,
          complexity
        );

        elements.push({
          type: 'polygon',
          center,
          radius: layerRadius,
          angle,
          points: motifPoints,
          strokeWidth: 4,
          filled: layer % 2 === 0
        });

        // Add connecting elements
        if (layer > 1) {
          const innerRadius = radiusStep * (layer - 1);
          const outerPoint = {
            x: center.x + layerRadius * Math.cos(angle),
            y: center.y + layerRadius * Math.sin(angle)
          };
          const innerPoint = {
            x: center.x + innerRadius * Math.cos(angle),
            y: center.y + innerRadius * Math.sin(angle)
          };

          elements.push({
            type: 'line',
            center,
            radius: layerRadius,
            angle,
            points: [innerPoint, outerPoint],
            strokeWidth: 3
          });
        }
      }
    }

    return elements;
  }

  /**
   * Generate sacred geometry mandala
   */
  static generateSacred(config: MandalaConfig): MandalaElement[] {
    const elements: MandalaElement[] = [];
    const { center, radius, symmetry, layers } = config;
    
    const angleStep = TWO_PI / symmetry;
    const radiusStep = radius / layers;

    // Add Flower of Life pattern
    const flowerElements = this.generateFlowerOfLife(center, radius * 0.8);
    elements.push(...flowerElements);

    // Add Metatron's Cube elements
    for (let layer = 1; layer <= layers; layer++) {
      const layerRadius = radiusStep * layer;
      
      // Sacred geometry circles
      elements.push({
        type: 'circle',
        center,
        radius: layerRadius,
        angle: 0,
        strokeWidth: 1,
        filled: false
      });

      // Platonic solid projections
      if (layer % 2 === 0) {
        for (let i = 0; i < symmetry; i++) {
          const angle = i * angleStep;
          const shapeCenter = {
            x: center.x + layerRadius * 0.7 * Math.cos(angle),
            y: center.y + layerRadius * 0.7 * Math.sin(angle)
          };

          // Generate pentagon (dodecahedron face)
          const pentagonPoints = this.generatePolygon(
            shapeCenter,
            radiusStep * 0.3,
            5,
            angle
          );

          elements.push({
            type: 'polygon',
            center: shapeCenter,
            radius: radiusStep * 0.3,
            angle,
            points: pentagonPoints,
            strokeWidth: 2,
            filled: false
          });
        }
      }
    }

    return elements;
  }

  /**
   * Generate mandala with spiral elements
   */
  static generateSpiral(config: MandalaConfig): MandalaElement[] {
    const elements: MandalaElement[] = [];
    const { center, radius, symmetry, layers } = config;
    
    const angleStep = TWO_PI / symmetry;

    for (let i = 0; i < symmetry; i++) {
      const angle = i * angleStep;
      
      // Generate spiral from center outward
      const spiralPoints = this.generateRadialSpiral(
        center,
        radius,
        angle,
        layers
      );

      elements.push({
        type: 'spiral',
        center,
        radius,
        angle,
        points: spiralPoints,
        strokeWidth: 2
      });
    }

    return elements;
  }

  /**
   * Helper: Generate regular polygon
   */
  private static generatePolygon(
    center: Vector2D,
    radius: number,
    sides: number,
    rotation: number = 0
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const angleStep = TWO_PI / sides;

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep + rotation;
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }

    return points;
  }

  /**
   * Helper: Generate petal shape
   */
  private static generatePetal(
    center: Vector2D,
    radius: number,
    angle: number
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const petalAngle = angle + (t - 0.5) * PI;
      const petalRadius = radius * Math.sin(t * PI);
      
      points.push({
        x: center.x + petalRadius * Math.cos(petalAngle),
        y: center.y + petalRadius * Math.sin(petalAngle)
      });
    }

    return points;
  }

  /**
   * Helper: Generate Celtic knot pattern
   */
  private static generateCelticKnot(
    center: Vector2D,
    radius: number,
    startAngle: number,
    angleSpan: number
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const steps = 30;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = startAngle + t * angleSpan;
      
      // Create interwoven pattern
      const r = radius * (0.8 + 0.2 * Math.sin(t * PI * 4));
      const offsetAngle = angle + Math.sin(t * PI * 6) * 0.2;
      
      points.push({
        x: center.x + r * Math.cos(offsetAngle),
        y: center.y + r * Math.sin(offsetAngle)
      });
    }

    return points;
  }

  /**
   * Helper: Generate tribal motif
   */
  private static generateTribalMotif(
    center: Vector2D,
    radius: number,
    angle: number,
    complexity: number
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const sides = 3 + complexity % 5;
    const baseRadius = radius * 0.6;

    // Create angular tribal shape
    for (let i = 0; i < sides; i++) {
      const sideAngle = angle + (i / sides) * TWO_PI;
      const sideRadius = baseRadius * (1 + 0.5 * Math.sin(i * PI));
      
      points.push({
        x: center.x + sideRadius * Math.cos(sideAngle),
        y: center.y + sideRadius * Math.sin(sideAngle)
      });
    }

    return points;
  }

  /**
   * Helper: Generate Flower of Life pattern
   */
  private static generateFlowerOfLife(
    center: Vector2D,
    radius: number
  ): MandalaElement[] {
    const elements: MandalaElement[] = [];
    const circleRadius = radius / 3;

    // Central circle
    elements.push({
      type: 'circle',
      center,
      radius: circleRadius,
      angle: 0,
      strokeWidth: 2,
      filled: false
    });

    // Six surrounding circles
    for (let i = 0; i < 6; i++) {
      const angle = i * PI / 3;
      const circleCenter = {
        x: center.x + circleRadius * Math.cos(angle),
        y: center.y + circleRadius * Math.sin(angle)
      };

      elements.push({
        type: 'circle',
        center: circleCenter,
        radius: circleRadius,
        angle,
        strokeWidth: 2,
        filled: false
      });
    }

    return elements;
  }

  /**
   * Helper: Generate radial spiral
   */
  private static generateRadialSpiral(
    center: Vector2D,
    maxRadius: number,
    startAngle: number,
    turns: number
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const steps = turns * 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = startAngle + t * turns * TWO_PI;
      const radius = maxRadius * t;
      
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }

    return points;
  }

  /**
   * Generate complete mandala based on configuration
   */
  static generate(config: MandalaConfig): MandalaElement[] {
    switch (config.style) {
      case 'geometric':
        return this.generateGeometric(config);
      case 'floral':
        return this.generateFloral(config);
      case 'celtic':
        return this.generateCeltic(config);
      case 'tribal':
        return this.generateTribal(config);
      case 'sacred':
        return this.generateSacred(config);
      default:
        return this.generateGeometric(config);
    }
  }

  /**
   * Animate mandala growth
   */
  static animateGrowth(
    elements: MandalaElement[],
    progress: number // 0 to 1
  ): MandalaElement[] {
    const visibleCount = Math.floor(elements.length * progress);
    return elements.slice(0, visibleCount);
  }

  /**
   * Animate mandala rotation
   */
  static animateRotation(
    elements: MandalaElement[],
    rotationAngle: number
  ): MandalaElement[] {
    return elements.map(element => ({
      ...element,
      angle: element.angle + rotationAngle,
      points: element.points?.map(point => {
        const cos = Math.cos(rotationAngle);
        const sin = Math.sin(rotationAngle);
        const dx = point.x - element.center.x;
        const dy = point.y - element.center.y;
        
        return {
          x: element.center.x + dx * cos - dy * sin,
          y: element.center.y + dx * sin + dy * cos
        };
      })
    }));
  }
}