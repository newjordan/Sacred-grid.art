// src/workers/CalculationWorker.ts - Web Worker for heavy calculations

import { Vector2D, Vector3D } from '../types';

/**
 * Worker message types
 */
export type WorkerMessageType = 
  | 'mandelbrot'
  | 'fibonacci-spiral'
  | 'particle-physics'
  | 'fractal-generation'
  | 'shape-morphing'
  | 'matrix-operations';

/**
 * Worker message structure
 */
export interface WorkerMessage {
  id: string;
  type: WorkerMessageType;
  data: any;
}

/**
 * Worker response structure
 */
export interface WorkerResponse {
  id: string;
  type: WorkerMessageType;
  result?: any;
  error?: string;
  progress?: number;
}

/**
 * Calculation worker manager
 */
export class CalculationWorker {
  private worker: Worker | null = null;
  private pendingTasks: Map<string, {
    resolve: (result: any) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: number) => void;
  }> = new Map();
  private taskCounter = 0;

  constructor() {
    this.initializeWorker();
  }

  /**
   * Initialize the web worker
   */
  private initializeWorker(): void {
    // Create worker from inline script
    const workerScript = this.createWorkerScript();
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    try {
      this.worker = new Worker(workerUrl);
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
    } catch (error) {
      console.warn('Web Worker not supported, falling back to main thread');
      this.worker = null;
    } finally {
      URL.revokeObjectURL(workerUrl);
    }
  }

  /**
   * Handle worker messages
   */
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const response = event.data;
    const task = this.pendingTasks.get(response.id);
    
    if (!task) return;

    if (response.progress !== undefined) {
      // Progress update
      task.onProgress?.(response.progress);
    } else if (response.error) {
      // Error response
      task.reject(new Error(response.error));
      this.pendingTasks.delete(response.id);
    } else {
      // Success response
      task.resolve(response.result);
      this.pendingTasks.delete(response.id);
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error);
    
    // Reject all pending tasks
    this.pendingTasks.forEach(task => {
      task.reject(new Error('Worker error: ' + error.message));
    });
    this.pendingTasks.clear();
  }

  /**
   * Send task to worker or execute on main thread
   */
  private async executeTask<T>(
    type: WorkerMessageType,
    data: any,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    if (this.worker) {
      return this.executeOnWorker<T>(type, data, onProgress);
    } else {
      return this.executeOnMainThread<T>(type, data, onProgress);
    }
  }

  /**
   * Execute task on worker thread
   */
  private executeOnWorker<T>(
    type: WorkerMessageType,
    data: any,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskId = `task_${this.taskCounter++}`;
      
      this.pendingTasks.set(taskId, {
        resolve,
        reject,
        onProgress
      });

      const message: WorkerMessage = {
        id: taskId,
        type,
        data
      };

      this.worker!.postMessage(message);
    });
  }

  /**
   * Execute task on main thread (fallback)
   */
  private async executeOnMainThread<T>(
    type: WorkerMessageType,
    data: any,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    // Import calculation functions dynamically to avoid blocking
    const calculations = await import('./calculations');
    
    switch (type) {
      case 'mandelbrot':
        return calculations.calculateMandelbrot(data, onProgress) as T;
      case 'fibonacci-spiral':
        return calculations.generateFibonacciSpiral(data, onProgress) as T;
      case 'particle-physics':
        return calculations.simulateParticlePhysics(data, onProgress) as T;
      case 'fractal-generation':
        return calculations.generateFractal(data, onProgress) as T;
      case 'shape-morphing':
        return calculations.morphShapes(data, onProgress) as T;
      case 'matrix-operations':
        return calculations.performMatrixOperations(data, onProgress) as T;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Calculate Mandelbrot set
   */
  async calculateMandelbrot(
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
    return this.executeTask('mandelbrot', config, onProgress);
  }

  /**
   * Generate Fibonacci spiral
   */
  async generateFibonacciSpiral(
    config: {
      center: Vector2D;
      initialRadius: number;
      turns: number;
      pointsPerTurn: number;
    },
    onProgress?: (progress: number) => void
  ): Promise<Vector2D[]> {
    return this.executeTask('fibonacci-spiral', config, onProgress);
  }

  /**
   * Simulate particle physics
   */
  async simulateParticlePhysics(
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
    return this.executeTask('particle-physics', config, onProgress);
  }

  /**
   * Generate fractal patterns
   */
  async generateFractal(
    config: {
      type: 'julia' | 'burning-ship' | 'newton';
      width: number;
      height: number;
      parameters: any;
    },
    onProgress?: (progress: number) => void
  ): Promise<ImageData> {
    return this.executeTask('fractal-generation', config, onProgress);
  }

  /**
   * Morph between shapes
   */
  async morphShapes(
    config: {
      sourceShape: Vector2D[];
      targetShape: Vector2D[];
      steps: number;
    },
    onProgress?: (progress: number) => void
  ): Promise<Vector2D[][]> {
    return this.executeTask('shape-morphing', config, onProgress);
  }

  /**
   * Perform matrix operations
   */
  async performMatrixOperations(
    config: {
      operation: 'multiply' | 'invert' | 'transform';
      matrices: number[][];
      vectors?: Vector3D[];
    },
    onProgress?: (progress: number) => void
  ): Promise<number[][] | Vector3D[]> {
    return this.executeTask('matrix-operations', config, onProgress);
  }

  /**
   * Cancel all pending tasks
   */
  cancelAllTasks(): void {
    this.pendingTasks.forEach(task => {
      task.reject(new Error('Task cancelled'));
    });
    this.pendingTasks.clear();
  }

  /**
   * Terminate worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.cancelAllTasks();
  }

  /**
   * Check if worker is available
   */
  isWorkerAvailable(): boolean {
    return this.worker !== null;
  }

  /**
   * Get pending task count
   */
  getPendingTaskCount(): number {
    return this.pendingTasks.size;
  }

  /**
   * Create worker script as string
   */
  private createWorkerScript(): string {
    return `
      // Web Worker script for heavy calculations
      
      // Import calculation functions (would be bundled in real implementation)
      ${this.getCalculationFunctions()}
      
      self.onmessage = function(event) {
        const message = event.data;
        
        try {
          executeTask(message.id, message.type, message.data);
        } catch (error) {
          self.postMessage({
            id: message.id,
            type: message.type,
            error: error.message
          });
        }
      };
      
      async function executeTask(id, type, data) {
        const onProgress = (progress) => {
          self.postMessage({
            id,
            type,
            progress
          });
        };
        
        let result;
        
        switch (type) {
          case 'mandelbrot':
            result = await calculateMandelbrot(data, onProgress);
            break;
          case 'fibonacci-spiral':
            result = await generateFibonacciSpiral(data, onProgress);
            break;
          case 'particle-physics':
            result = await simulateParticlePhysics(data, onProgress);
            break;
          case 'fractal-generation':
            result = await generateFractal(data, onProgress);
            break;
          case 'shape-morphing':
            result = await morphShapes(data, onProgress);
            break;
          case 'matrix-operations':
            result = await performMatrixOperations(data, onProgress);
            break;
          default:
            throw new Error('Unknown task type: ' + type);
        }
        
        self.postMessage({
          id,
          type,
          result
        });
      }
    `;
  }

  /**
   * Get calculation functions as string (for worker)
   */
  private getCalculationFunctions(): string {
    return `
      // Mandelbrot calculation
      async function calculateMandelbrot(config, onProgress) {
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
            onProgress(py / height);
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
      
      // Fibonacci spiral generation
      async function generateFibonacciSpiral(config, onProgress) {
        const { center, initialRadius, turns, pointsPerTurn } = config;
        const points = [];
        const totalPoints = turns * pointsPerTurn;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const growthFactor = Math.pow(goldenRatio, 1 / (pointsPerTurn / 4));
        
        for (let i = 0; i <= totalPoints; i++) {
          if (i % 100 === 0) {
            onProgress(i / totalPoints);
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
      
      // Particle physics simulation
      async function simulateParticlePhysics(config, onProgress) {
        const { particles, forces, deltaTime, steps } = config;
        const results = [];
        
        for (let step = 0; step < steps; step++) {
          if (step % 10 === 0) {
            onProgress(step / steps);
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
          results.push(particles.map(p => ({
            position: { ...p.position },
            velocity: { ...p.velocity }
          })));
        }
        
        return results;
      }
      
      // Fractal generation
      async function generateFractal(config, onProgress) {
        // Simplified fractal generation
        const { type, width, height, parameters } = config;
        const imageData = new ImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
          if (y % 10 === 0) {
            onProgress(y / height);
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
      
      // Shape morphing
      async function morphShapes(config, onProgress) {
        const { sourceShape, targetShape, steps } = config;
        const morphedShapes = [];
        
        for (let step = 0; step <= steps; step++) {
          onProgress(step / steps);
          
          const t = step / steps;
          const morphedShape = [];
          
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
      
      // Matrix operations
      async function performMatrixOperations(config, onProgress) {
        const { operation, matrices, vectors } = config;
        
        onProgress(0.5);
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Simplified matrix operations
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
        
        onProgress(1);
        return matrices[0] || [];
      }
      
      // Helper functions
      function multiplyMatrices(a, b) {
        const result = [];
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
      
      function invertMatrix(matrix) {
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
      
      function transformVectors(matrix, vectors) {
        return vectors.map(vector => {
          const x = matrix[0][0] * vector.x + matrix[0][1] * vector.y + (matrix[0][2] || 0) * (vector.z || 0);
          const y = matrix[1][0] * vector.x + matrix[1][1] * vector.y + (matrix[1][2] || 0) * (vector.z || 0);
          const z = (matrix[2] ? matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * (vector.z || 0) : vector.z) || 0;
          
          return { x, y, z };
        });
      }
    `;
  }
}

// Export singleton instance
export const calculationWorker = new CalculationWorker();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    calculationWorker.terminate();
  });
}