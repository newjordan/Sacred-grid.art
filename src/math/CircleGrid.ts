// src/math/CircleGrid.ts - Circle positioning algorithms for sacred geometry

import { Vector2D } from '../types';
import { TWO_PI, PI, SACRED_RATIOS } from '../utils/constants';

/**
 * Circle grid positioning algorithms for sacred geometry patterns
 */
export class CircleGrid {
  /**
   * Generate hexagonal close packing (most efficient circle packing)
   */
  static hexagonalPacking(
    center: Vector2D,
    circleRadius: number,
    rings: number
  ): Array<{ center: Vector2D; radius: number; ring: number; index: number }> {
    const circles: Array<{ center: Vector2D; radius: number; ring: number; index: number }> = [];
    const spacing = circleRadius * 2; // Circles touching

    // Central circle
    circles.push({
      center: { ...center },
      radius: circleRadius,
      ring: 0,
      index: 0
    });

    // Generate rings
    for (let ring = 1; ring <= rings; ring++) {
      const ringRadius = ring * spacing * Math.cos(PI / 6); // Hexagonal spacing
      const circlesInRing = ring * 6;

      for (let i = 0; i < circlesInRing; i++) {
        const angle = (i / circlesInRing) * TWO_PI;
        circles.push({
          center: {
            x: center.x + ringRadius * Math.cos(angle),
            y: center.y + ringRadius * Math.sin(angle)
          },
          radius: circleRadius,
          ring,
          index: i
        });
      }
    }

    return circles;
  }

