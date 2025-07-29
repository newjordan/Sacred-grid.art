// src/morphing/ShapeMorpher.ts - Shape morphing engine with vertex interpolation

import { Vector2D } from '../types';

/**
 * Morph target configuration
 */
export interface MorphTarget {
  id: string;
  name: string;
  vertices: Vector2D[];
  weight: number; // 0-1, how much this target influences the result
}

/**
 * Morph configuration
 */
export interface MorphConfig {
  interpolationMethod: 'linear' | 'cubic' | 'smooth';
  preserveArea: boolean;
  normalizeVertices: boolean;
  smoothingFactor: number;
}

/**
 * Vertex correspondence for morphing
 */
export interface VertexCorrespondence {
  sourceIndex: number;
  targetIndex: number;
  weight: number;
}

/**
 * Shape morphing engine
 */
export class ShapeMorpher {
  private sourceShape: Vector2D[] = [];
  private targets: Map<string, MorphTarget> = new Map();
  private config: MorphConfig;
  private correspondences: Map<string, VertexCorrespondence[]> = new Map();

  constructor(config: Partial<MorphConfig> = {}) {
    this.config = {
      interpolationMethod: 'linear',
      preserveArea: false,
      normalizeVertices: true,
      smoothingFactor: 0.5,
      ...config
    };
  }

  /**
   * Set the source shape
   */
  setSourceShape(vertices: Vector2D[]): void {
    this.sourceShape = this.config.normalizeVertices ? 
                      this.normalizeVertices(vertices) : 
                      [...vertices];
  }

  /**
   * Add a morph target
   */
  addTarget(target: MorphTarget): void {
    const normalizedTarget = {
      ...target,
      vertices: this.config.normalizeVertices ? 
                this.normalizeVertices(target.vertices) : 
                [...target.vertices]
    };
    
    this.targets.set(target.id, normalizedTarget);
    
    // Calculate vertex correspondences
    this.calculateCorrespondences(target.id, normalizedTarget.vertices);
  }

  /**
   * Remove a morph target
   */
  removeTarget(targetId: string): boolean {
    const removed = this.targets.delete(targetId);
    if (removed) {
      this.correspondences.delete(targetId);
    }
    return removed;
  }

  /**
   * Update target weight
   */
  setTargetWeight(targetId: string, weight: number): boolean {
    const target = this.targets.get(targetId);
    if (!target) return false;
    
    target.weight = Math.max(0, Math.min(1, weight));
    return true;
  }

  /**
   * Morph the source shape based on current target weights
   */
  morph(): Vector2D[] {
    if (this.sourceShape.length === 0) return [];
    
    const result: Vector2D[] = this.sourceShape.map(vertex => ({ ...vertex }));
    
    // Apply each target's influence
    this.targets.forEach(target => {
      if (target.weight > 0) {
        this.applyTargetInfluence(result, target);
      }
    });

    // Apply smoothing if configured
    if (this.config.smoothingFactor > 0) {
      return this.smoothVertices(result);
    }

    return result;
  }

  /**
   * Morph between two specific shapes
   */
  morphBetween(
    shape1: Vector2D[],
    shape2: Vector2D[],
    t: number // 0-1, interpolation factor
  ): Vector2D[] {
    t = Math.max(0, Math.min(1, t));
    
    // Ensure both shapes have the same number of vertices
    const [normalizedShape1, normalizedShape2] = this.matchVertexCounts(shape1, shape2);
    
    const result: Vector2D[] = [];
    
    for (let i = 0; i < normalizedShape1.length; i++) {
      const v1 = normalizedShape1[i];
      const v2 = normalizedShape2[i];
      
      let interpolatedVertex: Vector2D;
      
      switch (this.config.interpolationMethod) {
        case 'linear':
          interpolatedVertex = this.linearInterpolate(v1, v2, t);
          break;
        case 'cubic':
          interpolatedVertex = this.cubicInterpolate(v1, v2, t, i, normalizedShape1, normalizedShape2);
          break;
        case 'smooth':
          interpolatedVertex = this.smoothInterpolate(v1, v2, t);
          break;
        default:
          interpolatedVertex = this.linearInterpolate(v1, v2, t);
      }
      
      result.push(interpolatedVertex);
    }

    // Preserve area if configured
    if (this.config.preserveArea) {
      return this.preserveShapeArea(result, shape1);
    }

    return result;
  }

  /**
   * Create smooth transition between multiple shapes
   */
  morphSequence(
    shapes: Vector2D[][],
    t: number // 0-1, position in sequence
  ): Vector2D[] {
    if (shapes.length === 0) return [];
    if (shapes.length === 1) return [...shapes[0]];
    
    t = Math.max(0, Math.min(1, t));
    
    // Find which two shapes to interpolate between
    const segmentLength = 1 / (shapes.length - 1);
    const segmentIndex = Math.floor(t / segmentLength);
    const localT = (t % segmentLength) / segmentLength;
    
    const shape1 = shapes[Math.min(segmentIndex, shapes.length - 1)];
    const shape2 = shapes[Math.min(segmentIndex + 1, shapes.length - 1)];
    
    return this.morphBetween(shape1, shape2, localT);
  }

