// src/rendering/CanvasRenderer.ts - Optimized Canvas2D wrapper

import { Vector2D, Color } from '../types';
import { CANVAS, PERFORMANCE } from '../utils/constants';

/**
 * Optimized Canvas2D renderer with batching and performance monitoring
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private devicePixelRatio: number;
  private renderQueue: RenderCommand[] = [];
  private isRendering: boolean = false;
  private frameId: number = 0;

  // Performance tracking
  private renderStartTime: number = 0;
  private drawCallCount: number = 0;
  private lastFrameTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // For better performance
      willReadFrequently: false
    });

    if (!context) {
      throw new Error('Could not get 2D rendering context');
    }

    this.ctx = context;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    
    this.setupCanvas();
    this.optimizeContext();
  }

  /**
   * Setup canvas with proper sizing and pixel ratio
   */
  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    // Set actual canvas size in memory (scaled for device pixel ratio)
    this.canvas.width = this.width * this.devicePixelRatio;
    this.canvas.height = this.height * this.devicePixelRatio;

    // Scale the canvas back down using CSS
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    // Scale the drawing context so everything draws at the correct size
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
  }

  /**
   * Optimize context settings for performance
   */
  private optimizeContext(): void {
    // Enable hardware acceleration hints
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set default composite operation
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Set default line properties for better performance
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.miterLimit = 10;
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.setupCanvas();
  }

  /**
   * Start a new frame
   */
  startFrame(): void {
    this.renderStartTime = performance.now();
    this.drawCallCount = 0;
    this.renderQueue = [];
  }

  /**
   * End frame and execute render queue
   */
  endFrame(): void {
    this.executeRenderQueue();
    this.lastFrameTime = performance.now() - this.renderStartTime;
  }

  /**
   * Clear the canvas
   */
  clear(color?: string): void {
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.width, this.height);
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    this.drawCallCount++;
  }

  /**
   * Set global alpha
   */
  setGlobalAlpha(alpha: number): void {
    this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  }

  /**
   * Set composite operation
   */
  setCompositeOperation(operation: GlobalCompositeOperation): void {
    this.ctx.globalCompositeOperation = operation;
  }

  /**
   * Draw a line with optimizations
   */
  drawLine(
    start: Vector2D,
    end: Vector2D,
    color: string,
    width: number = 1,
    batch: boolean = true
  ): void {
    const command: RenderCommand = {
      type: 'line',
      data: { start, end, color, width }
    };

    if (batch) {
      this.renderQueue.push(command);
    } else {
      this.executeLine(command.data);
    }
  }

  /**
   * Draw a circle
   */
  drawCircle(
    center: Vector2D,
    radius: number,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth: number = 1,
    batch: boolean = true
  ): void {
    const command: RenderCommand = {
      type: 'circle',
      data: { center, radius, fillColor, strokeColor, strokeWidth }
    };

    if (batch) {
      this.renderQueue.push(command);
    } else {
      this.executeCircle(command.data);
    }
  }

  /**
   * Draw a polygon
   */
  drawPolygon(
    vertices: Vector2D[],
    fillColor?: string,
    strokeColor?: string,
    strokeWidth: number = 1,
    batch: boolean = true
  ): void {
    const command: RenderCommand = {
      type: 'polygon',
      data: { vertices, fillColor, strokeColor, strokeWidth }
    };

    if (batch) {
      this.renderQueue.push(command);
    } else {
      this.executePolygon(command.data);
    }
  }

  /**
   * Draw a path
   */
  drawPath(
    points: Vector2D[],
    strokeColor: string,
    strokeWidth: number = 1,
    closed: boolean = false,
    batch: boolean = true
  ): void {
    const command: RenderCommand = {
      type: 'path',
      data: { points, strokeColor, strokeWidth, closed }
    };

    if (batch) {
      this.renderQueue.push(command);
    } else {
      this.executePath(command.data);
    }
  }

  /**
   * Draw text
   */
  drawText(
    text: string,
    position: Vector2D,
    font: string,
    color: string,
    align: CanvasTextAlign = 'left',
    baseline: CanvasTextBaseline = 'top',
    batch: boolean = true
  ): void {
    const command: RenderCommand = {
      type: 'text',
      data: { text, position, font, color, align, baseline }
    };

    if (batch) {
      this.renderQueue.push(command);
    } else {
      this.executeText(command.data);
    }
  }

  /**
   * Execute render queue with batching optimizations
   */
  private executeRenderQueue(): void {
    if (this.renderQueue.length === 0) return;

    // Group commands by type for better batching
    const groupedCommands = this.groupCommandsByType(this.renderQueue);

    // Execute grouped commands
    for (const [type, commands] of groupedCommands) {
      this.executeBatchedCommands(type, commands);
    }

    this.renderQueue = [];
  }

  /**
   * Group commands by type for batching
   */
  private groupCommandsByType(commands: RenderCommand[]): Map<string, RenderCommand[]> {
    const groups = new Map<string, RenderCommand[]>();

    for (const command of commands) {
      if (!groups.has(command.type)) {
        groups.set(command.type, []);
      }
      groups.get(command.type)!.push(command);
    }

    return groups;
  }

  /**
   * Execute batched commands of the same type
   */
  private executeBatchedCommands(type: string, commands: RenderCommand[]): void {
    switch (type) {
      case 'line':
        this.executeBatchedLines(commands);
        break;
      case 'circle':
        this.executeBatchedCircles(commands);
        break;
      case 'polygon':
        this.executeBatchedPolygons(commands);
        break;
      case 'path':
        this.executeBatchedPaths(commands);
        break;
      case 'text':
        this.executeBatchedText(commands);
        break;
    }
  }

  /**
   * Execute batched line commands
   */
  private executeBatchedLines(commands: RenderCommand[]): void {
    // Group by color and width for better batching
    const groups = new Map<string, RenderCommand[]>();

    for (const command of commands) {
      const key = `${command.data.color}-${command.data.width}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(command);
    }

    for (const [key, groupCommands] of groups) {
      const firstCommand = groupCommands[0];
      this.ctx.strokeStyle = firstCommand.data.color;
      this.ctx.lineWidth = firstCommand.data.width;

      this.ctx.beginPath();
      for (const command of groupCommands) {
        const { start, end } = command.data;
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
      }
      this.ctx.stroke();
      this.drawCallCount++;
    }
  }

  /**
   * Execute batched circle commands
   */
  private executeBatchedCircles(commands: RenderCommand[]): void {
    for (const command of commands) {
      this.executeCircle(command.data);
    }
  }

  /**
   * Execute batched polygon commands
   */
  private executeBatchedPolygons(commands: RenderCommand[]): void {
    for (const command of commands) {
      this.executePolygon(command.data);
    }
  }

  /**
   * Execute batched path commands
   */
  private executeBatchedPaths(commands: RenderCommand[]): void {
    for (const command of commands) {
      this.executePath(command.data);
    }
  }

  /**
   * Execute batched text commands
   */
  private executeBatchedText(commands: RenderCommand[]): void {
    for (const command of commands) {
      this.executeText(command.data);
    }
  }

  /**
   * Execute individual line command
   */
  private executeLine(data: any): void {
    this.ctx.strokeStyle = data.color;
    this.ctx.lineWidth = data.width;
    this.ctx.beginPath();
    this.ctx.moveTo(data.start.x, data.start.y);
    this.ctx.lineTo(data.end.x, data.end.y);
    this.ctx.stroke();
    this.drawCallCount++;
  }

  /**
   * Execute individual circle command
   */
  private executeCircle(data: any): void {
    this.ctx.beginPath();
    this.ctx.arc(data.center.x, data.center.y, data.radius, 0, Math.PI * 2);

    if (data.fillColor) {
      this.ctx.fillStyle = data.fillColor;
      this.ctx.fill();
    }

    if (data.strokeColor) {
      this.ctx.strokeStyle = data.strokeColor;
      this.ctx.lineWidth = data.strokeWidth;
      this.ctx.stroke();
    }

    this.drawCallCount++;
  }

  /**
   * Execute individual polygon command
   */
  private executePolygon(data: any): void {
    if (data.vertices.length < 3) return;

    this.ctx.beginPath();
    this.ctx.moveTo(data.vertices[0].x, data.vertices[0].y);

    for (let i = 1; i < data.vertices.length; i++) {
      this.ctx.lineTo(data.vertices[i].x, data.vertices[i].y);
    }

    this.ctx.closePath();

    if (data.fillColor) {
      this.ctx.fillStyle = data.fillColor;
      this.ctx.fill();
    }

    if (data.strokeColor) {
      this.ctx.strokeStyle = data.strokeColor;
      this.ctx.lineWidth = data.strokeWidth;
      this.ctx.stroke();
    }

    this.drawCallCount++;
  }

  /**
   * Execute individual path command
   */
  private executePath(data: any): void {
    if (data.points.length < 2) return;

    this.ctx.strokeStyle = data.strokeColor;
    this.ctx.lineWidth = data.strokeWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(data.points[0].x, data.points[0].y);

    for (let i = 1; i < data.points.length; i++) {
      this.ctx.lineTo(data.points[i].x, data.points[i].y);
    }

    if (data.closed) {
      this.ctx.closePath();
    }

    this.ctx.stroke();
    this.drawCallCount++;
  }

  /**
   * Execute individual text command
   */
  private executeText(data: any): void {
    this.ctx.font = data.font;
    this.ctx.fillStyle = data.color;
    this.ctx.textAlign = data.align;
    this.ctx.textBaseline = data.baseline;
    this.ctx.fillText(data.text, data.position.x, data.position.y);
    this.drawCallCount++;
  }

  /**
   * Save canvas state
   */
  save(): void {
    this.ctx.save();
  }

  /**
   * Restore canvas state
   */
  restore(): void {
    this.ctx.restore();
  }

  /**
   * Apply transform
   */
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.ctx.transform(a, b, c, d, e, f);
  }

  /**
   * Set transform
   */
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.ctx.setTransform(a, b, c, d, e, f);
  }

  /**
   * Reset transform
   */
  resetTransform(): void {
    this.ctx.resetTransform();
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    drawCallCount: number;
    lastFrameTime: number;
    renderQueueSize: number;
  } {
    return {
      drawCallCount: this.drawCallCount,
      lastFrameTime: this.lastFrameTime,
      renderQueueSize: this.renderQueue.length
    };
  }

  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Get canvas center point
   */
  getCenter(): Vector2D {
    return { x: this.width / 2, y: this.height / 2 };
  }

  /**
   * Check if point is within canvas bounds
   */
  isPointInBounds(point: Vector2D): boolean {
    return point.x >= 0 && point.x <= this.width && point.y >= 0 && point.y <= this.height;
  }

  /**
   * Export canvas as image
   */
  exportAsImage(format: string = 'png', quality: number = 1): string {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * Get raw canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get raw context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}

/**
 * Render command interface for batching
 */
interface RenderCommand {
  type: string;
  data: any;
}

export default CanvasRenderer;