  /**
   * Generate square grid packing
   */
  static squarePacking(
    center: Vector2D,
    circleRadius: number,
    gridSize: number
  ): Array<{ center: Vector2D; radius: number; row: number; col: number }> {
    const circles: Array<{ center: Vector2D; radius: number; row: number; col: number }> = [];
    const spacing = circleRadius * 2;
    const offset = (gridSize - 1) * spacing / 2;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        circles.push({
          center: {
            x: center.x + col * spacing - offset,
            y: center.y + row * spacing - offset
          },
          radius: circleRadius,
          row,
          col
        });
      }
    }

    return circles;
  }

  /**
   * Generate triangular packing
   */
  static triangularPacking(
    center: Vector2D,
    circleRadius: number,
    layers: number
  ): Array<{ center: Vector2D; radius: number; layer: number; position: number }> {
    const circles: Array<{ center: Vector2D; radius: number; layer: number; position: number }> = [];
    const spacing = circleRadius * 2;
    const height = spacing * Math.sin(PI / 3); // Height of equilateral triangle

    for (let layer = 0; layer < layers; layer++) {
      const circlesInLayer = layer * 2 + 1;
      const layerOffset = layer * spacing / 2;

      for (let pos = 0; pos < circlesInLayer; pos++) {
        const x = center.x + (pos - layer) * spacing;
        const y = center.y + layer * height;

        circles.push({
          center: { x, y },
          radius: circleRadius,
          layer,
          position: pos
        });
      }
    }

    return circles;
  }

  /**
   * Generate Fibonacci spiral circle placement
   */
  static fibonacciSpiral(
    center: Vector2D,
    circleRadius: number,
    count: number,
    growthFactor: number = SACRED_RATIOS.GOLDEN
  ): Array<{ center: Vector2D; radius: number; index: number; angle: number; distance: number }> {
    const circles: Array<{ center: Vector2D; radius: number; index: number; angle: number; distance: number }> = [];
    const goldenAngle = (3 - Math.sqrt(5)) * PI; // ≈ 137.5°

    for (let i = 0; i < count; i++) {
      const angle = i * goldenAngle;
      const distance = Math.sqrt(i) * circleRadius * growthFactor;

      circles.push({
        center: {
          x: center.x + distance * Math.cos(angle),
          y: center.y + distance * Math.sin(angle)
        },
        radius: circleRadius * (1 - i * 0.01), // Gradually smaller circles
        index: i,
        angle,
        distance
      });
    }

    return circles;
  }

  /**
   * Generate Apollonian gasket (fractal circle packing)
   */
  static apollonianGasket(
    center: Vector2D,
    outerRadius: number,
    iterations: number = 3
  ): Array<{ center: Vector2D; radius: number; curvature: number; generation: number }> {
    const circles: Array<{ center: Vector2D; radius: number; curvature: number; generation: number }> = [];

    // Start with three mutually tangent circles inside a larger circle
    const r1 = outerRadius / 3;
    const r2 = outerRadius / 3;
    const r3 = outerRadius / 3;

    // Position the three initial circles
    const angle1 = 0;
    const angle2 = TWO_PI / 3;
    const angle3 = 4 * PI / 3;

    const distance = outerRadius - r1;

    const initialCircles = [
      {
        center: {
          x: center.x + distance * Math.cos(angle1),
          y: center.y + distance * Math.sin(angle1)
        },
        radius: r1,
        curvature: 1 / r1,
        generation: 0
      },
      {
        center: {
          x: center.x + distance * Math.cos(angle2),
          y: center.y + distance * Math.sin(angle2)
        },
        radius: r2,
        curvature: 1 / r2,
        generation: 0
      },
      {
        center: {
          x: center.x + distance * Math.cos(angle3),
          y: center.y + distance * Math.sin(angle3)
        },
        radius: r3,
        curvature: 1 / r3,
        generation: 0
      }
    ];

    circles.push(...initialCircles);

    // Generate fractal iterations (simplified version)
    for (let iter = 0; iter < iterations; iter++) {
      const newCircles = [];
      
      for (let i = 0; i < circles.length - 2; i++) {
        for (let j = i + 1; j < circles.length - 1; j++) {
          for (let k = j + 1; k < circles.length; k++) {
            const c1 = circles[i];
            const c2 = circles[j];
            const c3 = circles[k];

            // Calculate new circle using Descartes' Circle Theorem (simplified)
            const k1 = c1.curvature;
            const k2 = c2.curvature;
            const k3 = c3.curvature;
            const k4 = k1 + k2 + k3 + 2 * Math.sqrt(k1 * k2 + k2 * k3 + k3 * k1);

            if (k4 > 0 && k4 < 100) { // Reasonable size limits
              const newRadius = 1 / k4;
              
              // Approximate position (simplified calculation)
              const newCenter = {
                x: (c1.center.x + c2.center.x + c3.center.x) / 3,
                y: (c1.center.y + c2.center.y + c3.center.y) / 3
              };

              newCircles.push({
                center: newCenter,
                radius: newRadius,
                curvature: k4,
                generation: iter + 1
              });
            }
          }
        }
      }

      circles.push(...newCircles.slice(0, 10)); // Limit to prevent explosion
    }

    return circles;
  }

  /**
   * Generate Vesica Piscis pattern
   */
  static vesicaPiscis(
    center: Vector2D,
    radius: number,
    count: number = 6
  ): Array<{ center: Vector2D; radius: number; intersection: Vector2D[] }> {
    const circles: Array<{ center: Vector2D; radius: number; intersection: Vector2D[] }> = [];
    const spacing = radius * SACRED_RATIOS.VESICA_PISCIS;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TWO_PI;
      const circleCenter = {
        x: center.x + spacing * Math.cos(angle),
        y: center.y + spacing * Math.sin(angle)
      };

      // Calculate intersection points with center circle
      const d = Math.sqrt(
        Math.pow(circleCenter.x - center.x, 2) + Math.pow(circleCenter.y - center.y, 2)
      );

      let intersection: Vector2D[] = [];
      
      if (d <= 2 * radius && d > 0) {
        const a = (radius * radius - radius * radius + d * d) / (2 * d);
        const h = Math.sqrt(radius * radius - a * a);
        
        const midX = center.x + a * (circleCenter.x - center.x) / d;
        const midY = center.y + a * (circleCenter.y - center.y) / d;
        
        intersection = [
          {
            x: midX + h * (circleCenter.y - center.y) / d,
            y: midY - h * (circleCenter.x - center.x) / d
          },
          {
            x: midX - h * (circleCenter.y - center.y) / d,
            y: midY + h * (circleCenter.x - center.x) / d
          }
        ];
      }

      circles.push({
        center: circleCenter,
        radius,
        intersection
      });
    }

    return circles;
  }

  /**
   * Generate Platonic solid circle projections
   */
  static platonicProjections(
    center: Vector2D,
    radius: number,
    solidType: 'tetrahedron' | 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron'
  ): Array<{ center: Vector2D; radius: number; vertex: number }> {
    const circles: Array<{ center: Vector2D; radius: number; vertex: number }> = [];
    const circleRadius = radius / 8;

    let vertices: Vector2D[] = [];

    switch (solidType) {
      case 'tetrahedron':
        vertices = this.generateTetrahedronVertices(center, radius);
        break;
      case 'cube':
        vertices = this.generateCubeVertices(center, radius);
        break;
      case 'octahedron':
        vertices = this.generateOctahedronVertices(center, radius);
        break;
      case 'dodecahedron':
        vertices = this.generateDodecahedronVertices(center, radius);
        break;
      case 'icosahedron':
        vertices = this.generateIcosahedronVertices(center, radius);
        break;
    }

    vertices.forEach((vertex, index) => {
      circles.push({
        center: vertex,
        radius: circleRadius,
        vertex: index
      });
    });

    return circles;
  }

  /**
   * Generate tetrahedron vertices (2D projection)
   */
  private static generateTetrahedronVertices(center: Vector2D, radius: number): Vector2D[] {
    const vertices: Vector2D[] = [];
    
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * TWO_PI;
      vertices.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    
    // Add top vertex
    vertices.push({
      x: center.x,
      y: center.y - radius * 0.8
    });

    return vertices;
  }

  /**
   * Generate cube vertices (2D projection)
   */
  private static generateCubeVertices(center: Vector2D, radius: number): Vector2D[] {
    const vertices: Vector2D[] = [];
    const size = radius * 0.7;

    // 8 vertices of a cube projected to 2D
    const positions = [
      [-1, -1], [1, -1], [1, 1], [-1, 1], // Bottom face
      [-0.5, -1.5], [1.5, -1.5], [1.5, 0.5], [-0.5, 0.5] // Top face (offset)
    ];

    positions.forEach(([x, y]) => {
      vertices.push({
        x: center.x + x * size,
        y: center.y + y * size
      });
    });

    return vertices;
  }

  /**
   * Generate octahedron vertices (2D projection)
   */
  private static generateOctahedronVertices(center: Vector2D, radius: number): Vector2D[] {
    const vertices: Vector2D[] = [];

    // 6 vertices of an octahedron
    vertices.push(
      { x: center.x, y: center.y - radius }, // Top
      { x: center.x, y: center.y + radius }, // Bottom
      { x: center.x - radius, y: center.y }, // Left
      { x: center.x + radius, y: center.y }, // Right
      { x: center.x, y: center.y - radius * 0.5 }, // Front
      { x: center.x, y: center.y + radius * 0.5 }  // Back
    );

    return vertices;
  }

  /**
   * Generate dodecahedron vertices (2D projection)
   */
  private static generateDodecahedronVertices(center: Vector2D, radius: number): Vector2D[] {
    const vertices: Vector2D[] = [];
    const phi = SACRED_RATIOS.GOLDEN;

    // 20 vertices of a dodecahedron (simplified 2D projection)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TWO_PI;
      const r = radius * (0.8 + 0.2 * Math.cos(angle * 5));
      vertices.push({
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      });
    }

    return vertices;
  }

  /**
   * Generate icosahedron vertices (2D projection)
   */
  private static generateIcosahedronVertices(center: Vector2D, radius: number): Vector2D[] {
    const vertices: Vector2D[] = [];
    const phi = SACRED_RATIOS.GOLDEN;

    // 12 vertices of an icosahedron (simplified 2D projection)
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * TWO_PI;
      const r = radius * (0.9 + 0.1 * Math.cos(angle * 3));
      vertices.push({
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      });
    }

    // Add top and bottom vertices
    vertices.push(
      { x: center.x, y: center.y - radius },
      { x: center.x, y: center.y + radius }
    );

    return vertices;
  }

  /**
   * Calculate optimal circle packing efficiency
   */
  static calculatePackingEfficiency(
    circles: Array<{ center: Vector2D; radius: number }>,
    boundingRadius: number
  ): number {
    const totalCircleArea = circles.reduce((sum, circle) => 
      sum + PI * circle.radius * circle.radius, 0
    );
    const boundingArea = PI * boundingRadius * boundingRadius;
    
    return totalCircleArea / boundingArea;
  }

  /**
   * Detect circle overlaps
   */
  static detectOverlaps(
    circles: Array<{ center: Vector2D; radius: number }>
  ): Array<{ circle1: number; circle2: number; overlap: number }> {
    const overlaps: Array<{ circle1: number; circle2: number; overlap: number }> = [];

    for (let i = 0; i < circles.length - 1; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const c1 = circles[i];
        const c2 = circles[j];
        
        const distance = Math.sqrt(
          Math.pow(c2.center.x - c1.center.x, 2) + Math.pow(c2.center.y - c1.center.y, 2)
        );
        
        const minDistance = c1.radius + c2.radius;
        
        if (distance < minDistance) {
          overlaps.push({
            circle1: i,
            circle2: j,
            overlap: minDistance - distance
          });
        }
      }
    }

    return overlaps;
  }
}

export default CircleGrid;