  /**
   * Apply target influence to result vertices
   */
  private applyTargetInfluence(result: Vector2D[], target: MorphTarget): void {
    const correspondences = this.correspondences.get(target.id);
    if (!correspondences) return;
    
    correspondences.forEach(correspondence => {
      const sourceVertex = result[correspondence.sourceIndex];
      const targetVertex = target.vertices[correspondence.targetIndex];
      
      if (sourceVertex && targetVertex) {
        const influence = target.weight * correspondence.weight;
        
        sourceVertex.x += (targetVertex.x - sourceVertex.x) * influence;
        sourceVertex.y += (targetVertex.y - sourceVertex.y) * influence;
      }
    });
  }

  /**
   * Calculate vertex correspondences between source and target
   */
  private calculateCorrespondences(targetId: string, targetVertices: Vector2D[]): void {
    const correspondences: VertexCorrespondence[] = [];
    
    // Simple nearest-neighbor correspondence
    this.sourceShape.forEach((sourceVertex, sourceIndex) => {
      let minDistance = Infinity;
      let bestTargetIndex = 0;
      
      targetVertices.forEach((targetVertex, targetIndex) => {
        const distance = this.calculateDistance(sourceVertex, targetVertex);
        if (distance < minDistance) {
          minDistance = distance;
          bestTargetIndex = targetIndex;
        }
      });
      
      correspondences.push({
        sourceIndex,
        targetIndex: bestTargetIndex,
        weight: 1 // Could be adjusted based on distance
      });
    });
    
    this.correspondences.set(targetId, correspondences);
  }

  /**
   * Match vertex counts between two shapes
   */
  private matchVertexCounts(shape1: Vector2D[], shape2: Vector2D[]): [Vector2D[], Vector2D[]] {
    const maxVertices = Math.max(shape1.length, shape2.length);
    
    const normalizedShape1 = this.resampleShape(shape1, maxVertices);
    const normalizedShape2 = this.resampleShape(shape2, maxVertices);
    
    return [normalizedShape1, normalizedShape2];
  }

  /**
   * Resample shape to have a specific number of vertices
   */
  private resampleShape(shape: Vector2D[], targetVertexCount: number): Vector2D[] {
    if (shape.length === targetVertexCount) return [...shape];
    if (shape.length === 0) return [];
    
    const result: Vector2D[] = [];
    const totalLength = this.calculatePerimeter(shape);
    const segmentLength = totalLength / targetVertexCount;
    
    let currentLength = 0;
    let currentSegmentIndex = 0;
    
    for (let i = 0; i < targetVertexCount; i++) {
      const targetLength = i * segmentLength;
      
      // Find the segment containing this target length
      while (currentSegmentIndex < shape.length - 1) {
        const nextVertex = shape[(currentSegmentIndex + 1) % shape.length];
        const segmentLen = this.calculateDistance(shape[currentSegmentIndex], nextVertex);
        
        if (currentLength + segmentLen >= targetLength) {
          break;
        }
        
        currentLength += segmentLen;
        currentSegmentIndex++;
      }
      
      // Interpolate within the segment
      const segmentStart = shape[currentSegmentIndex];
      const segmentEnd = shape[(currentSegmentIndex + 1) % shape.length];
      const segmentLen = this.calculateDistance(segmentStart, segmentEnd);
      
      if (segmentLen > 0) {
        const t = (targetLength - currentLength) / segmentLen;
        result.push(this.linearInterpolate(segmentStart, segmentEnd, t));
      } else {
        result.push({ ...segmentStart });
      }
    }
    
    return result;
  }

  /**
   * Interpolation methods
   */
  private linearInterpolate(v1: Vector2D, v2: Vector2D, t: number): Vector2D {
    return {
      x: v1.x + (v2.x - v1.x) * t,
      y: v1.y + (v2.y - v1.y) * t
    };
  }

  private cubicInterpolate(
    v1: Vector2D,
    v2: Vector2D,
    t: number,
    index: number,
    shape1: Vector2D[],
    shape2: Vector2D[]
  ): Vector2D {
    // Get neighboring vertices for cubic interpolation
    const prevIndex = (index - 1 + shape1.length) % shape1.length;
    const nextIndex = (index + 1) % shape1.length;
    
    const p0_1 = shape1[prevIndex];
    const p1_1 = v1;
    const p2_1 = shape1[nextIndex];
    
    const p0_2 = shape2[prevIndex];
    const p1_2 = v2;
    const p2_2 = shape2[nextIndex];
    
    // Cubic interpolation
    const cubicX1 = this.cubicInterpolateValue(p0_1.x, p1_1.x, p2_1.x, t);
    const cubicY1 = this.cubicInterpolateValue(p0_1.y, p1_1.y, p2_1.y, t);
    
    const cubicX2 = this.cubicInterpolateValue(p0_2.x, p1_2.x, p2_2.x, t);
    const cubicY2 = this.cubicInterpolateValue(p0_2.y, p1_2.y, p2_2.y, t);
    
    return {
      x: cubicX1 + (cubicX2 - cubicX1) * t,
      y: cubicY1 + (cubicY2 - cubicY1) * t
    };
  }

