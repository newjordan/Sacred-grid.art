// src/shapes/PlatonicSolids.ts - 2D projections of the 5 Platonic solids

import { Vector2D, Vector3D } from '../types';
import { PI, TWO_PI } from '../utils/constants';

/**
 * 3D vertex and face data for Platonic solids
 */
export interface Solid3D {
  vertices: Vector3D[];
  faces: number[][];
  edges: [number, number][];
  name: string;
}

/**
 * 2D projection data
 */
export interface SolidProjection {
  vertices2D: Vector2D[];
  faces: number[][];
  edges: [number, number][];
  name: string;
  center: Vector2D;
  scale: number;
}

/**
 * Platonic solids implementation with 2D projections
 */
export class PlatonicSolids {
  /**
   * Generate tetrahedron (4 faces, 4 vertices, 6 edges)
   */
  static generateTetrahedron(): Solid3D {
    const a = 1 / Math.sqrt(3);
    
    const vertices: Vector3D[] = [
      { x: a, y: a, z: a },
      { x: -a, y: -a, z: a },
      { x: -a, y: a, z: -a },
      { x: a, y: -a, z: -a }
    ];

    const faces: number[][] = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2]
    ];

    const edges: [number, number][] = [
      [0, 1], [0, 2], [0, 3],
      [1, 2], [1, 3], [2, 3]
    ];

    return { vertices, faces, edges, name: 'Tetrahedron' };
  }

  /**
   * Generate cube/hexahedron (6 faces, 8 vertices, 12 edges)
   */
  static generateCube(): Solid3D {
    const vertices: Vector3D[] = [
      { x: -1, y: -1, z: -1 }, // 0
      { x: 1, y: -1, z: -1 },  // 1
      { x: 1, y: 1, z: -1 },   // 2
      { x: -1, y: 1, z: -1 },  // 3
      { x: -1, y: -1, z: 1 },  // 4
      { x: 1, y: -1, z: 1 },   // 5
      { x: 1, y: 1, z: 1 },    // 6
      { x: -1, y: 1, z: 1 }    // 7
    ];

    const faces: number[][] = [
      [0, 1, 2, 3], // bottom
      [4, 7, 6, 5], // top
      [0, 4, 5, 1], // front
      [2, 6, 7, 3], // back
      [0, 3, 7, 4], // left
      [1, 5, 6, 2]  // right
    ];

    const edges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0], // bottom face
      [4, 5], [5, 6], [6, 7], [7, 4], // top face
      [0, 4], [1, 5], [2, 6], [3, 7]  // vertical edges
    ];

    return { vertices, faces, edges, name: 'Cube' };
  }

  /**
   * Generate octahedron (8 faces, 6 vertices, 12 edges)
   */
  static generateOctahedron(): Solid3D {
    const vertices: Vector3D[] = [
      { x: 1, y: 0, z: 0 },   // +X
      { x: -1, y: 0, z: 0 },  // -X
      { x: 0, y: 1, z: 0 },   // +Y
      { x: 0, y: -1, z: 0 },  // -Y
      { x: 0, y: 0, z: 1 },   // +Z
      { x: 0, y: 0, z: -1 }   // -Z
    ];

    const faces: number[][] = [
      [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], // faces around +X vertex
      [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]  // faces around -X vertex
    ];

    const edges: [number, number][] = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [2, 5], [3, 4], [3, 5]
    ];

    return { vertices, faces, edges, name: 'Octahedron' };
  }

  /**
   * Generate dodecahedron (12 faces, 20 vertices, 30 edges)
   */
  static generateDodecahedron(): Solid3D {
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const invPhi = 1 / phi;

    const vertices: Vector3D[] = [
      // Cube vertices
      { x: 1, y: 1, z: 1 },
      { x: 1, y: 1, z: -1 },
      { x: 1, y: -1, z: 1 },
      { x: 1, y: -1, z: -1 },
      { x: -1, y: 1, z: 1 },
      { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 },
      { x: -1, y: -1, z: -1 },
      
      // Rectangle in YZ plane
      { x: 0, y: invPhi, z: phi },
      { x: 0, y: invPhi, z: -phi },
      { x: 0, y: -invPhi, z: phi },
      { x: 0, y: -invPhi, z: -phi },
      
      // Rectangle in XZ plane
      { x: invPhi, y: phi, z: 0 },
      { x: invPhi, y: -phi, z: 0 },
      { x: -invPhi, y: phi, z: 0 },
      { x: -invPhi, y: -phi, z: 0 },
      
      // Rectangle in XY plane
      { x: phi, y: 0, z: invPhi },
      { x: phi, y: 0, z: -invPhi },
      { x: -phi, y: 0, z: invPhi },
      { x: -phi, y: 0, z: -invPhi }
    ];

    // Simplified face definition (pentagonal faces)
    const faces: number[][] = [
      [0, 16, 2, 10, 8],
      [0, 8, 4, 14, 12],
      [16, 17, 1, 12, 0],
      [1, 9, 11, 3, 17],
      [1, 17, 16, 0, 12],
      [2, 13, 15, 6, 10],
      [13, 3, 11, 7, 15],
      [2, 16, 17, 3, 13],
      [4, 8, 10, 6, 18],
      [14, 5, 19, 18, 4],
      [5, 9, 1, 12, 14],
      [19, 7, 11, 9, 5]
    ];

    // Generate edges from faces
    const edges: [number, number][] = [];
    const edgeSet = new Set<string>();
    
    faces.forEach(face => {
      for (let i = 0; i < face.length; i++) {
        const v1 = face[i];
        const v2 = face[(i + 1) % face.length];
        const edgeKey = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;
        
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push([v1, v2]);
        }
      }
    });

    return { vertices, faces, edges, name: 'Dodecahedron' };
  }

  /**
   * Generate icosahedron (20 faces, 12 vertices, 30 edges)
   */
  static generateIcosahedron(): Solid3D {
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio

    const vertices: Vector3D[] = [
      // Rectangle in YZ plane
      { x: 0, y: 1, z: phi },
      { x: 0, y: 1, z: -phi },
      { x: 0, y: -1, z: phi },
      { x: 0, y: -1, z: -phi },
      
      // Rectangle in XZ plane
      { x: 1, y: phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: -1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      
      // Rectangle in XY plane
      { x: phi, y: 0, z: 1 },
      { x: phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 }
    ];

    const faces: number[][] = [
      [0, 2, 8], [0, 8, 4], [0, 4, 6], [0, 6, 10], [0, 10, 2],
      [3, 1, 11], [3, 11, 7], [3, 7, 5], [3, 5, 9], [3, 9, 1],
      [2, 10, 7], [10, 6, 11], [6, 4, 1], [4, 8, 9], [8, 2, 5],
      [1, 9, 11], [11, 9, 7], [7, 9, 5], [5, 9, 8], [2, 7, 5]
    ];

    // Generate edges from faces
    const edges: [number, number][] = [];
    const edgeSet = new Set<string>();
    
    faces.forEach(face => {
      for (let i = 0; i < face.length; i++) {
        const v1 = face[i];
        const v2 = face[(i + 1) % face.length];
        const edgeKey = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;
        
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push([v1, v2]);
        }
      }
    });

    return { vertices, faces, edges, name: 'Icosahedron' };
  }

  /**
   * Get all five Platonic solids
   */
  static getAllSolids(): Solid3D[] {
    return [
      this.generateTetrahedron(),
      this.generateCube(),
      this.generateOctahedron(),
      this.generateDodecahedron(),
      this.generateIcosahedron()
    ];
  }

  /**
   * Project 3D solid to 2D using orthographic projection
   */
  static projectOrthographic(
    solid: Solid3D,
    center: Vector2D,
    scale: number = 100,
    rotationX: number = 0,
    rotationY: number = 0,
    rotationZ: number = 0
  ): SolidProjection {
    // Apply rotations
    const rotatedVertices = solid.vertices.map(vertex => {
      return this.rotateVertex(vertex, rotationX, rotationY, rotationZ);
    });

    // Project to 2D (orthographic projection - just drop Z coordinate)
    const vertices2D: Vector2D[] = rotatedVertices.map(vertex => ({
      x: center.x + vertex.x * scale,
      y: center.y + vertex.y * scale
    }));

    return {
      vertices2D,
      faces: solid.faces,
      edges: solid.edges,
      name: solid.name,
      center,
      scale
    };
  }

  /**
   * Project 3D solid to 2D using perspective projection
   */
  static projectPerspective(
    solid: Solid3D,
    center: Vector2D,
    scale: number = 100,
    distance: number = 5,
    rotationX: number = 0,
    rotationY: number = 0,
    rotationZ: number = 0
  ): SolidProjection {
    // Apply rotations
    const rotatedVertices = solid.vertices.map(vertex => {
      return this.rotateVertex(vertex, rotationX, rotationY, rotationZ);
    });

    // Project to 2D using perspective projection
    const vertices2D: Vector2D[] = rotatedVertices.map(vertex => {
      const projectedZ = distance + vertex.z;
      const perspectiveFactor = distance / Math.max(projectedZ, 0.1);
      
      return {
        x: center.x + vertex.x * scale * perspectiveFactor,
        y: center.y + vertex.y * scale * perspectiveFactor
      };
    });

    return {
      vertices2D,
      faces: solid.faces,
      edges: solid.edges,
      name: solid.name,
      center,
      scale
    };
  }

  /**
   * Rotate a 3D vertex around X, Y, and Z axes
   */
  private static rotateVertex(
    vertex: Vector3D,
    rotX: number,
    rotY: number,
    rotZ: number
  ): Vector3D {
    let { x, y, z } = vertex;

    // Rotation around X axis
    if (rotX !== 0) {
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const newY = y * cosX - z * sinX;
      const newZ = y * sinX + z * cosX;
      y = newY;
      z = newZ;
    }

    // Rotation around Y axis
    if (rotY !== 0) {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const newX = x * cosY + z * sinY;
      const newZ = -x * sinY + z * cosY;
      x = newX;
      z = newZ;
    }

    // Rotation around Z axis
    if (rotZ !== 0) {
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);
      const newX = x * cosZ - y * sinZ;
      const newY = x * sinZ + y * cosZ;
      x = newX;
      y = newY;
    }

    return { x, y, z };
  }

  /**
   * Calculate face normal for lighting/shading
   */
  static calculateFaceNormal(
    vertices: Vector3D[],
    face: number[]
  ): Vector3D {
    if (face.length < 3) return { x: 0, y: 0, z: 1 };

    const v1 = vertices[face[0]];
    const v2 = vertices[face[1]];
    const v3 = vertices[face[2]];

    // Calculate two edge vectors
    const edge1 = {
      x: v2.x - v1.x,
      y: v2.y - v1.y,
      z: v2.z - v1.z
    };

    const edge2 = {
      x: v3.x - v1.x,
      y: v3.y - v1.y,
      z: v3.z - v1.z
    };

    // Calculate cross product (normal)
    const normal = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x
    };

    // Normalize
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (length > 0) {
      normal.x /= length;
      normal.y /= length;
      normal.z /= length;
    }

    return normal;
  }

  /**
   * Sort faces by depth for proper rendering order
   */
  static sortFacesByDepth(
    vertices: Vector3D[],
    faces: number[][],
    viewDirection: Vector3D = { x: 0, y: 0, z: -1 }
  ): number[] {
    const faceDepths = faces.map((face, index) => {
      // Calculate face center
      let centerX = 0, centerY = 0, centerZ = 0;
      face.forEach(vertexIndex => {
        const vertex = vertices[vertexIndex];
        centerX += vertex.x;
        centerY += vertex.y;
        centerZ += vertex.z;
      });
      centerX /= face.length;
      centerY /= face.length;
      centerZ /= face.length;

      // Calculate depth (distance from viewer)
      const depth = centerX * viewDirection.x + 
                   centerY * viewDirection.y + 
                   centerZ * viewDirection.z;

      return { index, depth };
    });

    // Sort by depth (farthest first for proper rendering)
    faceDepths.sort((a, b) => a.depth - b.depth);
    
    return faceDepths.map(item => item.index);
  }

  /**
   * Generate wireframe data for rendering
   */
  static generateWireframe(projection: SolidProjection): {
    lines: Array<{ start: Vector2D; end: Vector2D }>;
    vertices: Vector2D[];
  } {
    const lines = projection.edges.map(([startIndex, endIndex]) => ({
      start: projection.vertices2D[startIndex],
      end: projection.vertices2D[endIndex]
    }));

    return {
      lines,
      vertices: projection.vertices2D
    };
  }
}