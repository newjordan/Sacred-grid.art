// src/rendering/WireframeRenderer.ts - 3D wireframe rendering with depth sorting

import { Vector2D, Vector3D } from '../types';

/**
 * Wireframe line segment
 */
export interface WireframeLine {
  start: Vector2D;
  end: Vector2D;
  depth: number;
  visible: boolean;
  strokeWidth?: number;
  color?: string;
  opacity?: number;
}

/**
 * Wireframe face for hidden surface removal
 */
export interface WireframeFace {
  vertices: Vector2D[];
  normal: Vector3D;
  depth: number;
  visible: boolean;
}

/**
 * 3D wireframe renderer with hidden line removal
 */
export class WireframeRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  /**
   * Render wireframe with basic depth sorting
   */
  renderBasicWireframe(
    lines: Array<{
      start: Vector2D;
      end: Vector2D;
      depth?: number;
    }>,
    options: {
      strokeWidth?: number;
      color?: string;
      opacity?: number;
      sortByDepth?: boolean;
    } = {}
  ): void {
    const {
      strokeWidth = 1,
      color = '#ffffff',
      opacity = 1,
      sortByDepth = true
    } = options;

    // Calculate depth for each line if not provided
    const wireframeLines: WireframeLine[] = lines.map(line => ({
      ...line,
      depth: line.depth ?? (line.start.x + line.start.y + line.end.x + line.end.y) / 4,
      visible: true,
      strokeWidth,
      color,
      opacity
    }));

    // Sort by depth (farthest first)
    if (sortByDepth) {
      wireframeLines.sort((a, b) => a.depth - b.depth);
    }

    // Render lines
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = strokeWidth;

    wireframeLines.forEach(line => {
      if (line.visible) {
        this.ctx.beginPath();
        this.ctx.moveTo(line.start.x, line.start.y);
        this.ctx.lineTo(line.end.x, line.end.y);
        this.ctx.stroke();
      }
    });

    this.ctx.restore();
  }

  /**
   * Render wireframe with hidden line removal
   */
  renderWithHiddenLineRemoval(
    vertices3D: Vector3D[],
    vertices2D: Vector2D[],
    edges: [number, number][],
    faces: number[][],
    viewDirection: Vector3D = { x: 0, y: 0, z: -1 },
    options: {
      strokeWidth?: number;
      visibleColor?: string;
      hiddenColor?: string;
      showHiddenLines?: boolean;
      hiddenLineStyle?: 'dashed' | 'dotted' | 'none';
    } = {}
  ): void {
    const {
      strokeWidth = 1,
      visibleColor = '#ffffff',
      hiddenColor = '#666666',
      showHiddenLines = true,
      hiddenLineStyle = 'dashed'
    } = options;

    // Calculate face visibility and normals
    const wireframeFaces: WireframeFace[] = faces.map(face => {
      const faceVertices2D = face.map(index => vertices2D[index]);
      const normal = this.calculateFaceNormal(vertices3D, face);
      const depth = this.calculateFaceDepth(vertices3D, face);
      const visible = this.dotProduct(normal, viewDirection) < 0; // Back-face culling

      return {
        vertices: faceVertices2D,
        normal,
        depth,
        visible
      };
    });

    // Sort faces by depth
    wireframeFaces.sort((a, b) => a.depth - b.depth);

    // Determine line visibility
    const wireframeLines: WireframeLine[] = edges.map(([startIndex, endIndex]) => {
      const start = vertices2D[startIndex];
      const end = vertices2D[endIndex];
      const depth = (vertices3D[startIndex].z + vertices3D[endIndex].z) / 2;

      // Check if line is hidden by any face
      let visible = true;
      for (const face of wireframeFaces) {
        if (face.visible && this.isLineHiddenByFace(start, end, face.vertices)) {
          visible = false;
          break;
        }
      }

      return {
        start,
        end,
        depth,
        visible,
        strokeWidth,
        color: visible ? visibleColor : hiddenColor
      };
    });

    // Render visible lines
    this.ctx.save();
    this.ctx.lineWidth = strokeWidth;

    // Render hidden lines first (if enabled)
    if (showHiddenLines) {
      this.ctx.strokeStyle = hiddenColor;
      
      if (hiddenLineStyle === 'dashed') {
        this.ctx.setLineDash([5, 5]);
      } else if (hiddenLineStyle === 'dotted') {
        this.ctx.setLineDash([2, 3]);
      }

      wireframeLines
        .filter(line => !line.visible)
        .forEach(line => {
          this.ctx.beginPath();
          this.ctx.moveTo(line.start.x, line.start.y);
          this.ctx.lineTo(line.end.x, line.end.y);
          this.ctx.stroke();
        });
    }

    // Render visible lines
    this.ctx.setLineDash([]);
    this.ctx.strokeStyle = visibleColor;

    wireframeLines
      .filter(line => line.visible)
      .forEach(line => {
        this.ctx.beginPath();
        this.ctx.moveTo(line.start.x, line.start.y);
        this.ctx.lineTo(line.end.x, line.end.y);
        this.ctx.stroke();
      });

    this.ctx.restore();
  }

  /**
   * Render wireframe with vertex highlighting
   */
  renderWithVertices(
    vertices2D: Vector2D[],
    edges: [number, number][],
    options: {
      strokeWidth?: number;
      lineColor?: string;
      vertexColor?: string;
      vertexRadius?: number;
      showVertexLabels?: boolean;
      labelColor?: string;
      labelFont?: string;
    } = {}
  ): void {
    const {
      strokeWidth = 1,
      lineColor = '#ffffff',
      vertexColor = '#ff6b6b',
      vertexRadius = 3,
      showVertexLabels = false,
      labelColor = '#ffffff',
      labelFont = '12px Arial'
    } = options;

    this.ctx.save();

    // Render edges
    this.ctx.strokeStyle = lineColor;
    this.ctx.lineWidth = strokeWidth;

    edges.forEach(([startIndex, endIndex]) => {
      const start = vertices2D[startIndex];
      const end = vertices2D[endIndex];

      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    });

    // Render vertices
    this.ctx.fillStyle = vertexColor;

    vertices2D.forEach((vertex, index) => {
      this.ctx.beginPath();
      this.ctx.arc(vertex.x, vertex.y, vertexRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Render vertex labels
      if (showVertexLabels) {
        this.ctx.fillStyle = labelColor;
        this.ctx.font = labelFont;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
          index.toString(),
          vertex.x,
          vertex.y - vertexRadius - 8
        );
        this.ctx.fillStyle = vertexColor;
      }
    });

    this.ctx.restore();
  }

  /**
   * Render animated wireframe rotation
   */
  renderAnimatedWireframe(
    vertices3D: Vector3D[],
    edges: [number, number][],
    center: Vector2D,
    scale: number,
    rotationX: number,
    rotationY: number,
    rotationZ: number,
    options: {
      strokeWidth?: number;
      color?: string;
      showTrails?: boolean;
      trailLength?: number;
    } = {}
  ): void {
    const {
      strokeWidth = 1,
      color = '#ffffff',
      showTrails = false,
      trailLength = 10
    } = options;

    // Apply rotations and project to 2D
    const rotatedVertices = vertices3D.map(vertex => 
      this.rotateVertex(vertex, rotationX, rotationY, rotationZ)
    );

    const vertices2D = rotatedVertices.map(vertex => ({
      x: center.x + vertex.x * scale,
      y: center.y + vertex.y * scale
    }));

    // Store trail positions if enabled
    if (showTrails) {
      // Implementation would require storing previous frame positions
      // This is a simplified version
    }

    // Render wireframe
    this.renderBasicWireframe(
      edges.map(([startIndex, endIndex]) => ({
        start: vertices2D[startIndex],
        end: vertices2D[endIndex],
        depth: rotatedVertices[startIndex].z + rotatedVertices[endIndex].z
      })),
      { strokeWidth, color, sortByDepth: true }
    );
  }

  /**
   * Render wireframe with lighting effects
   */
  renderWithLighting(
    vertices3D: Vector3D[],
    vertices2D: Vector2D[],
    edges: [number, number][],
    faces: number[][],
    lightDirection: Vector3D = { x: 0, y: 0, z: -1 },
    options: {
      baseColor?: string;
      ambientStrength?: number;
      diffuseStrength?: number;
    } = {}
  ): void {
    const {
      baseColor = '#ffffff',
      ambientStrength = 0.3,
      diffuseStrength = 0.7
    } = options;

    // Calculate lighting for each face
    const faceLighting = faces.map(face => {
      const normal = this.calculateFaceNormal(vertices3D, face);
      const lightIntensity = Math.max(0, -this.dotProduct(normal, lightDirection));
      return ambientStrength + diffuseStrength * lightIntensity;
    });

    // Render edges with lighting-based opacity
    this.ctx.save();

    edges.forEach(([startIndex, endIndex]) => {
      const start = vertices2D[startIndex];
      const end = vertices2D[endIndex];

      // Find faces that share this edge
      const sharedFaces = faces.filter(face => 
        face.includes(startIndex) && face.includes(endIndex)
      );

      // Calculate average lighting for this edge
      let avgLighting = 1;
      if (sharedFaces.length > 0) {
        const faceIndices = sharedFaces.map(face => faces.indexOf(face));
        avgLighting = faceIndices.reduce((sum, index) => 
          sum + faceLighting[index], 0
        ) / faceIndices.length;
      }

      // Render edge with lighting-based opacity
      this.ctx.globalAlpha = avgLighting;
      this.ctx.strokeStyle = baseColor;
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  /**
   * Helper: Calculate face normal
   */
  private calculateFaceNormal(vertices3D: Vector3D[], face: number[]): Vector3D {
    if (face.length < 3) return { x: 0, y: 0, z: 1 };

    const v1 = vertices3D[face[0]];
    const v2 = vertices3D[face[1]];
    const v3 = vertices3D[face[2]];

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

    const normal = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x
    };

    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (length > 0) {
      normal.x /= length;
      normal.y /= length;
      normal.z /= length;
    }

    return normal;
  }

  /**
   * Helper: Calculate face depth (average Z of vertices)
   */
  private calculateFaceDepth(vertices3D: Vector3D[], face: number[]): number {
    const totalZ = face.reduce((sum, index) => sum + vertices3D[index].z, 0);
    return totalZ / face.length;
  }

  /**
   * Helper: Check if line is hidden by face
   */
  private isLineHiddenByFace(
    lineStart: Vector2D,
    lineEnd: Vector2D,
    faceVertices: Vector2D[]
  ): boolean {
    // Simplified implementation - check if line midpoint is inside face
    const midpoint = {
      x: (lineStart.x + lineEnd.x) / 2,
      y: (lineStart.y + lineEnd.y) / 2
    };

    return this.isPointInPolygon(midpoint, faceVertices);
  }

  /**
   * Helper: Point in polygon test
   */
  private isPointInPolygon(point: Vector2D, polygon: Vector2D[]): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * Helper: Dot product of 3D vectors
   */
  private dotProduct(v1: Vector3D, v2: Vector3D): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  /**
   * Helper: Rotate vertex around X, Y, Z axes
   */
  private rotateVertex(
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
   * Clear canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Set canvas background
   */
  setBackground(color: string): void {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }
}