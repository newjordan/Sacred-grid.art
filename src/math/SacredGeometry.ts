// src/math/SacredGeometry.ts - Sacred geometry calculations hub

import { Vector2D, Vector3D } from '../types';
import { SACRED_RATIOS, PI, TWO_PI, DEG_TO_RAD } from '../utils/constants';

/**
 * Sacred Geometry mathematical utilities
 */
export class SacredGeometry {
  /**
   * Generate regular polygon vertices
   */
  static regularPolygon(
    center: Vector2D,
    radius: number,
    sides: number,
    rotation: number = 0
  ): Vector2D[] {
    const vertices: Vector2D[] = [];
    const angleStep = TWO_PI / sides;
    
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep + rotation;
      vertices.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    
    return vertices;
  }

  /**
   * Generate star polygon vertices
   */
  static starPolygon(
    center: Vector2D,
    outerRadius: number,
    innerRadius: number,
    points: number,
    rotation: number = 0
  ): Vector2D[] {
    const vertices: Vector2D[] = [];
    const angleStep = PI / points;
    
    for (let i = 0; i < points * 2; i++) {
      const angle = i * angleStep + rotation;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      
      vertices.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    
    return vertices;
  }

  /**
   * Generate Flower of Life pattern
   */
  static flowerOfLife(
    center: Vector2D,
    radius: number,
    rings: number = 2
  ): Array<{ center: Vector2D; radius: number }> {
    const circles: Array<{ center: Vector2D; radius: number }> = [];
    
    // Central circle
    circles.push({ center: { ...center }, radius });
    
    for (let ring = 1; ring <= rings; ring++) {
      const ringRadius = ring * radius * Math.sqrt(3);
      const circlesInRing = ring * 6;
      
      for (let i = 0; i < circlesInRing; i++) {
        const angle = (i / circlesInRing) * TWO_PI;
        const circleCenter = {
          x: center.x + ringRadius * Math.cos(angle),
          y: center.y + ringRadius * Math.sin(angle)
        };
        
        circles.push({ center: circleCenter, radius });
      }
    }
    
    return circles;
  }

  /**
   * Generate Seed of Life pattern (7 circles)
   */
  static seedOfLife(center: Vector2D, radius: number): Array<{ center: Vector2D; radius: number }> {
    const circles: Array<{ center: Vector2D; radius: number }> = [];
    
    // Central circle
    circles.push({ center: { ...center }, radius });
    
    // Six surrounding circles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI;
      const circleCenter = {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
      
      circles.push({ center: circleCenter, radius });
    }
    
    return circles;
  }

  /**
   * Generate Vesica Piscis (intersection of two circles)
   */
  static vesicaPiscis(
    center1: Vector2D,
    center2: Vector2D,
    radius: number
  ): { circles: Array<{ center: Vector2D; radius: number }>; intersection: Vector2D[] } {
    const circles = [
      { center: center1, radius },
      { center: center2, radius }
    ];

    // Calculate intersection points
    const d = Math.sqrt(
      Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
    );
    
    if (d > 2 * radius || d === 0) {
      return { circles, intersection: [] };
    }

    const a = (radius * radius - radius * radius + d * d) / (2 * d);
    const h = Math.sqrt(radius * radius - a * a);
    
    const midX = center1.x + a * (center2.x - center1.x) / d;
    const midY = center1.y + a * (center2.y - center1.y) / d;
    
    const intersection = [
      {
        x: midX + h * (center2.y - center1.y) / d,
        y: midY - h * (center2.x - center1.x) / d
      },
      {
        x: midX - h * (center2.y - center1.y) / d,
        y: midY + h * (center2.x - center1.x) / d
      }
    ];

    return { circles, intersection };
  }

  /**
   * Generate Merkaba (3D star tetrahedron) vertices
   */
  static merkaba(center: Vector3D, size: number): Vector3D[] {
    const vertices: Vector3D[] = [];
    const s = size / 2;
    
    // Upper tetrahedron
    vertices.push(
      { x: center.x, y: center.y - s, z: center.z + s },      // top
      { x: center.x - s, y: center.y + s, z: center.z - s },  // bottom left
      { x: center.x + s, y: center.y + s, z: center.z - s },  // bottom right
      { x: center.x, y: center.y + s, z: center.z + s }       // bottom back
    );
    
    // Lower tetrahedron (inverted)
    vertices.push(
      { x: center.x, y: center.y + s, z: center.z - s },      // bottom
      { x: center.x - s, y: center.y - s, z: center.z + s },  // top left
      { x: center.x + s, y: center.y - s, z: center.z + s },  // top right
      { x: center.x, y: center.y - s, z: center.z - s }       // top back
    );
    
    return vertices;
  }

  /**
   * Generate Sri Yantra triangles
   */
  static sriYantra(center: Vector2D, size: number): Vector2D[][] {
    const triangles: Vector2D[][] = [];
    const baseSize = size / 3;
    
    // Upward pointing triangles
    for (let i = 0; i < 5; i++) {
      const scale = 1 - (i * 0.15);
      const triangleSize = baseSize * scale;
      const triangle = this.regularPolygon(center, triangleSize, 3, 0);
      triangles.push(triangle);
    }
    
    // Downward pointing triangles
    for (let i = 0; i < 4; i++) {
      const scale = 0.9 - (i * 0.15);
      const triangleSize = baseSize * scale;
      const triangle = this.regularPolygon(center, triangleSize, 3, PI);
      triangles.push(triangle);
    }
    
    return triangles;
  }

  /**
   * Generate Metatron's Cube circles
   */
  static metatronsCube(center: Vector2D, radius: number): Array<{ center: Vector2D; radius: number }> {
    const circles: Array<{ center: Vector2D; radius: number }> = [];
    const circleRadius = radius / 6;
    
    // Central circle
    circles.push({ center: { ...center }, radius: circleRadius });
    
    // Inner hexagon (6 circles)
    const innerRadius = circleRadius * 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI;
      circles.push({
        center: {
          x: center.x + innerRadius * Math.cos(angle),
          y: center.y + innerRadius * Math.sin(angle)
        },
        radius: circleRadius
      });
    }
    
    // Outer hexagon (6 circles)
    const outerRadius = circleRadius * 4;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI + (PI / 6); // Offset by 30 degrees
      circles.push({
        center: {
          x: center.x + outerRadius * Math.cos(angle),
          y: center.y + outerRadius * Math.sin(angle)
        },
        radius: circleRadius
      });
    }
    