  private cubicInterpolateValue(p0: number, p1: number, p2: number, t: number): number {
    const a = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p2;
    const b = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p2;
    const c = -0.5 * p0 + 0.5 * p2;
    const d = p1;
    
    return a * t * t * t + b * t * t + c * t + d;
  }

  private smoothInterpolate(v1: Vector2D, v2: Vector2D, t: number): Vector2D {
    // Smooth step function
    const smoothT = t * t * (3 - 2 * t);
    return this.linearInterpolate(v1, v2, smoothT);
  }

  /**
   * Utility methods
   */
  private calculateDistance(v1: Vector2D, v2: Vector2D): number {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculatePerimeter(shape: Vector2D[]): number {
    let perimeter = 0;
    for (let i = 0; i < shape.length; i++) {
      const current = shape[i];
      const next = shape[(i + 1) % shape.length];
      perimeter += this.calculateDistance(current, next);
    }
    return perimeter;
  }

  private calculateArea(shape: Vector2D[]): number {
    let area = 0;
    for (let i = 0; i < shape.length; i++) {
      const current = shape[i];
      const next = shape[(i + 1) % shape.length];
      area += current.x * next.y - next.x * current.y;
    }
    return Math.abs(area) / 2;
  }

  private normalizeVertices(vertices: Vector2D[]): Vector2D[] {
    if (vertices.length === 0) return [];
    
    // Find bounding box
    let minX = vertices[0].x, maxX = vertices[0].x;
    let minY = vertices[0].y, maxY = vertices[0].y;
    
    vertices.forEach(vertex => {
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxY = Math.max(maxY, vertex.y);
    });
    
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = Math.max(width, height);
    
    if (scale === 0) return vertices.map(v => ({ ...v }));
    
    // Normalize to [-1, 1] range
    return vertices.map(vertex => ({
      x: ((vertex.x - minX) / scale) * 2 - 1,
      y: ((vertex.y - minY) / scale) * 2 - 1
    }));
  }

  private smoothVertices(vertices: Vector2D[]): Vector2D[] {
    if (vertices.length < 3) return vertices;
    
    const smoothed: Vector2D[] = [];
    const factor = this.config.smoothingFactor;
    
    for (let i = 0; i < vertices.length; i++) {
      const prev = vertices[(i - 1 + vertices.length) % vertices.length];
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      
      const smoothedX = current.x * (1 - factor) + 
                       (prev.x + next.x) * factor * 0.5;
      const smoothedY = current.y * (1 - factor) + 
                       (prev.y + next.y) * factor * 0.5;
      
      smoothed.push({ x: smoothedX, y: smoothedY });
    }
    
    return smoothed;
  }

  private preserveShapeArea(morphedShape: Vector2D[], originalShape: Vector2D[]): Vector2D[] {
    const originalArea = this.calculateArea(originalShape);
    const morphedArea = this.calculateArea(morphedShape);
    
    if (morphedArea === 0) return morphedShape;
    
    const scaleFactor = Math.sqrt(originalArea / morphedArea);
    
    // Find centroid
    const centroid = this.calculateCentroid(morphedShape);
    
    // Scale around centroid
    return morphedShape.map(vertex => ({
      x: centroid.x + (vertex.x - centroid.x) * scaleFactor,
      y: centroid.y + (vertex.y - centroid.y) * scaleFactor
    }));
  }

  private calculateCentroid(vertices: Vector2D[]): Vector2D {
    if (vertices.length === 0) return { x: 0, y: 0 };
    
    const sum = vertices.reduce(
      (acc, vertex) => ({
        x: acc.x + vertex.x,
        y: acc.y + vertex.y
      }),
      { x: 0, y: 0 }
    );
    
    return {
      x: sum.x / vertices.length,
      y: sum.y / vertices.length
    };
  }

  /**
   * Get all targets
   */
  getTargets(): MorphTarget[] {
    return Array.from(this.targets.values());
  }

  /**
   * Get target by ID
   */
  getTarget(targetId: string): MorphTarget | undefined {
    return this.targets.get(targetId);
  }

  /**
   * Clear all targets
   */
  clearTargets(): void {
    this.targets.clear();
    this.correspondences.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MorphConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): MorphConfig {
    return { ...this.config };
  }
}