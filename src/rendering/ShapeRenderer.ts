// src/rendering/ShapeRenderer.ts - Shape-specific rendering with optimizations

import { Vector2D, ShapeConfig, ShapeType } from '../types';
import CanvasRenderer from './CanvasRenderer';
import SacredGeometry from '../math/SacredGeometry';
import GoldenRatio from '../math/GoldenRatio';
import { Transformations } from '../math/Transformations';

/**
 * Specialized renderer for sacred geometry shapes
 */
export class ShapeRenderer {
  private renderer: CanvasRenderer;
  private shapeCache: Map<string, Vector2D[]> = new Map();
  private renderCount: number = 0;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
  }

  /**
   * Render a shape based on its configuration
   */
  renderShape(config: ShapeConfig, center: Vector2D, time: number = 0): void {
    this.renderCount++;

    // Apply global transformations
    this.renderer.save();
    
    // Apply position offset
    const renderCenter = {
      x: center.x + config.position.x,
      y: center.y + config.position.y
    };

    // Apply rotation if specified
    if (config.rotation !== 0) {
      this.renderer.getContext().translate(renderCenter.x, renderCenter.y);
      this.renderer.getContext().rotate(config.rotation);
      this.renderer.getContext().translate(-renderCenter.x, -renderCenter.y);
    }

    // Apply opacity
    this.renderer.setGlobalAlpha(config.opacity);

    // Render based on shape type
    switch (config.type) {
      case ShapeType.POLYGON:
        this.renderPolygon(config, renderCenter, time);
        break;
      case ShapeType.STAR:
        this.renderStar(config, renderCenter, time);
        break;
      case ShapeType.CIRCLE:
        this.renderCircle(config, renderCenter, time);
        break;
      case ShapeType.FLOWER_OF_LIFE:
        this.renderFlowerOfLife(config, renderCenter, time);
        break;
      case ShapeType.MERKABA:
        this.renderMerkaba(config, renderCenter, time);
        break;
      case ShapeType.SPIRAL:
        this.renderSpiral(config, renderCenter, time);
        break;
      case ShapeType.LISSAJOUS:
        this.renderLissajous(config, renderCenter, time);
        break;
      case ShapeType.HEXAGON:
        this.renderHexagon(config, renderCenter, time);
        break;
      case ShapeType.PENTAGON:
        this.renderPentagon(config, renderCenter, time);
        break;
      // New shapes for Phase 3
      case ShapeType.METATRONS_CUBE:
        this.renderMetatronsCube(config, renderCenter, time);
        break;
      case ShapeType.TREE_OF_LIFE:
        this.renderTreeOfLife(config, renderCenter, time);
        break;
      case ShapeType.FIBONACCI_SPIRAL:
        this.renderFibonacciSpiral(config, renderCenter, time);
        break;
      case ShapeType.GOLDEN_RECTANGLE:
        this.renderGoldenRectangle(config, renderCenter, time);
        break;
      case ShapeType.MANDALA:
        this.renderMandala(config, renderCenter, time);
        break;
      default:
        console.warn(`Unknown shape type: ${config.type}`);
    }

    // Render fractal iterations if enabled
    if (config.fractal.depth > 1) {
      this.renderFractal(config, renderCenter, time);
    }

    this.renderer.restore();
  }

  /**
   * Render regular polygon
   */
  private renderPolygon(config: ShapeConfig, center: Vector2D, time: number): void {
    const cacheKey = `polygon-${config.vertices}-${config.size}`;
    let vertices = this.shapeCache.get(cacheKey);

    if (!vertices) {
      vertices = SacredGeometry.regularPolygon(center, config.size, config.vertices || 3);
      this.shapeCache.set(cacheKey, vertices);
    }

    this.renderer.drawPolygon(
      vertices,
      undefined, // No fill
      '#ffffff', // Stroke color (will be overridden by color system)
      config.thickness
    );
  }

  /**
   * Render star polygon
   */
  private renderStar(config: ShapeConfig, center: Vector2D, time: number): void {
    const points = config.vertices || 5;
    const outerRadius = config.size;
    const innerRadius = config.size * 0.4;

    const cacheKey = `star-${points}-${outerRadius}-${innerRadius}`;
    let vertices = this.shapeCache.get(cacheKey);

    if (!vertices) {
      vertices = SacredGeometry.starPolygon(center, outerRadius, innerRadius, points);
      this.shapeCache.set(cacheKey, vertices);
    }

    this.renderer.drawPolygon(
      vertices,
      undefined,
      '#ffffff',
      config.thickness
    );
  }

  /**
   * Render circle
   */
  private renderCircle(config: ShapeConfig, center: Vector2D, time: number): void {
    this.renderer.drawCircle(
      center,
      config.size,
      undefined, // No fill
      '#ffffff',
      config.thickness
    );
  }

  /**
   * Render Flower of Life
   */
  private renderFlowerOfLife(config: ShapeConfig, center: Vector2D, time: number): void {
    const circles = SacredGeometry.flowerOfLife(center, config.size / 6, 2);
    
    for (const circle of circles) {
      this.renderer.drawCircle(
        circle.center,
        circle.radius,
        undefined,
        '#ffffff',
        config.thickness
      );
    }
  }

  /**
   * Render Merkaba (3D star tetrahedron projected to 2D)
   */
  private renderMerkaba(config: ShapeConfig, center: Vector2D, time: number): void {
    // Create 3D vertices
    const vertices3D = SacredGeometry.merkaba({ x: center.x, y: center.y, z: 0 }, config.size);
    
    // Project to 2D with rotation
    const rotationY = time * 0.01;
    const rotationX = time * 0.007;
    
    const projectedVertices = vertices3D.map(vertex => {
      // Apply 3D rotations
      const rotated = Transformations.transformPoint({
        x: vertex.x - center.x,
        y: vertex.y - center.y
      }, [
        { type: 'rotate', params: { center: { x: 0, y: 0 }, angle: rotationY } }
      ]);
      
      return {
        x: rotated.x + center.x,
        y: rotated.y + center.y
      };
    });

    // Draw upper tetrahedron
    const upperTetrahedron = projectedVertices.slice(0, 4);
    this.renderer.drawPolygon(upperTetrahedron, undefined, '#ffffff', config.thickness);

    // Draw lower tetrahedron
    const lowerTetrahedron = projectedVertices.slice(4, 8);
    this.renderer.drawPolygon(lowerTetrahedron, undefined, '#ffffff', config.thickness);
  }

  /**
   * Render spiral
   */
  private renderSpiral(config: ShapeConfig, center: Vector2D, time: number): void {
    const points = SacredGeometry.spiral(center, config.size * 0.1, config.size * 0.01, 3);
    
    this.renderer.drawPath(points, '#ffffff', config.thickness);
  }

  /**
   * Render Lissajous curve
   */
  private renderLissajous(config: ShapeConfig, center: Vector2D, time: number): void {
    const amplitude = { x: config.size, y: config.size };
    const frequency = { x: 3, y: 2 };
    const phase = time * 0.01;
    
    const points = SacredGeometry.lissajous(center, amplitude, frequency, phase);
    
    this.renderer.drawPath(points, '#ffffff', config.thickness);
  }

  /**
   * Render hexagon
   */
  private renderHexagon(config: ShapeConfig, center: Vector2D, time: number): void {
    const vertices = SacredGeometry.regularPolygon(center, config.size, 6);
    this.renderer.drawPolygon(vertices, undefined, '#ffffff', config.thickness);
  }

  /**
   * Render pentagon
   */
  private renderPentagon(config: ShapeConfig, center: Vector2D, time: number): void {
    const vertices = SacredGeometry.regularPolygon(center, config.size, 5);
    this.renderer.drawPolygon(vertices, undefined, '#ffffff', config.thickness);
  }

  /**
   * Render Metatron's Cube
   */
  private renderMetatronsCube(config: ShapeConfig, center: Vector2D, time: number): void {
    const circles = SacredGeometry.metatronsCube(center, config.size);
    
    // Draw circles
    for (const circle of circles) {
      this.renderer.drawCircle(
        circle.center,
        circle.radius,
        undefined,
        '#ffffff',
        config.thickness * 0.5
      );
    }

    // Draw connecting lines (simplified version)
    const centralCircle = circles[0];
    for (let i = 1; i < circles.length; i++) {
      this.renderer.drawLine(
        centralCircle.center,
        circles[i].center,
        '#ffffff',
        config.thickness * 0.3
      );
    }
  }

  /**
   * Render Tree of Life (simplified version)
   */
  private renderTreeOfLife(config: ShapeConfig, center: Vector2D, time: number): void {
    // Simplified Tree of Life with 10 Sephirot
    const sephirotPositions = [
      { x: 0, y: -config.size * 0.8 }, // Kether
      { x: -config.size * 0.3, y: -config.size * 0.5 }, // Chokmah
      { x: config.size * 0.3, y: -config.size * 0.5 }, // Binah
      { x: -config.size * 0.5, y: -config.size * 0.1 }, // Chesed
      { x: config.size * 0.5, y: -config.size * 0.1 }, // Geburah
      { x: 0, y: 0 }, // Tiphareth
      { x: -config.size * 0.3, y: config.size * 0.3 }, // Netzach
      { x: config.size * 0.3, y: config.size * 0.3 }, // Hod
      { x: 0, y: config.size * 0.5 }, // Yesod
      { x: 0, y: config.size * 0.8 } // Malkuth
    ];

    const sephirotRadius = config.size * 0.08;

    // Draw Sephirot (circles)
    for (const pos of sephirotPositions) {
      this.renderer.drawCircle(
        { x: center.x + pos.x, y: center.y + pos.y },
        sephirotRadius,
        undefined,
        '#ffffff',
        config.thickness
      );
    }

    // Draw paths (simplified connections)
    const connections = [
      [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5],
      [5, 6], [5, 7], [5, 8], [6, 7], [6, 8], [7, 8], [8, 9]
    ];

    for (const [from, to] of connections) {
      this.renderer.drawLine(
        { x: center.x + sephirotPositions[from].x, y: center.y + sephirotPositions[from].y },
        { x: center.x + sephirotPositions[to].x, y: center.y + sephirotPositions[to].y },
        '#ffffff',
        config.thickness * 0.5
      );
    }
  }

  /**
   * Render Fibonacci spiral
   */
  private renderFibonacciSpiral(config: ShapeConfig, center: Vector2D, time: number): void {
    const points = GoldenRatio.goldenSpiral(center, config.size * 0.1, 3);
    this.renderer.drawPath(points, '#ffffff', config.thickness);
  }

  /**
   * Render Golden Rectangle
   */
  private renderGoldenRectangle(config: ShapeConfig, center: Vector2D, time: number): void {
    const rectangles = GoldenRatio.subdivideGoldenRectangle(
      center.x - config.size / 2,
      center.y - config.size / (2 * GoldenRatio.PHI),
      config.size,
      config.size / GoldenRatio.PHI,
      3
    );

    for (const rect of rectangles) {
      const vertices = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height }
      ];
      
      this.renderer.drawPolygon(vertices, undefined, '#ffffff', config.thickness);
    }
  }

  /**
   * Render Mandala
   */
  private renderMandala(config: ShapeConfig, center: Vector2D, time: number): void {
    const patterns = SacredGeometry.mandala(center, config.size, config.vertices || 8, 3);
    
    for (const pattern of patterns) {
      this.renderer.drawPolygon(pattern.points, undefined, '#ffffff', config.thickness);
    }
  }

  /**
   * Render fractal iterations
   */
  private renderFractal(config: ShapeConfig, center: Vector2D, time: number): void {
    const generateFractalLevel = (
      levelCenter: Vector2D,
      levelSize: number,
      levelThickness: number,
      depth: number
    ) => {
      if (depth <= 0) return;

      // Create smaller version of the shape
      const fractalConfig = {
        ...config,
        size: levelSize,
        thickness: levelThickness,
        fractal: { ...config.fractal, depth: 1 } // Prevent infinite recursion
      };

      // Render at current level
      this.renderShape(fractalConfig, levelCenter, time);

      // Generate child fractals
      if (depth > 1) {
        const childSize = levelSize * config.fractal.scale;
        const childThickness = levelThickness * config.fractal.thicknessFalloff;
        const childCount = config.fractal.childCount;

        for (let i = 0; i < childCount; i++) {
          const angle = (i / childCount) * Math.PI * 2;
          const distance = levelSize * (config.fractal.sacredPositioning ? GoldenRatio.PHI : 1);
          
          const childCenter = {
            x: levelCenter.x + Math.cos(angle) * distance,
            y: levelCenter.y + Math.sin(angle) * distance
          };

          generateFractalLevel(childCenter, childSize, childThickness, depth - 1);
        }
      }
    };

    generateFractalLevel(center, config.size, config.thickness, config.fractal.depth - 1);
  }

  /**
   * Clear shape cache
   */
  clearCache(): void {
    this.shapeCache.clear();
  }

  /**
   * Get render statistics
   */
  getRenderStats(): { renderCount: number; cacheSize: number } {
    return {
      renderCount: this.renderCount,
      cacheSize: this.shapeCache.size
    };
  }

  /**
   * Reset render count
   */
  resetRenderCount(): void {
    this.renderCount = 0;
  }
}

export default ShapeRenderer;