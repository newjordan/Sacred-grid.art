// src/shapes/MetatronsCube.ts - 13-circle pattern generation

import { Vector2D, Vector3D } from '../types';
import { TWO_PI, PI, SACRED_RATIOS } from '../utils/constants';

/**
 * Metatron's Cube - Sacred geometry pattern consisting of 13 circles
 * arranged in a specific pattern that contains all 5 Platonic solids
 */
export class MetatronsCube {
  /**
   * Generate the 13 circles of Metatron's Cube
   */
  static generate13Circles(
    center: Vector2D,
    radius: number
  ): Array<{ center: Vector2D; radius: number; id: string; layer: number }> {
    const circles: Array<{ center: Vector2D; radius: number; id: string; layer: number }> = [];
    const circleRadius = radius / 6;

    // Central circle (1)
    circles.push({
      center: { ...center },
      radius: circleRadius,
      id: 'center',
      layer: 0
    });

    // Inner hexagon - 6 circles around center (2-7)
    const innerRadius = circleRadius * 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI;
      circles.push({
        center: {
          x: center.x + innerRadius * Math.cos(angle),
          y: center.y + innerRadius * Math.sin(angle)
        },
        radius: circleRadius,
        id: `inner_${i}`,
        layer: 1
      });
    }

    // Outer hexagon - 6 circles on outer ring (8-13)
    const outerRadius = circleRadius * 4;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI + (PI / 6); // Offset by 30 degrees
      circles.push({
        center: {
          x: center.x + outerRadius * Math.cos(angle),
          y: center.y + outerRadius * Math.sin(angle)
        },
        radius: circleRadius,
        id: `outer_${i}`,
        layer: 2
      });
    }

    return circles;
  }

  /**
   * Generate the connecting lines that form the cube structure
   */
  static generateCubeLines(
    circles: Array<{ center: Vector2D; radius: number; id: string; layer: number }>
  ): Array<{ start: Vector2D; end: Vector2D; type: 'primary' | 'secondary' | 'tertiary' }> {
    const lines: Array<{ start: Vector2D; end: Vector2D; type: 'primary' | 'secondary' | 'tertiary' }> = [];
    
    const centerCircle = circles.find(c => c.id === 'center')!;
    const innerCircles = circles.filter(c => c.layer === 1);
    const outerCircles = circles.filter(c => c.layer === 2);

    // Primary lines: Center to all inner circles
    innerCircles.forEach(circle => {
      lines.push({
        start: centerCircle.center,
        end: circle.center,
        type: 'primary'
      });
    });

    // Secondary lines: Inner circle connections (hexagon)
    for (let i = 0; i < innerCircles.length; i++) {
      const current = innerCircles[i];
      const next = innerCircles[(i + 1) % innerCircles.length];
      lines.push({
        start: current.center,
        end: next.center,
        type: 'secondary'
      });
    }

    // Tertiary lines: Inner to outer connections
    for (let i = 0; i < innerCircles.length; i++) {
      const innerCircle = innerCircles[i];
      const outerCircle = outerCircles[i];
      lines.push({
        start: innerCircle.center,
        end: outerCircle.center,
        type: 'tertiary'
      });
    }

    // Additional cube structure lines
    for (let i = 0; i < outerCircles.length; i++) {
      const current = outerCircles[i];
      const next = outerCircles[(i + 1) % outerCircles.length];
      lines.push({
        start: current.center,
        end: next.center,
        type: 'tertiary'
      });
    }

    return lines;
  }

  /**
   * Generate 3D cube vertices projected to 2D
   */
  static generate3DCubeProjection(
    center: Vector2D,
    size: number,
    rotationX: number = 0,
    rotationY: number = 0,
    rotationZ: number = 0
  ): Array<{ point: Vector2D; id: string }> {
    const halfSize = size / 2;
    
    // 8 vertices of a cube in 3D space
    const vertices3D: Array<{ point: Vector3D; id: string }> = [
      { point: { x: -halfSize, y: -halfSize, z: -halfSize }, id: 'v0' },
      { point: { x: halfSize, y: -halfSize, z: -halfSize }, id: 'v1' },
      { point: { x: halfSize, y: halfSize, z: -halfSize }, id: 'v2' },
      { point: { x: -halfSize, y: halfSize, z: -halfSize }, id: 'v3' },
      { point: { x: -halfSize, y: -halfSize, z: halfSize }, id: 'v4' },
      { point: { x: halfSize, y: -halfSize, z: halfSize }, id: 'v5' },
      { point: { x: halfSize, y: halfSize, z: halfSize }, id: 'v6' },
      { point: { x: -halfSize, y: halfSize, z: halfSize }, id: 'v7' }
    ];

    // Apply rotations and project to 2D
    return vertices3D.map(vertex => {
      let { x, y, z } = vertex.point;

      // Rotation around X axis
      if (rotationX !== 0) {
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const newY = y * cosX - z * sinX;
        const newZ = y * sinX + z * cosX;
        y = newY;
        z = newZ;
      }

      // Rotation around Y axis
      if (rotationY !== 0) {
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const newX = x * cosY + z * sinY;
        const newZ = -x * sinY + z * cosY;
        x = newX;
        z = newZ;
      }

      // Rotation around Z axis
      if (rotationZ !== 0) {
        const cosZ = Math.cos(rotationZ);
        const sinZ = Math.sin(rotationZ);
        const newX = x * cosZ - y * sinZ;
        const newY = x * sinZ + y * cosZ;
        x = newX;
        y = newY;
      }

      // Simple orthographic projection (ignore z for 2D)
      return {
        point: {
          x: center.x + x,
          y: center.y + y
        },
        id: vertex.id
      };
    });
  }

  /**
   * Generate cube edges for wireframe rendering
   */
  static generateCubeEdges(): Array<{ start: string; end: string }> {
    return [
      // Bottom face
      { start: 'v0', end: 'v1' },
      { start: 'v1', end: 'v2' },
      { start: 'v2', end: 'v3' },
      { start: 'v3', end: 'v0' },
      // Top face
      { start: 'v4', end: 'v5' },
      { start: 'v5', end: 'v6' },
      { start: 'v6', end: 'v7' },
      { start: 'v7', end: 'v4' },
      // Vertical edges
      { start: 'v0', end: 'v4' },
      { start: 'v1', end: 'v5' },
      { start: 'v2', end: 'v6' },
      { start: 'v3', end: 'v7' }
    ];
  }

  /**
   * Generate the Star Tetrahedron (Merkaba) within Metatron's Cube
   */
  static generateStarTetrahedron(
    center: Vector2D,
    size: number,
    rotation: number = 0
  ): {
    upwardTetrahedron: Vector2D[];
    downwardTetrahedron: Vector2D[];
  } {
    const radius = size / 2;
    
    // Upward pointing tetrahedron (4 vertices)
    const upwardTetrahedron: Vector2D[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * TWO_PI + rotation;
      upwardTetrahedron.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    // Add the top vertex
    upwardTetrahedron.push({
      x: center.x,
      y: center.y - radius * 0.8
    });

    // Downward pointing tetrahedron (inverted)
    const downwardTetrahedron: Vector2D[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * TWO_PI + rotation + PI;
      downwardTetrahedron.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    // Add the bottom vertex
    downwardTetrahedron.push({
      x: center.x,
      y: center.y + radius * 0.8
    });

    return { upwardTetrahedron, downwardTetrahedron };
  }

  /**
   * Generate the Flower of Life pattern that emerges from Metatron's Cube
   */
  static generateFlowerOfLife(
    center: Vector2D,
    radius: number,
    rings: number = 2
  ): Array<{ center: Vector2D; radius: number; id: string }> {
    const circles: Array<{ center: Vector2D; radius: number; id: string }> = [];
    const circleRadius = radius / 6;

    // Central circle
    circles.push({
      center: { ...center },
      radius: circleRadius,
      id: 'flower_center'
    });

    // Generate rings
    for (let ring = 1; ring <= rings; ring++) {
      const ringRadius = ring * circleRadius * Math.sqrt(3);
      const circlesInRing = ring * 6;

      for (let i = 0; i < circlesInRing; i++) {
        const angle = (i / circlesInRing) * TWO_PI;
        circles.push({
          center: {
            x: center.x + ringRadius * Math.cos(angle),
            y: center.y + ringRadius * Math.sin(angle)
          },
          radius: circleRadius,
          id: `flower_ring${ring}_${i}`
        });
      }
    }

    return circles;
  }

  /**
   * Generate sacred proportions based on Metatron's Cube
   */
  static generateSacredProportions(baseRadius: number): {
    innerRadius: number;
    outerRadius: number;
    circleRadius: number;
    goldenRatio: number;
    vesicaPiscis: number;
  } {
    const circleRadius = baseRadius / 6;
    const innerRadius = circleRadius * 2;
    const outerRadius = circleRadius * 4;

    return {
      innerRadius,
      outerRadius,
      circleRadius,
      goldenRatio: baseRadius * SACRED_RATIOS.GOLDEN,
      vesicaPiscis: baseRadius * SACRED_RATIOS.VESICA_PISCIS
    };
  }

  /**
   * Generate animated rotation values for 3D effect
   */
  static generateRotationAnimation(
    time: number,
    speedX: number = 0.01,
    speedY: number = 0.007,
    speedZ: number = 0.013
  ): { rotationX: number; rotationY: number; rotationZ: number } {
    return {
      rotationX: time * speedX,
      rotationY: time * speedY,
      rotationZ: time * speedZ
    };
  }

  /**
   * Check if a point is within the Metatron's Cube pattern
   */
  static isPointInPattern(
    point: Vector2D,
    center: Vector2D,
    radius: number
  ): boolean {
    const distance = Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
    );
    return distance <= radius;
  }

  /**
   * Generate color mapping for different elements
   */
  static generateColorMapping(): {
    center: string;
    innerRing: string;
    outerRing: string;
    primaryLines: string;
    secondaryLines: string;
    tertiaryLines: string;
  } {
    return {
      center: '#ffffff',
      innerRing: '#00ffcc',
      outerRing: '#0077ff',
      primaryLines: '#ffffff',
      secondaryLines: '#00ffcc',
      tertiaryLines: '#0077ff'
    };
  }
}

export default MetatronsCube;