    return circles;
  }

  /**
   * Calculate sacred ratios
   */
  static getSacredRatio(name: keyof typeof SACRED_RATIOS): number {
    return SACRED_RATIOS[name];
  }

  /**
   * Generate mandala pattern
   */
  static mandala(
    center: Vector2D,
    radius: number,
    petals: number,
    layers: number = 3
  ): Array<{ points: Vector2D[]; layer: number }> {
    const patterns: Array<{ points: Vector2D[]; layer: number }> = [];
    
    for (let layer = 0; layer < layers; layer++) {
      const layerRadius = radius * (1 - layer * 0.3);
      const layerPetals = petals * (layer + 1);
      
      // Generate petal shapes
      for (let i = 0; i < layerPetals; i++) {
        const angle = (i / layerPetals) * TWO_PI;
        const petalCenter = {
          x: center.x + layerRadius * 0.7 * Math.cos(angle),
          y: center.y + layerRadius * 0.7 * Math.sin(angle)
        };
        
        // Create petal shape (simplified as small circle)
        const petalPoints = this.regularPolygon(
          petalCenter,
          layerRadius * 0.2,
          6,
          angle
        );
        
        patterns.push({ points: petalPoints, layer });
      }
    }
    
    return patterns;
  }

  /**
   * Generate Lissajous curve
   */
  static lissajous(
    center: Vector2D,
    amplitude: Vector2D,
    frequency: Vector2D,
    phase: number = 0,
    points: number = 1000
  ): Vector2D[] {
    const curve: Vector2D[] = [];
    
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * TWO_PI;
      
      curve.push({
        x: center.x + amplitude.x * Math.sin(frequency.x * t + phase),
        y: center.y + amplitude.y * Math.sin(frequency.y * t)
      });
    }
    
    return curve;
  }

  /**
   * Generate spiral pattern
   */
  static spiral(
    center: Vector2D,
    initialRadius: number,
    growth: number,
    turns: number,
    pointsPerTurn: number = 100
  ): Vector2D[] {
    const points: Vector2D[] = [];
    const totalPoints = turns * pointsPerTurn;
    
    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / pointsPerTurn) * TWO_PI;
      const radius = initialRadius + growth * angle;
      
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    
    return points;
  }

  /**
   * Check if a point is inside a polygon
   */
  static pointInPolygon(point: Vector2D, polygon: Vector2D[]): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].y > point.y !== polygon[j].y > point.y &&
        point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x
      ) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * Calculate the centroid of a polygon
   */
  static polygonCentroid(vertices: Vector2D[]): Vector2D {
    let area = 0;
    let centroidX = 0;
    let centroidY = 0;
    
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      const cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
      area += cross;
      centroidX += (vertices[i].x + vertices[j].x) * cross;
      centroidY += (vertices[i].y + vertices[j].y) * cross;
    }
    
    area *= 0.5;
    centroidX /= (6 * area);
    centroidY /= (6 * area);
    
    return { x: centroidX, y: centroidY };
  }

  /**
   * Generate fractal pattern recursively
   */
  static fractalPattern(
    center: Vector2D,
    size: number,
    depth: number,
    generator: (center: Vector2D, size: number) => Vector2D[],
    scaleFactor: number = 0.5
  ): Vector2D[][] {
    const patterns: Vector2D[][] = [];
    
    const generateLevel = (levelCenter: Vector2D, levelSize: number, currentDepth: number) => {
      const pattern = generator(levelCenter, levelSize);
      patterns.push(pattern);
      
      if (currentDepth > 0) {
        // Generate smaller patterns at each vertex
        pattern.forEach(vertex => {
          generateLevel(vertex, levelSize * scaleFactor, currentDepth - 1);
        });
      }
    };
    
    generateLevel(center, size, depth);
    return patterns;
  }
}

export default SacredGeometry;