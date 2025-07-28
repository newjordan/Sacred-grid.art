// src/shapes/MetatronsRenderer.ts - Specialized rendering for Metatron's Cube

import { Vector2D } from '../types';
import CanvasRenderer from '../rendering/CanvasRenderer';
import MetatronsCube from './MetatronsCube';

export interface MetatronsRenderOptions {
  showCircles: boolean;
  showLines: boolean;
  show3DCube: boolean;
  showStarTetrahedron: boolean;
  showFlowerOfLife: boolean;
  animateRotation: boolean;
  colorMode: 'monochrome' | 'rainbow' | 'sacred';
  lineOpacity: number;
  circleOpacity: number;
  glowEffect: boolean;
}

/**
 * Specialized renderer for Metatron's Cube with advanced visualization options
 */
export class MetatronsRenderer {
  private renderer: CanvasRenderer;
  private animationTime: number = 0;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
  }

  /**
   * Render complete Metatron's Cube pattern
   */
  render(
    center: Vector2D,
    radius: number,
    options: MetatronsRenderOptions,
    time: number = 0
  ): void {
    this.animationTime = time;

    // Generate the base pattern
    const circles = MetatronsCube.generate13Circles(center, radius);
    const lines = MetatronsCube.generateCubeLines(circles);
    const colorMapping = MetatronsCube.generateColorMapping();

    // Render in layers for proper depth
    this.renderer.save();

    // 1. Render connecting lines first (background)
    if (options.showLines) {
      this.renderLines(lines, options, colorMapping);
    }

    // 2. Render 3D cube projection
    if (options.show3DCube) {
      this.render3DCube(center, radius * 0.6, options);
    }

    // 3. Render Star Tetrahedron (Merkaba)
    if (options.showStarTetrahedron) {
      this.renderStarTetrahedron(center, radius * 0.8, options);
    }

    // 4. Render Flower of Life overlay
    if (options.showFlowerOfLife) {
      this.renderFlowerOfLife(center, radius, options);
    }

    // 5. Render circles on top
    if (options.showCircles) {
      this.renderCircles(circles, options, colorMapping);
    }

    this.renderer.restore();
  }

  /**
   * Render the 13 circles
   */
  private renderCircles(
    circles: Array<{ center: Vector2D; radius: number; id: string; layer: number }>,
    options: MetatronsRenderOptions,
    colorMapping: any
  ): void {
    circles.forEach(circle => {
      let color = colorMapping.center;
      
      // Assign colors based on layer and options
      switch (options.colorMode) {
        case 'sacred':
          if (circle.layer === 0) color = colorMapping.center;
          else if (circle.layer === 1) color = colorMapping.innerRing;
          else color = colorMapping.outerRing;
          break;
        case 'rainbow':
          const hue = (circle.layer * 120 + this.animationTime * 0.1) % 360;
          color = `hsl(${hue}, 70%, 60%)`;
          break;
        case 'monochrome':
          color = '#ffffff';
          break;
      }

      // Apply glow effect if enabled
      if (options.glowEffect) {
        this.renderer.getContext().shadowColor = color;
        this.renderer.getContext().shadowBlur = 10;
      }

      this.renderer.setGlobalAlpha(options.circleOpacity);
      this.renderer.drawCircle(
        circle.center,
        circle.radius,
        undefined, // No fill
        color,
        2
      );

      // Reset shadow
      if (options.glowEffect) {
        this.renderer.getContext().shadowBlur = 0;
      }
    });
  }

  /**
   * Render connecting lines
   */
  private renderLines(
    lines: Array<{ start: Vector2D; end: Vector2D; type: 'primary' | 'secondary' | 'tertiary' }>,
    options: MetatronsRenderOptions,
    colorMapping: any
  ): void {
    this.renderer.setGlobalAlpha(options.lineOpacity);

    lines.forEach(line => {
      let color = colorMapping.primaryLines;
      let width = 1;

      // Style based on line type
      switch (line.type) {
        case 'primary':
          color = colorMapping.primaryLines;
          width = 2;
          break;
        case 'secondary':
          color = colorMapping.secondaryLines;
          width = 1.5;
          break;
        case 'tertiary':
          color = colorMapping.tertiaryLines;
          width = 1;
          break;
      }

      // Apply color mode
      if (options.colorMode === 'rainbow') {
        const hue = (this.animationTime * 0.05 + line.start.x * 0.01) % 360;
        color = `hsl(${hue}, 70%, 60%)`;
      } else if (options.colorMode === 'monochrome') {
        color = '#ffffff';
      }

      // Apply glow effect
      if (options.glowEffect) {
        this.renderer.getContext().shadowColor = color;
        this.renderer.getContext().shadowBlur = 5;
      }

      this.renderer.drawLine(line.start, line.end, color, width);

      // Reset shadow
      if (options.glowEffect) {
        this.renderer.getContext().shadowBlur = 0;
      }
    });
  }

  /**
   * Render 3D cube projection
   */
  private render3DCube(
    center: Vector2D,
    size: number,
    options: MetatronsRenderOptions
  ): void {
    const rotation = options.animateRotation 
      ? MetatronsCube.generateRotationAnimation(this.animationTime)
      : { rotationX: 0, rotationY: 0, rotationZ: 0 };

    const vertices = MetatronsCube.generate3DCubeProjection(
      center,
      size,
      rotation.rotationX,
      rotation.rotationY,
      rotation.rotationZ
    );

    const edges = MetatronsCube.generateCubeEdges();

    // Create vertex lookup
    const vertexMap = new Map(vertices.map(v => [v.id, v.point]));

    // Render cube edges
    this.renderer.setGlobalAlpha(0.6);
    edges.forEach(edge => {
      const start = vertexMap.get(edge.start);
      const end = vertexMap.get(edge.end);
      
      if (start && end) {
        let color = '#00ffcc';
        
        if (options.colorMode === 'rainbow') {
          const hue = (this.animationTime * 0.1 + start.x * 0.01) % 360;
          color = `hsl(${hue}, 70%, 60%)`;
        } else if (options.colorMode === 'monochrome') {
          color = '#ffffff';
        }

        if (options.glowEffect) {
          this.renderer.getContext().shadowColor = color;
          this.renderer.getContext().shadowBlur = 8;
        }

        this.renderer.drawLine(start, end, color, 1.5);
      }
    });

    // Render vertices
    vertices.forEach(vertex => {
      let color = '#ffffff';
      
      if (options.colorMode === 'rainbow') {
        const hue = (this.animationTime * 0.1 + vertex.point.x * 0.01) % 360;
        color = `hsl(${hue}, 70%, 60%)`;
      }

      this.renderer.drawCircle(vertex.point, 3, color, color, 1);
    });

    // Reset shadow
    if (options.glowEffect) {
      this.renderer.getContext().shadowBlur = 0;
    }
  }

  /**
   * Render Star Tetrahedron (Merkaba)
   */
  private renderStarTetrahedron(
    center: Vector2D,
    size: number,
    options: MetatronsRenderOptions
  ): void {
    const rotation = options.animateRotation ? this.animationTime * 0.02 : 0;
    const { upwardTetrahedron, downwardTetrahedron } = MetatronsCube.generateStarTetrahedron(
      center,
      size,
      rotation
    );

    this.renderer.setGlobalAlpha(0.4);

    // Render upward tetrahedron
    let upColor = '#ff6b6b';
    if (options.colorMode === 'rainbow') {
      upColor = `hsl(${(this.animationTime * 0.1) % 360}, 70%, 60%)`;
    } else if (options.colorMode === 'monochrome') {
      upColor = '#ffffff';
    }

    if (options.glowEffect) {
      this.renderer.getContext().shadowColor = upColor;
      this.renderer.getContext().shadowBlur = 15;
    }

    this.renderer.drawPolygon(upwardTetrahedron, undefined, upColor, 2);

    // Render downward tetrahedron
    let downColor = '#4ecdc4';
    if (options.colorMode === 'rainbow') {
      downColor = `hsl(${(this.animationTime * 0.1 + 180) % 360}, 70%, 60%)`;
    } else if (options.colorMode === 'monochrome') {
      downColor = '#ffffff';
    }

    if (options.glowEffect) {
      this.renderer.getContext().shadowColor = downColor;
      this.renderer.getContext().shadowBlur = 15;
    }

    this.renderer.drawPolygon(downwardTetrahedron, undefined, downColor, 2);

    // Reset shadow
    if (options.glowEffect) {
      this.renderer.getContext().shadowBlur = 0;
    }
  }

  /**
   * Render Flower of Life overlay
   */
  private renderFlowerOfLife(
    center: Vector2D,
    radius: number,
    options: MetatronsRenderOptions
  ): void {
    const flowerCircles = MetatronsCube.generateFlowerOfLife(center, radius, 2);

    this.renderer.setGlobalAlpha(0.2);

    flowerCircles.forEach(circle => {
      let color = '#ffe66d';
      
      if (options.colorMode === 'rainbow') {
        const hue = (this.animationTime * 0.05 + circle.center.x * 0.01) % 360;
        color = `hsl(${hue}, 70%, 60%)`;
      } else if (options.colorMode === 'monochrome') {
        color = '#ffffff';
      }

      this.renderer.drawCircle(
        circle.center,
        circle.radius,
        undefined,
        color,
        1
      );
    });
  }

  /**
   * Update animation time
   */
  updateTime(time: number): void {
    this.animationTime = time;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): { elementsRendered: number; renderTime: number } {
    return {
      elementsRendered: 13 + 24 + 8, // circles + lines + cube vertices
      renderTime: this.renderer.getPerformanceMetrics().lastFrameTime
    };
  }
}

export default MetatronsRenderer;