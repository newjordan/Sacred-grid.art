// src/math/Polyhedra.ts - 3D solid mathematics for polyhedra

import { Vector3D, Vector2D } from '../types';
import { PI, TWO_PI } from '../utils/constants';

/**
 * 3D polyhedra mathematical utilities
 */
export class Polyhedra {
  /**
   * Calculate the centroid of a set of 3D points
   */
  static calculateCentroid(vertices: Vector3D[]): Vector3D {
    if (vertices.length === 0) return { x: 0, y: 0, z: 0 };

    const sum = vertices.reduce(
      (acc, vertex) => ({
        x: acc.x + vertex.x,
        y: acc.y + vertex.y,
        z: acc.z + vertex.z
      }),
      { x: 0, y: 0, z: 0 }
    );

    return {
      x: sum.x / vertices.length,
      y: sum.y / vertices.length,
      z: sum.z / vertices.length
    };
  }

  /**
   * Calculate the distance between two 3D points
   */
  static distance3D(p1: Vector3D, p2: Vector3D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate the cross product of two 3D vectors
   */
  static crossProduct(v1: Vector3D, v2: Vector3D): Vector3D {
    return {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    };
  }

  /**
   * Calculate the dot product of two 3D vectors
   */
  static dotProduct(v1: Vector3D, v2: Vector3D): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  /**
   * Normalize a 3D vector
   */
  static normalize(vector: Vector3D): Vector3D {
    const length = Math.sqrt(
      vector.x * vector.x + 
      vector.y * vector.y + 
      vector.z * vector.z
    );

    if (length === 0) return { x: 0, y: 0, z: 0 };

    return {
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length
    };
  }

  /**
   * Calculate face normal vector
   */
  static calculateFaceNormal(
    vertices: Vector3D[],
    faceIndices: number[]
  ): Vector3D {
    if (faceIndices.length < 3) return { x: 0, y: 0, z: 1 };

    const v1 = vertices[faceIndices[0]];
    const v2 = vertices[faceIndices[1]];
    const v3 = vertices[faceIndices[2]];

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

    // Calculate and normalize cross product
    const normal = this.crossProduct(edge1, edge2);
    return this.normalize(normal);
  }

  /**
   * Calculate face area
   */
  static calculateFaceArea(
    vertices: Vector3D[],
    faceIndices: number[]
  ): number {
    if (faceIndices.length < 3) return 0;

    let area = 0;
    const v0 = vertices[faceIndices[0]];

    // Triangulate the face and sum triangle areas
    for (let i = 1; i < faceIndices.length - 1; i++) {
      const v1 = vertices[faceIndices[i]];
      const v2 = vertices[faceIndices[i + 1]];

      const edge1 = {
        x: v1.x - v0.x,
        y: v1.y - v0.y,
        z: v1.z - v0.z
      };

      const edge2 = {
        x: v2.x - v0.x,
        y: v2.y - v0.y,
        z: v2.z - v0.z
      };

      const cross = this.crossProduct(edge1, edge2);
      const triangleArea = 0.5 * Math.sqrt(
        cross.x * cross.x + 
        cross.y * cross.y + 
        cross.z * cross.z
      );

      area += triangleArea;
    }

    return area;
  }

  /**
   * Calculate polyhedron volume using divergence theorem
   */
  static calculateVolume(
    vertices: Vector3D[],
    faces: number[][]
  ): number {
    let volume = 0;

    for (const face of faces) {
      if (face.length < 3) continue;

      // Get face normal and area
      const normal = this.calculateFaceNormal(vertices, face);
      const area = this.calculateFaceArea(vertices, face);

      // Get a point on the face (use first vertex)
      const facePoint = vertices[face[0]];

      // Calculate contribution to volume
      const contribution = this.dotProduct(facePoint, normal) * area;
      volume += contribution;
    }

    return Math.abs(volume) / 3;
  }

  /**
   * Calculate surface area of polyhedron
   */
  static calculateSurfaceArea(
    vertices: Vector3D[],
    faces: number[][]
  ): number {
    let totalArea = 0;

    for (const face of faces) {
      totalArea += this.calculateFaceArea(vertices, face);
    }

    return totalArea;
  }

  /**
   * Generate vertices for regular polyhedra
   */
  static generateRegularPolyhedronVertices(
    type: 'tetrahedron' | 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron',
    scale: number = 1
  ): Vector3D[] {
    let vertices: Vector3D[] = [];

    switch (type) {
      case 'tetrahedron':
        vertices = [
          { x: 1, y: 1, z: 1 },
          { x: 1, y: -1, z: -1 },
          { x: -1, y: 1, z: -1 },
          { x: -1, y: -1, z: 1 }
        ];
        break;

      case 'cube':
        vertices = [
          { x: -1, y: -1, z: -1 },
          { x: 1, y: -1, z: -1 },
          { x: 1, y: 1, z: -1 },
          { x: -1, y: 1, z: -1 },
          { x: -1, y: -1, z: 1 },
          { x: 1, y: -1, z: 1 },
          { x: 1, y: 1, z: 1 },
          { x: -1, y: 1, z: 1 }
        ];
        break;

      case 'octahedron':
        vertices = [
          { x: 1, y: 0, z: 0 },
          { x: -1, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
          { x: 0, y: -1, z: 0 },
          { x: 0, y: 0, z: 1 },
          { x: 0, y: 0, z: -1 }
        ];
        break;

      case 'dodecahedron':
        const phi = (1 + Math.sqrt(5)) / 2;
        const invPhi = 1 / phi;
        vertices = [
          // Cube vertices
          { x: 1, y: 1, z: 1 },
          { x: 1, y: 1, z: -1 },
          { x: 1, y: -1, z: 1 },
          { x: 1, y: -1, z: -1 },
          { x: -1, y: 1, z: 1 },
          { x: -1, y: 1, z: -1 },
          { x: -1, y: -1, z: 1 },
          { x: -1, y: -1, z: -1 },
          // Additional vertices for dodecahedron
          { x: 0, y: invPhi, z: phi },
          { x: 0, y: invPhi, z: -phi },
          { x: 0, y: -invPhi, z: phi },
          { x: 0, y: -invPhi, z: -phi },
          { x: invPhi, y: phi, z: 0 },
          { x: invPhi, y: -phi, z: 0 },
          { x: -invPhi, y: phi, z: 0 },
          { x: -invPhi, y: -phi, z: 0 },
          { x: phi, y: 0, z: invPhi },
          { x: phi, y: 0, z: -invPhi },
          { x: -phi, y: 0, z: invPhi },
          { x: -phi, y: 0, z: -invPhi }
        ];
        break;

      case 'icosahedron':
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        vertices = [
          { x: 0, y: 1, z: goldenRatio },
          { x: 0, y: 1, z: -goldenRatio },
          { x: 0, y: -1, z: goldenRatio },
          { x: 0, y: -1, z: -goldenRatio },
          { x: 1, y: goldenRatio, z: 0 },
          { x: 1, y: -goldenRatio, z: 0 },
          { x: -1, y: goldenRatio, z: 0 },
          { x: -1, y: -goldenRatio, z: 0 },
          { x: goldenRatio, y: 0, z: 1 },
          { x: goldenRatio, y: 0, z: -1 },
          { x: -goldenRatio, y: 0, z: 1 },
          { x: -goldenRatio, y: 0, z: -1 }
        ];
        break;
    }

    // Scale vertices
    return vertices.map(v => ({
      x: v.x * scale,
      y: v.y * scale,
      z: v.z * scale
    }));
  }

  /**
   * Generate dual polyhedron
   */
  static generateDual(
    vertices: Vector3D[],
    faces: number[][]
  ): {
    vertices: Vector3D[];
    faces: number[][];
  } {
    const dualVertices: Vector3D[] = [];
    const dualFaces: number[][] = [];

    // Each face of the original becomes a vertex of the dual
    for (const face of faces) {
      const faceVertices = face.map(index => vertices[index]);
      const centroid = this.calculateCentroid(faceVertices);
      dualVertices.push(centroid);
    }

    // Each vertex of the original becomes a face of the dual
    for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex++) {
      const adjacentFaces: number[] = [];
      
      // Find all faces that contain this vertex
      faces.forEach((face, faceIndex) => {
        if (face.includes(vertexIndex)) {
          adjacentFaces.push(faceIndex);
        }
      });

      if (adjacentFaces.length >= 3) {
        dualFaces.push(adjacentFaces);
      }
    }

    return {
      vertices: dualVertices,
      faces: dualFaces
    };
  }

  /**
   * Truncate polyhedron (cut off vertices)
   */
  static truncate(
    vertices: Vector3D[],
    faces: number[][],
    truncationRatio: number = 0.3
  ): {
    vertices: Vector3D[];
    faces: number[][];
  } {
    const newVertices: Vector3D[] = [];
    const newFaces: number[][] = [];
    const vertexMap = new Map<string, number>();

    // For each edge, create new vertices
    const edges = new Set<string>();
    faces.forEach(face => {
      for (let i = 0; i < face.length; i++) {
        const v1 = face[i];
        const v2 = face[(i + 1) % face.length];
        const edgeKey = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;
        edges.add(edgeKey);
      }
    });

    // Create new vertices along edges
    edges.forEach(edgeKey => {
      const [v1Str, v2Str] = edgeKey.split('-');
      const v1Index = parseInt(v1Str);
      const v2Index = parseInt(v2Str);
      
      const v1 = vertices[v1Index];
      const v2 = vertices[v2Index];

      // Create two new vertices along this edge
      const newV1 = {
        x: v1.x + truncationRatio * (v2.x - v1.x),
        y: v1.y + truncationRatio * (v2.y - v1.y),
        z: v1.z + truncationRatio * (v2.z - v1.z)
      };

      const newV2 = {
        x: v2.x + truncationRatio * (v1.x - v2.x),
        y: v2.y + truncationRatio * (v1.y - v2.y),
        z: v2.z + truncationRatio * (v1.z - v2.z)
      };

      const key1 = `${v1Index}-${v2Index}`;
      const key2 = `${v2Index}-${v1Index}`;

      vertexMap.set(key1, newVertices.length);
      newVertices.push(newV1);
      
      vertexMap.set(key2, newVertices.length);
      newVertices.push(newV2);
    });

    // Create new faces
    faces.forEach(face => {
      const newFace: number[] = [];
      
      for (let i = 0; i < face.length; i++) {
        const currentVertex = face[i];
        const nextVertex = face[(i + 1) % face.length];
        
        const edgeKey = `${currentVertex}-${nextVertex}`;
        const vertexIndex = vertexMap.get(edgeKey);
        
        if (vertexIndex !== undefined) {
          newFace.push(vertexIndex);
        }
      }
      
      if (newFace.length >= 3) {
        newFaces.push(newFace);
      }
    });

    return {
      vertices: newVertices,
      faces: newFaces
    };
  }

  /**
   * Calculate Euler characteristic (V - E + F)
   */
  static calculateEulerCharacteristic(
    vertexCount: number,
    edgeCount: number,
    faceCount: number
  ): number {
    return vertexCount - edgeCount + faceCount;
  }

  /**
   * Check if polyhedron is convex
   */
  static isConvex(
    vertices: Vector3D[],
    faces: number[][]
  ): boolean {
    const centroid = this.calculateCentroid(vertices);

    for (const face of faces) {
      const normal = this.calculateFaceNormal(vertices, face);
      const faceVertex = vertices[face[0]];
      
      // Vector from face to centroid
      const toCentroid = {
        x: centroid.x - faceVertex.x,
        y: centroid.y - faceVertex.y,
        z: centroid.z - faceVertex.z
      };

      // If dot product is positive, centroid is on the "outside" of this face
      if (this.dotProduct(normal, toCentroid) > 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate geodesic sphere by subdividing icosahedron
   */
  static generateGeodesicSphere(
    radius: number = 1,
    subdivisions: number = 2
  ): {
    vertices: Vector3D[];
    faces: number[][];
  } {
    // Start with icosahedron
    let vertices = this.generateRegularPolyhedronVertices('icosahedron', radius);
    let faces = [
      [0, 2, 8], [0, 8, 4], [0, 4, 6], [0, 6, 10], [0, 10, 2],
      [3, 1, 11], [3, 11, 7], [3, 7, 5], [3, 5, 9], [3, 9, 1],
      [2, 10, 7], [10, 6, 11], [6, 4, 1], [4, 8, 9], [8, 2, 5],
      [1, 9, 11], [11, 9, 7], [7, 9, 5], [5, 9, 8], [2, 7, 5]
    ];

    // Subdivide faces
    for (let sub = 0; sub < subdivisions; sub++) {
      const newVertices = [...vertices];
      const newFaces: number[][] = [];
      const midpointCache = new Map<string, number>();

      const getMidpoint = (v1Index: number, v2Index: number): number => {
        const key = `${Math.min(v1Index, v2Index)}-${Math.max(v1Index, v2Index)}`;
        
        if (midpointCache.has(key)) {
          return midpointCache.get(key)!;
        }

        const v1 = vertices[v1Index];
        const v2 = vertices[v2Index];
        
        const midpoint = {
          x: (v1.x + v2.x) / 2,
          y: (v1.y + v2.y) / 2,
          z: (v1.z + v2.z) / 2
        };

        // Project to sphere surface
        const length = Math.sqrt(
          midpoint.x * midpoint.x + 
          midpoint.y * midpoint.y + 
          midpoint.z * midpoint.z
        );
        
        midpoint.x = (midpoint.x / length) * radius;
        midpoint.y = (midpoint.y / length) * radius;
        midpoint.z = (midpoint.z / length) * radius;

        const newIndex = newVertices.length;
        newVertices.push(midpoint);
        midpointCache.set(key, newIndex);
        
        return newIndex;
      };

      // Subdivide each triangular face into 4 triangles
      faces.forEach(face => {
        if (face.length === 3) {
          const [a, b, c] = face;
          const ab = getMidpoint(a, b);
          const bc = getMidpoint(b, c);
          const ca = getMidpoint(c, a);

          newFaces.push([a, ab, ca]);
          newFaces.push([b, bc, ab]);
          newFaces.push([c, ca, bc]);
          newFaces.push([ab, bc, ca]);
        }
      });

      vertices = newVertices;
      faces = newFaces;
    }

    return { vertices, faces };
  }
}