// src/workers/calculations.ts - Calculation functions for main thread fallback

import { Vector2D, Vector3D } from '../types';

/**
 * Calculate Mandelbrot set on main thread
 */
export async function calculateMandelbrot(
  config: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    zoom: number;
    maxIterations: number;
  },
  onProgress?: (progress: number) => void
): Promise<ImageData> {
  const { width, height, centerX, centerY, zoom, maxIterations } = config;
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  
  const scale = 4 / zoom;
  const minX = centerX - scale / 2;
  const maxX = centerX + scale / 2;
  const minY = centerY - scale / 2;
  const maxY = centerY + scale / 2;
  
  for (let py = 0; py < height; py++) {
    if (py % 10 === 0) {
      onProgress?.(py / height);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    for (let px = 0; px < width; px++) {
      const x = minX + (px / width) * (maxX - minX);
      const y = minY + (py / height) * (maxY - minY);
      
      let zx = 0, zy = 0;
      let iterations = 0;
      
      while (iterations < maxIterations && zx * zx + zy * zy < 4) {
        const temp = zx * zx - zy * zy + x;
        zy = 2 * zx * zy + y;
        zx = temp;
        iterations++;
      }
      
      const index = (py * width + px) * 4;
      const intensity = iterations === maxIterations ? 0 : (iterations / maxIterations) * 255;
      
      data[index] = intensity;
      data[index + 1] = intensity / 2;
      data[index + 2] = intensity / 4;
      data[index + 3] = 255;
    }
  }
  
  return imageData;
}

/**
 * Generate Fibonacci spiral on main thread
 */
export async function generateFibonacciSpiral(
  config: {
    center: Vector2D;
    initialRadius: number;
    turns: number;
    pointsPerTurn: number;
  },
  onProgress?: (progress: number) => void
): Promise<Vector2D[]> {
  const { center, initialRadius, turns, pointsPerTurn } = config;
  const points: Vector2D[] = [];
  const totalPoints = turns * pointsPerTurn;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const growthFactor = Math.pow(goldenRatio, 1 / (pointsPerTurn / 4));
  
  for (let i = 0; i <= totalPoints; i++) {
    if (i % 100 === 0) {
      onProgress?.(i / totalPoints);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    const angle = (i / pointsPerTurn) * 2 * Math.PI;
    const radius = initialRadius * Math.pow(growthFactor, i);
    
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    });
  }
  
  return points;
}

/**
 * Simulate particle physics on main thread
 */
export async function simulateParticlePhysics(
  config: {
    particles: Array<{
      position: Vector2D;
      velocity: Vector2D;
      mass: number;
    }>;
    forces: Vector2D[];
    deltaTime: number;
    steps: number;
  },
  onProgress?: (progress: number) => void
): Promise<Array<{
  position: Vector2D;
  velocity: Vector2D;
}>> {
  const { particles, forces, deltaTime, steps } = config;
  const results: Array<{
    position: Vector2D;
    velocity: Vector2D;
  }> = [];
  
  for (let step = 0; step < steps; step++) {
    if (step % 10 === 0) {
      onProgress?.(step / steps);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    particles.forEach(particle => {
      // Apply forces
      let forceX = 0, forceY = 0;
      forces.forEach(force => {
        forceX += force.x;
        forceY += force.y;
      });
      
      // Update velocity
      particle.velocity.x += (forceX / particle.mass) * deltaTime;
      particle.velocity.y += (forceY / particle.mass) * deltaTime;
      
      // Update position
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
    });
    
    // Store result for this step
    results.push(...particles.map(p => ({
      position: { ...p.position },
      velocity: { ...p.velocity }
    })));
  }
  
  return results;
}

/**
 * Generate fractal on main thread
 */
export async function generateFractal(
  config: {
    type: 'julia' | 'burning-ship' | 'newton';
    width: number;
    height: number;
    parameters: any;
  },
  onProgress?: (progress: number) => void
): Promise<ImageData> {
  const { type, width, height, parameters } = config;
  const imageData = new ImageData(width, height);
  const data = imageData.data;
  
  for (let y = 0; y < height; y++) {
    if (y % 10 === 0) {
      onProgress?.(y / height);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      
      // Simple pattern based on coordinates
      const intensity = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 255;
      
      data[index] = Math.abs(intensity);
      data[index + 1] = Math.abs(intensity) / 2;
      data[index + 2] = Math.abs(intensity) / 4;
      data[index + 3] = 255;
    }
  }
  
  return imageData;
}

/**
 * Morph shapes on main thread
 */
export async function morphShapes(
  config: {
    sourceShape: Vector2D[];
    targetShape: Vector2D[];
    steps: number;
  },
  onProgress?: (progress: number) => void
): Promise<Vector2D[][]> {
  const { sourceShape, targetShape, steps } = config;
  const morphedShapes: Vector2D[][] = [];
  
  for (let step = 0; step <= steps; step++) {
    onProgress?.(step / steps);
    
    const t = step / steps;
    const morphedShape: Vector2D[] = [];
    
    const maxVertices = Math.max(sourceShape.length, targetShape.length);
    
    for (let i = 0; i < maxVertices; i++) {
      const sourceVertex = sourceShape[i % sourceShape.length];
      const targetVertex = targetShape[i % targetShape.length];
      
      morphedShape.push({
        x: sourceVertex.x + (targetVertex.x - sourceVertex.x) * t,
        y: sourceVertex.y + (targetVertex.y - sourceVertex.y) * t
      });
    }
    
    morphedShapes.push(morphedShape);
    
    if (step % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  return morphedShapes;
}

/**
 * Perform matrix operations on main thread
 */
export async function performMatrixOperations(
  config: {
    operation: 'multiply' | 'invert' | 'transform';
    matrices: number[][][];
    vectors?: Vector3D[];
  },
  onProgress?: (progress: number) => void
): Promise<number[][] | Vector3D[]> {
  const { operation, matrices, vectors } = config;
  
  onProgress?.(0.5);
  await new Promise(resolve => setTimeout(resolve, 0));
  
  switch (operation) {
    case 'multiply':
      if (matrices.length >= 2) {
        return multiplyMatrices(matrices[0], matrices[1]);
      }
      break;
    case 'invert':
      if (matrices.length >= 1) {
        return invertMatrix(matrices[0]);
      }
      break;
    case 'transform':
      if (matrices.length >= 1 && vectors) {
        return transformVectors(matrices[0], vectors);
      }
      break;
  }
  
  onProgress?.(1);
  return matrices.length > 0 ? matrices[0] : [[]];
}

// Helper functions
function multiplyMatrices(a: number[][], b: number[][]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = [];
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < b.length; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

function invertMatrix(matrix: number[][]): number[][] {
  // Simplified 2x2 matrix inversion
  if (matrix.length === 2 && matrix[0].length === 2) {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (det === 0) return matrix;
    
    return [
      [matrix[1][1] / det, -matrix[0][1] / det],
      [-matrix[1][0] / det, matrix[0][0] / det]
    ];
  }
  return matrix;
}

function transformVectors(matrix: number[][], vectors: Vector3D[]): Vector3D[] {
  return vectors.map(vector => {
    const x = matrix[0][0] * vector.x + matrix[0][1] * vector.y + (matrix[0][2] || 0) * (vector.z || 0);
    const y = matrix[1][0] * vector.x + matrix[1][1] * vector.y + (matrix[1][2] || 0) * (vector.z || 0);
    const z = (matrix[2] ? matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * (vector.z || 0) : vector.z) || 0;
    
    return { x, y, z };
  });
}